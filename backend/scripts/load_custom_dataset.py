"""
Custom CSV Data Loader for student_dataset_450.csv

This script loads the custom student dataset with fields:
ID, Name, Father_Name, Mother_Name, Address, College, CGPA, 
Sem1_GPA, Sem2_GPA, Attendance_%, Department, Subject1-3, MID1_Subject1-3

Maps these fields to the database models and ML features.
"""

import sys
from pathlib import Path
import pandas as pd
from datetime import datetime, timedelta
import random
import numpy as np

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.models import Student, StudentMetric, Department, Section
from loguru import logger


# Department mapping from CSV to enum
DEPARTMENT_MAPPING = {
    'CSE': Department.CSE,
    'CSIT': Department.DATA_SCIENCE,  # CSIT mapped to Data Science
    'ECE': Department.ECE,
    'EEE': Department.MECHANICAL,  # EEE mapped to Mechanical
    'AIDS': Department.AI_DS,
    'CIVIL': Department.CIVIL,
    'AEROSPACE': Department.AEROSPACE
}


def calculate_engagement_score(row: pd.Series) -> float:
    """
    Calculate engagement score from MID exam scores.
    
    Formula: Average of all MID scores normalized to 0-100 scale
    MID scores are typically out of 30, normalize to percentage.
    """
    mid_cols = ['MID1_Subject1', 'MID1_Subject2', 'MID1_Subject3']
    mid_scores = []
    
    for col in mid_cols:
        if col in row and pd.notna(row[col]):
            # Normalize to 0-100 (assuming MID is out of 30)
            normalized = (float(row[col]) / 30.0) * 100
            mid_scores.append(normalized)
    
    if mid_scores:
        return np.mean(mid_scores)
    return 50.0  # Default if no scores available


def calculate_academic_performance_index(row: pd.Series) -> float:
    """
    Calculate academic performance index from GPAs.
    
    Formula: Weighted average (CGPA * 0.5 + Sem1_GPA * 0.25 + Sem2_GPA * 0.25) / 10
    This gives a 0-10 scale which matches the expected academic_performance_index.
    """
    cgpa = float(row.get('CGPA', 0))
    sem1_gpa = float(row.get('Sem1_GPA', 0))
    sem2_gpa = float(row.get('Sem2_GPA', 0))
    
    weighted_gpa = (cgpa * 0.5) + (sem1_gpa * 0.25) + (sem2_gpa * 0.25)
    
    # Convert to 0-10 scale (assuming input is already on 10-point scale)
    return weighted_gpa / 10.0 if weighted_gpa > 0 else 0.0


def calculate_failure_ratio(cgpa: float, attendance_rate: float) -> float:
    """
    Estimate failure ratio based on CGPA and attendance.
    
    Lower CGPA and attendance suggest higher failure ratio.
    """
    if cgpa >= 8.5 and attendance_rate >= 80:
        return 0.0
    elif cgpa >= 7.0 and attendance_rate >= 70:
        return random.uniform(0.0, 0.1)
    elif cgpa >= 6.0 and attendance_rate >= 60:
        return random.uniform(0.1, 0.2)
    elif cgpa >= 5.0:
        return random.uniform(0.2, 0.4)
    else:
        return random.uniform(0.4, 0.6)


def calculate_semester_performance_trend(row: pd.Series) -> float:
    """
    Calculate semester performance trend.
    
    Formula: ((Sem2_GPA - Sem1_GPA) / Sem1_GPA) * 100
    Positive = improving, Negative = declining
    """
    sem1 = float(row.get('Sem1_GPA', 0))
    sem2 = float(row.get('Sem2_GPA', 0))
    
    if sem1 > 0:
        trend = ((sem2 - sem1) / sem1) * 100
        return trend
    return 0.0


def generate_login_gap_days(engagement_score: float, attendance_rate: float) -> int:
    """
    Generate synthetic login gap days based on engagement and attendance.
    
    Higher engagement/attendance = lower gap days
    """
    if engagement_score >= 80 and attendance_rate >= 80:
        return random.randint(0, 3)
    elif engagement_score >= 60 and attendance_rate >= 60:
        return random.randint(3, 7)
    elif engagement_score >= 40:
        return random.randint(7, 14)
    else:
        return random.randint(14, 30)


def generate_financial_risk_flag(address: str) -> bool:
    """
    Generate synthetic financial risk flag based on location.
    
    Simplified: Some states may have higher/lower financial risk
    """
    high_risk_states = ['West Bengal', 'Rajasthan', 'Gujarat']
    return address in high_risk_states


