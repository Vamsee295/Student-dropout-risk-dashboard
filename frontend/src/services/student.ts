export interface StudentOverview {
    student_id: string;
    student_name: string;
    attendance_rate: number;
    avg_marks: number;
    engagement_score: number;
    risk_level: string;
    risk_trend: string;
    risk_value: string;
    dropout_probability: number;
    upcoming_deadlines: any[];
    student_id: string;
    student_name: string;
}

export interface Assignment {
    id: number;
    assessment_id: number;
    assessment: {
        id: number;
        course_id: string;
        course_name: string;
        title: string;
        total_marks: number;
        due_date: string;
        type: string;
    };
    obtained_marks: number | null;
    status: string;
    submission_date: string | null;
}

export interface AssignmentProgress {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    overdue_count: number;
    completion_percentage: number;
    assignments: Assignment[];
}

export interface RiskFactor {
    feature: string;
    impact: number;
    direction: 'positive' | 'negative';
}

export interface RiskDetails {
    id: number;
    risk_score: number;
    risk_level: string;
    risk_trend: string;
    risk_value: string;
    explanation: {
        risk_score: number;
        risk_level: string;
        top_factors: RiskFactor[];
    };
}

export interface SubjectPerformance {
    course_id: string;
    course_name: string;
    credits: number;
    internal_marks: number;
    external_marks: number;
    total_marks: number;
    grade: string;
    attendance_percentage: number;
}

export interface SemesterPerformance {
    semester: number;
    gpa: number;
    subjects: SubjectPerformance[];
}

