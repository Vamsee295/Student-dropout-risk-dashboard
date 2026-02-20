"""
Seed StudentCodingProfile data for all students to populate coding reports.
Generates realistic, varied scores across platforms like HackerRank, LeetCode, etc.
"""

import random
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Student, StudentCodingProfile

def seed_coding_profiles():
    db = SessionLocal()
    try:
        students = db.query(Student).all()
        print(f"Seeding coding profiles for {len(students)} students...")
        
        count = 0
        for student in students:
            # Check if profile already exists
            profile = db.query(StudentCodingProfile).filter(StudentCodingProfile.student_id == student.id).first()
            
            if not profile:
                profile = StudentCodingProfile(student_id=student.id)
                db.add(profile)
            
            # Generate platform scores
            # Use student.id as seed for reproducible randomness
            random.seed(student.id)
            
            # Platforms
            profile.hackerrank_score = random.uniform(50, 1200)
            profile.hackerrank_solved = int(profile.hackerrank_score / 15)
            
            profile.leetcode_rating = random.uniform(1200, 2400)
            profile.leetcode_solved = int((profile.leetcode_rating - 1000) / 10)
            
            profile.codechef_rating = random.uniform(1000, 2600)
            profile.codeforces_rating = random.uniform(800, 2400)
            
            profile.interviewbit_score = random.uniform(100, 5000)
            profile.spoj_score = random.uniform(10, 500)
            
            # Weighted overall score
            profile.overall_score = (
                (profile.hackerrank_score * 0.1) +
                (profile.leetcode_rating * 0.25) +
                (profile.codechef_rating * 0.15) +
                (profile.codeforces_rating * 0.25) +
                (profile.interviewbit_score * 0.15) +
                (profile.spoj_score * 0.1)
            ) / 10.0  # Normalize to a better scale
            
            count += 1
            if count % 50 == 0:
                print(f"Processed {count} students...")
                db.commit()
                
        db.commit()
        print(f"Successfully seeded {count} coding profiles!")
    except Exception as e:
        print(f"Error seeding coding profiles: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_coding_profiles()