def generate_commute_risk_score(address: str, college: str) -> int:
    """
    Generate commute risk score (1-4) based on location.
    
    Assumption: Students from same state as college have lower commute risk
    """
    if 'Andhra Pradesh' in address or 'Telangana' in address:
        return random.choice([1, 2])  # Local students
    else:
        return random.choice([2, 3, 4])  # Non-local students


def load_custom_dataset(csv_path: str, db: SessionLocal):
    """
    Load custom CSV dataset into database.
    
    Args:
        csv_path: Path to student_dataset_450.csv
        db: Database session
    """
    logger.info(f"Loading custom dataset from {csv_path}")
    
    try:
        df = pd.read_csv(csv_path)
        logger.info(f"Loaded {len(df)} students from CSV")
        
        students_created = 0
        
        for idx, row in df.iterrows():
            try:
                # Extract basic info
                student_id = str(row['ID'])
                name = row['Name']
                department_str = row['Department']
                
                # Map department
                if department_str not in DEPARTMENT_MAPPING:
                    logger.warning(f"Unknown department '{department_str}' for student {student_id}, defaulting to CSE")
                    department = Department.CSE
                else:
                    department = DEPARTMENT_MAPPING[department_str]
                
                # Random section
                section = random.choice(list(Section))
                
                # Generate avatar (initials)
                avatar = ''.join([word[0].upper() for word in name.split()[:2]])
                
                # Course name
                course = f"B.Tech {department_str}"
                
                # Calculate features
                attendance_rate = float(row['Attendance_%'])
                engagement_score = calculate_engagement_score(row)
                academic_performance_index = calculate_academic_performance_index(row)
                cgpa = float(row['CGPA'])
                
                # Generate synthetic features
                failure_ratio = calculate_failure_ratio(cgpa, attendance_rate)
                semester_performance_trend = calculate_semester_performance_trend(row)
                login_gap_days = generate_login_gap_days(engagement_score, attendance_rate)
                financial_risk_flag = generate_financial_risk_flag(row['Address'])
                commute_risk_score = generate_commute_risk_score(row['Address'], row['College'])
                
                # Calculate last interaction based on engagement
                days_ago = login_gap_days
                last_interaction = datetime.utcnow() - timedelta(days=days_ago)
                
                # Create student record
                student = Student(
                    id=student_id,
                    name=name,
                    avatar=avatar,
                    course=course,
                    department=department,
                    section=section,
                    advisor_id=None  # Will be assigned later
                )
                
                db.add(student)
                
                # Create student metrics
                student_metric = StudentMetric(
                    student_id=student_id,
                    attendance_rate=attendance_rate,
                    engagement_score=engagement_score,
                    academic_performance_index=academic_performance_index,
                    login_gap_days=login_gap_days,
                    failure_ratio=failure_ratio,
                    financial_risk_flag=financial_risk_flag,
                    commute_risk_score=commute_risk_score,
                    semester_performance_trend=semester_performance_trend,
                    last_interaction=last_interaction
                )
                
                db.add(student_metric)
                
                students_created += 1
                
                if students_created % 50 == 0:
                    logger.info(f"Processed {students_created} students...")
                    
            except Exception as e:
                logger.error(f"Failed to process row {idx} (ID: {row.get('ID', 'unknown')}): {e}")
                continue
        
        # Commit all changes
        db.commit()
        logger.info(f"✓ Successfully loaded {students_created} students into database")
        
        return students_created
        
    except Exception as e:
        logger.error(f"Failed to load dataset: {e}")
        db.rollback()
        raise


def main():
    """Main execution."""
    logger.info("=" * 60)
    logger.info("Custom Student Dataset Loader")
    logger.info("=" * 60)
    
    # Path to custom dataset
    dataset_path = Path(__file__).parent.parent / "data" / "raw" / "student_dataset_450.csv"
    
    if not dataset_path.exists():
        logger.error(f"Dataset not found at {dataset_path}")
        sys.exit(1)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Clear existing data in the correct order (delete dependent tables first)
        logger.warning("Clearing existing student data...")
        
        # Import User model
        from app.models import User
        
        # Delete in correct order: users -> student_metrics -> students
        db.query(User).filter(User.student_id.isnot(None)).delete(synchronize_session=False)
        db.query(StudentMetric).delete(synchronize_session=False)
        db.query(Student).delete(synchronize_session=False)
        db.commit()
        
        # Load custom dataset
        students_created = load_custom_dataset(str(dataset_path), db)
        
        logger.info("=" * 60)
        logger.info(f"✓ Loaded {students_created} students successfully!")
        logger.info("=" * 60)
        logger.info("Next step: Run 'python scripts/train_model.py' to train the ML model")
        
    except Exception as e:
        logger.error(f"Dataset loading failed: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
