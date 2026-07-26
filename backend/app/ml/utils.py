def format_feature_name(feature: str) -> str:
    """
    Format raw feature names into human-readable strings.
    Example: 'attendance_percentage' -> 'Attendance Percentage'
    """
    return feature.replace("_", " ").title()
