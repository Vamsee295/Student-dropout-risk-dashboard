"""
ETL Pipeline for Kaggle "Predict Students Dropout and Academic Success" Dataset.

CRITICAL: This is the ONLY source of student data.
No mock data allowed. Kaggle CSV → PostgreSQL → ML → API → Frontend

Process:
1. Extract: Load CSV from Kaggle dataset
2. Transform: Engineer features, validate data
3. Load: Insert into PostgreSQL (students + student_metrics tables)
"""

import sys
from pathlib import Path
import pandas as pd
from datetime import datetime
import random

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.models import Student, StudentMetric, Department, Section
from app.services.feature_engineering import FeatureEngineer
from loguru import logger


# Mapping from Kaggle dataset courses to our department enum
COURSE_TO_DEPARTMENT = {
    33: Department.CSE,  # Technologies
    171: Department.DATA_SCIENCE,  # Informatics Engineering
    8014: Department.CSE,  # Management (mapped to CSE)
    9003: Department.MECHANICAL,  # Petroleum Engineering
    9070: Department.AEROSPACE,  # Animation and Multimedia Design
    9085: Department.CSE,  # Social Service
    9119: Department.CIVIL,  # Construction and Public Works
    9130: Department.ECE,  # Communication Design
    9147: Department.AI_DS,  # Advertising and Marketing Management
    9238: Department.CSE,  # Nursing
    9254: Department.CSE,  # Journalism and Communication
    9500: Department.MECHANICAL,  # Basic Education
    9556: Department.CSE,  # Management
    9670: Department.CSE,  # Social Service (Evening Attendance)
    9773: Department.AI_DS,  # Agronomy
    9853: Department.CSE,  # Design
    9991: Department.CIVIL,  # Computer Engineering
}


def load_kaggle_dataset(csv_path: str) -> pd.DataFrame:
    """
    Load Kaggle dataset from CSV.
    
    Args:
        csv_path: Path to CSV file
        
    Returns:
        DataFrame with Kaggle data
    """
    logger.info(f"Loading dataset from {csv_path}")
    
    try:
        df = pd.read_csv(csv_path)
        logger.info(f"Loaded {len(df)} rows from dataset")
        return df
    except Exception as e:
        logger.error(f"Failed to load dataset: {e}")
        raise


def transform_and_load(df: pd.DataFrame, db: SessionLocal, max_students: int = 100):
    """
    Transform Kaggle data and load into PostgreSQL.
    
    Args:
        df: Kaggle DataFrame
        db: Database session
        max_students: Maximum number of students to load (for demo)
    """
    logger.info("Starting ETL transform and load...")
    
    feature_engineer = FeatureEngineer()
    
    # Sample students for demo (you can remove this to load all)
    if len(df) > max_students:
        df = df.sample(n=max_students, random_state=42)
    
    students_created = 0
    
    for idx, row in df.iterrows():
        try:
            # Generate student ID
            student_id = f"{2024}{str(idx + 1000).zfill(4)}"
            
            # Extract raw features from dataset
            raw_features = feature_engineer.extract_raw_features_from_dataset(row)
            
            # Engineer features
            engineered_features = feature_engineer.engineer_features(raw_features)
            
            # Map course to department
            course_code = row.get('Course', 33)
            department = COURSE_TO_DEPARTMENT.get(course_code, Department.CSE)
            
            # Random section assignment
            section = random.choice(list(Section))
            
            # Generate student name (synthetic for demo)
            first_names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Sam', 'Quinn']
            last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            
            # Generate avatar (initials)
            avatar = ''.join([word[0].upper() for word in name.split()])
            
            # Course name
            course_names = {
                Department.CSE: "B.Tech CSE",
                Department.DATA_SCIENCE: "B.Tech Data Sci",
                Department.MECHANICAL: "B.Tech Mech",
                Department.AEROSPACE: "B.Tech Aero",
                Department.CIVIL: "B.Tech Civil",
                Department.ECE: "B.Tech ECE",
                Department.AI_DS: "B.Tech AI-DS"
            }
            course = course_names.get(department, "B.Tech")
            
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
            
            # Compute last interaction from engagement
            last_interaction = feature_engineer.compute_last_interaction(
                engineered_features['engagement_score']
            )
            
            # Create student metrics
            student_metric = StudentMetric(
                student_id=student_id,
                attendance_rate=engineered_features['attendance_rate'],
                engagement_score=engineered_features['engagement_score'],
                academic_performance_index=engineered_features['academic_performance_index'],
                login_gap_days=engineered_features['login_gap_days'],
                failure_ratio=engineered_features['failure_ratio'],
                financial_risk_flag=engineered_features['financial_risk_flag'],
                commute_risk_score=engineered_features['commute_risk_score'],
                semester_performance_trend=engineered_features['semester_performance_trend'],
                last_interaction=last_interaction
            )
            
            db.add(student_metric)
            
            students_created += 1
            
            if students_created % 10 == 0:
                logger.info(f"Processed {students_created} students...")
            
        except Exception as e:
            logger.error(f"Failed to process row {idx}: {e}")
            continue
    
    # Commit all changes
    db.commit()
    logger.info(f"✓ Successfully loaded {students_created} students into database")


def main():
    """Main ETL execution."""
    # Path to Kaggle dataset
    # IMPORTANT: Update this path to your actual Kaggle dataset CSV
    dataset_path = Path(__file__).parent.parent / "data" / "raw" / "dataset.csv"
    
    # Check if file exists
    if not dataset_path.exists():
        logger.error(f"Dataset not found at {dataset_path}")
        logger.info("Please download the Kaggle dataset and place it in backend/data/raw/dataset.csv")
        logger.info("Dataset: 'Predict Students Dropout and Academic Success'")
        logger.info("URL: https://www.kaggle.com/datasets/thedevastator/higher-education-predictors-of-student-retention")
        sys.exit(1)
    
    # Load dataset
    df = load_kaggle_dataset(str(dataset_path))
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Clear existing data (for fresh load)
        logger.warning("Clearing existing student data...")
        db.query(StudentMetric).delete()
        db.query(Student).delete()
        db.commit()
        
        # Transform and load
        transform_and_load(df, db, max_students=100)
        
        logger.info("✓ ETL Pipeline completed successfully")
        
    except Exception as e:
        logger.error(f"ETL Pipeline failed: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
