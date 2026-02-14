import sys
import os
import argparse

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User, Role
from app.security import get_password_hash
from loguru import logger

def create_user(email, password, role_str, name):
    db = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            logger.error(f"User with email {email} already exists.")
            return

        # Validate role
        try:
            role = Role[role_str.upper()]
        except KeyError:
            logger.error(f"Invalid role: {role_str}. Must be one of {[r.name for r in Role]}")
            return

        user = User(
            email=email,
            password_hash=get_password_hash(password),
            name=name,
            role=role
        )
        db.add(user)
        db.commit()
        logger.success(f"Successfully created user: {email} ({role.value})")

    except Exception as e:
        logger.error(f"Error creating user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a new user")
    parser.add_argument("email", help="User email")
    parser.add_argument("password", help="User password")
    parser.add_argument("role", help="User role (STUDENT, FACULTY, ADMIN)")
    parser.add_argument("--name", help="User name", default="New User")
    
    args = parser.parse_args()
    
    create_user(args.email, args.password, args.role, args.name)
