def generate_recommendations(top_factors: list[dict]) -> list[str]:
    """
    Generates personalized recommendations based on the top risk factors driving the prediction.
    Expects factors in the format: [{"feature": "attendance_percentage", "impact": 0.15, "direction": "positive"}]
    (Note: 'positive' direction means it contributed to the RISK score increasing)
    """
    recommendations = []
    
    # Map feature names to actionable recommendations
    # We only care about features that INCREASED the risk (direction == 'positive')
    for factor in top_factors:
        if factor["direction"] == "positive":
            feature = factor["feature"]
            
            if feature == "attendance_percentage":
                recommendations.append("Meet Faculty Advisor for weekly attendance monitoring.")
            elif feature == "cgpa" or feature == "grade_trend":
                recommendations.append("Schedule extra tutoring and develop an academic support plan.")
            elif feature == "lms_engagement_score" or feature == "lms_login_frequency":
                recommendations.append("Provide curated learning resources and weekly progress tracking.")
            elif feature == "assignments_completed" or feature == "assignment_completion_rate":
                recommendations.append("Enroll in time management support and setup submission reminders.")
            elif feature == "study_consistency_score":
                recommendations.append("Counseling session to improve study habits and consistency.")
                
    # Deduplicate while preserving order
    seen = set()
    unique_recs = [x for x in recommendations if not (x in seen or seen.add(x))]
    
    # If no specific recommendations generated but risk is high, give a generic one
    if not unique_recs:
        unique_recs.append("Schedule a general counseling session to discuss academic progress.")
        
    return unique_recs
