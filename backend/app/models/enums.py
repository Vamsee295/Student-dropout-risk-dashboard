import enum

class Department(str, enum.Enum):
    CSE = "Computer Science (CSE)"
    MECHANICAL = "Mechanical"
    AEROSPACE = "Aerospace"
    DATA_SCIENCE = "Data Science"
    AI_DS = "AI-DS"
    CIVIL = "Civil"
    ECE = "Electronics (ECE)"

class Section(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"

class RiskLevel(str, enum.Enum):
    HIGH = "High Risk"
    MODERATE = "Moderate Risk"
    STABLE = "Stable"
    SAFE = "Safe"

class RiskTrend(str, enum.Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"

class InterventionType(str, enum.Enum):
    COUNSELING = "counseling"
    TUTORING = "tutoring"
    MENTORING = "mentoring"
    FINANCIAL = "financial"
    ACADEMIC = "academic"

class InterventionStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Role(str, enum.Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    ADMIN = "ADMIN"
    DEAN = "DEAN"

class AssessmentType(str, enum.Enum):
    INTERNAL = "Internal"
    EXTERNAL = "External"
    ASSIGNMENT = "Assignment"
    PROJECT = "Project"
    LAB = "Lab"
    PRACTICAL = "Practical"

class AttendanceStatus(str, enum.Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class SubmissionStatus(str, enum.Enum):
    SUBMITTED = "Submitted"
    PENDING = "Pending"
    OVERDUE = "Overdue"
    GRADED = "Graded"
