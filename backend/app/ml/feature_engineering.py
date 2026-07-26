import pandas as pd

def generate_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate engineered features for the ML model.
    Expects raw columns like:
    - attendance_percentage
    - cgpa
    - lms_login_frequency
    - assignments_completed
    - total_assignments
    - previous_semester_cgpa
    - missed_classes_consecutive
    """
    df = df.copy()
    
    # Safely handle potential missing columns by assigning defaults if missing
    def safe_get(col, default=0):
        return df[col] if col in df.columns else default

    attendance = safe_get('attendance_percentage', 75.0)
    cgpa = safe_get('cgpa', 7.0)
    prev_cgpa = safe_get('previous_semester_cgpa', 7.0)
    lms_login = safe_get('lms_login_frequency', 10) # logins per week
    assigned = safe_get('total_assignments', 10)
    completed = safe_get('assignments_completed', 5)
    
    # 1. Attendance Trend & Drop Rate
    # Just a simple proxy: if attendance is very low, we assume high drop rate
    df['attendance_trend'] = attendance - 75.0  # Deviation from standard 75%
    
    # 2. Assignment Completion Rate
    # Avoid division by zero
    assigned = assigned.replace(0, 1)
    df['assignment_completion_rate'] = completed / assigned
    
    # 3. LMS Engagement Score
    # Combine login frequency with completion rate
    df['lms_engagement_score'] = (lms_login / 20.0) * 50 + df['assignment_completion_rate'] * 50
    df['lms_engagement_score'] = df['lms_engagement_score'].clip(0, 100)
    
    # 4. Grade Trend / Academic Improvement Rate
    df['grade_trend'] = cgpa - prev_cgpa
    
    # 5. Study Consistency Score
    # Combining attendance and LMS engagement
    df['study_consistency_score'] = (attendance + df['lms_engagement_score']) / 2.0
    
    # Keep the raw features that are also useful
    if 'attendance_percentage' not in df.columns:
        df['attendance_percentage'] = attendance
    if 'cgpa' not in df.columns:
        df['cgpa'] = cgpa
        
    return df
