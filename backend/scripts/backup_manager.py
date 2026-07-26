import os
import subprocess
import datetime
import logging
from dotenv import load_dotenv

load_dotenv()

BACKUP_DIR = os.getenv("BACKUP_DIR", "backups")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "edurisk_db")

def create_backup():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"{DB_NAME}_backup_{timestamp}.sql")
    
    # Run mysqldump
    command = [
        "mysqldump",
        f"-u{DB_USER}",
        f"-p{DB_PASSWORD}",
        DB_NAME
    ]
    
    try:
        with open(backup_file, "w") as f:
            subprocess.run(command, stdout=f, check=True)
        logging.info(f"Database backup created successfully: {backup_file}")
        print(f"Backup created: {backup_file}")
    except subprocess.CalledProcessError as e:
        logging.error(f"Error creating database backup: {e}")
        print(f"Error creating backup: {e}")

if __name__ == "__main__":
    create_backup()