export interface AttendanceRecord {
    id: number;
    course_id: string;
    course_name: string;
    date: string;
    status: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Randomizer helpers
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, decimals: number = 2) => Number((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Constants
const BTECH_COURSES = [
    { id: "CS101", name: "Data Structures & Algorithms" },
    { id: "CS201", name: "Operating Systems" },
    { id: "CS301", name: "Database Management Systems" },
    { id: "CS401", name: "Machine Learning" },
    { id: "CS501", name: "Computer Networks" },
    { id: "EC101", name: "Digital Logic Design" },
    { id: "HU101", name: "Professional Communication" },
    { id: "MA101", name: "Engineering Mathematics" },
];

export const studentService = {
    getOverview: async (studentId: string): Promise<StudentOverview> => {
        await delay(500); // Simulate network
        return {
            attendance_rate: randFloat(65, 98, 1),
            avg_marks: randFloat(60, 95, 1),
            engagement_score: randFloat(40, 98, 1),
            risk_level: randChoice(["Low Risk", "Moderate Risk", "High Risk", "Low Risk", "Low Risk"]), // Skew towards Low
            risk_trend: randChoice(["up", "down", "stable", "stable"]),
            risk_value: "calculated",
            dropout_probability: randFloat(5, 45, 1),
            student_id: studentId,
            student_name: "Student Name",
            upcoming_deadlines: [
                {
                    id: 1,
                    course_id: "CS101",
                    course_name: "Data Structures & Algorithms",
                    title: "Assignment 3: Graph Traversal",
                    due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
                    type: "Assignment"
                },
                {
                    id: 2,
                    course_id: "CS201",
                    course_name: "Operating Systems",
                    title: "Midterm Project Submission",
                    due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
                    type: "Project"
                }
            ],
            recent_attendance: [
                { id: 101, course_name: "Computer Networks", date: new Date().toISOString(), status: "Present" },
                { id: 102, course_name: "Data Structures", date: new Date(Date.now() - 86400000).toISOString(), status: "Present" },
                { id: 103, course_name: "Machine Learning", date: new Date(Date.now() - 2 * 86400000).toISOString(), status: "Absent" },
                { id: 104, course_name: "Operating Systems", date: new Date(Date.now() - 3 * 86400000).toISOString(), status: "Late" },
            ]
        };
    },

    getPerformance: async (studentId: string): Promise<SemesterPerformance[]> => {
        await delay(600);

        const semesters: SemesterPerformance[] = [];
        let baseGPA = 8.5;

        for (let sem = 1; sem <= 6; sem++) {
            // Evolving GPA
            baseGPA = Math.max(5.0, Math.min(10.0, baseGPA + randFloat(-0.8, 0.8)));

            // Generate 4-6 subjects per semester
            const subjects: SubjectPerformance[] = [];
            const numSubjects = randInt(4, 6);
            for (let i = 0; i < numSubjects; i++) {
                const course = randChoice(BTECH_COURSES);
                const internal = randInt(20, 40); // out of 40
                const external = randInt(30, 60); // out of 60
                const total = internal + external;

                let grade = "C";
                if (total >= 90) grade = "A+";
                else if (total >= 80) grade = "A";
                else if (total >= 70) grade = "B";
                else if (total < 50) grade = "F";

                // Unique ID check avoids mapping collisions
                if (!subjects.find(s => s.course_id === course.id)) {
                    subjects.push({
                        course_id: course.id,
                        course_name: course.name,
                        credits: randInt(2, 4),
                        internal_marks: internal,
                        external_marks: external,
                        total_marks: total,
                        grade,
                        attendance_percentage: randInt(65, 100),
                    });
                }
            }

            semesters.push({
                semester: sem,
                gpa: baseGPA,
                subjects
            });
        }

        return semesters.sort((a, b) => b.semester - a.semester); // Return latest first to match UI logic
    },

    getAttendance: async (studentId: string): Promise<AttendanceRecord[]> => {
        await delay(400);

        const records: AttendanceRecord[] = [];
        let idCounter = 1;
        const now = Date.now();

        // 30 days of data
        for (let day = 0; day < 30; day++) {
            // Skip weekends roughly (assume 5 working days)
            if (day % 7 === 0 || day % 7 === 6) continue;

            const date = new Date(now - day * 86400000);

            // 2-4 classes a day
            const numClasses = randInt(2, 4);
            for (let c = 0; c < numClasses; c++) {
                const course = randChoice(BTECH_COURSES);
                records.push({
                    id: idCounter++,
                    course_id: course.id,
                    course_name: course.name,
                    date: new Date(date.setHours(randInt(8, 16), 0, 0)).toISOString(),
                    status: randChoice(["Present", "Present", "Present", "Present", "Late", "Absent"]) // Mostly present
                });
            }
        }

        return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    getAssignments: async (studentId: string): Promise<AssignmentProgress> => {
        await delay(500);

        return {
            total: 24,
            completed: 18,
            pending: 6,
            overdue: 2,
            completion_percentage: 75,
            overdue_count: 2,
            assignments: [
                {
                    id: 1,
                    assessment_id: 101,
                    assessment: {
                        id: 101,
                        course_id: "CS401",
                        course_name: "Machine Learning",
                        title: "Neural Network Implementation",
                        total_marks: 100,
                        due_date: new Date(Date.now() - 5 * 86400000).toISOString(),
                        type: "Project"
                    },
                    obtained_marks: 92,
                    status: "Graded",
                    submission_date: new Date(Date.now() - 6 * 86400000).toISOString()
                },
                {
                    id: 2,
                    assessment_id: 102,
                    assessment: {
                        id: 102,
                        course_id: "CS201",
                        course_name: "Operating Systems",
                        title: "Memory Management Simulation",
                        total_marks: 50,
                        due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
                        type: "Assignment"
                    },
                    obtained_marks: null,
                    status: "Pending",
                    submission_date: null
                },
                {
                    id: 3,
                    assessment_id: 103,
                    assessment: {
                        id: 103,
                        course_id: "MA101",
                        course_name: "Engineering Mathematics",
                        title: "Linear Algebra Problem Set 4",
                        total_marks: 30,
                        due_date: new Date(Date.now() - 2 * 86400000).toISOString(),
                        type: "Homework"
                    },
                    obtained_marks: null,
                    status: "Overdue",
                    submission_date: null
                },
                {
                    id: 4,
                    assessment_id: 104,
                    assessment: {
                        id: 104,
                        course_id: "CS101",
                        course_name: "Data Structures",
                        title: "BST Visualizer",
                        total_marks: 50,
                        due_date: new Date(Date.now() - 10 * 86400000).toISOString(),
                        type: "Assignment"
                    },
                    obtained_marks: 45,
                    status: "Submitted",
                    submission_date: new Date(Date.now() - 11 * 86400000).toISOString()
                },
                {
                    id: 5,
                    assessment_id: 105,
                    assessment: {
                        id: 105,
                        course_id: "HU101",
                        course_name: "Professional Communication",
                        title: "Resume Draft",
                        total_marks: 20,
                        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
                        type: "Submission"
                    },
                    obtained_marks: null,
                    status: "Pending",
                    submission_date: null
                }
            ]
        };
    },

    getRisk: async (studentId: string): Promise<RiskDetails> => {
        await delay(600);

        return {
            id: 1,
            risk_score: randFloat(15, 35), // Simulated Moderate
            risk_level: "Moderate Risk",
            risk_trend: "stable",
            risk_value: "calculating",
            explanation: {
                risk_score: 28.5,
                risk_level: "Moderate Risk",
                top_factors: [
                    { feature: "attendance_rate", impact: -0.15, direction: "negative" },
                    { feature: "academic_performance_index", impact: 0.22, direction: "positive" },
                    { feature: "engagement_score", impact: -0.08, direction: "negative" },
                    { feature: "login_gap_days", impact: 0.05, direction: "positive" }
                ]
            }
        };
    }
};
