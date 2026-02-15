#!/bin/bash
# Database initialization script for Docker
# This runs automatically when MySQL container first starts

echo "Initializing student_dropout_db database..."

# Database is already created via MYSQL_DATABASE env var
# This script can be used for additional setup if needed

echo "Database initialization complete!"
