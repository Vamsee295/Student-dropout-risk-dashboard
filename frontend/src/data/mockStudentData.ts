export interface Student {
    id: string;
    name: string;
    avatar: string;
    course: string;
    department: "Computer Science (CSE)" | "Mechanical" | "Aerospace" | "Data Science" | "AI-DS" | "Civil" | "Electronics (ECE)";
    section: "A" | "B" | "C";
    riskStatus: "High Risk" | "Moderate Risk" | "Stable" | "Safe";
    riskTrend: "up" | "down" | "stable";
    riskValue: string;
    attendance: number;
    engagementScore: number;
    lastInteraction: string;
    advisor?: string;
}

export interface Teacher {
    id: string;
    name: string;
    department: string;
}

export const TEACHERS: Teacher[] = [
    { id: "t1", name: "Dr. Sarah Smith", department: "Computer Science" },
    { id: "t2", name: "Prof. Alan Grant", department: "Aerospace" },
    { id: "t3", name: "Dr. Emily Chen", department: "Data Science" },
    { id: "t4", name: "Mr. James Wilson", department: "Mechanical" },
    { id: "t5", name: "Mrs. Linda Taylor", department: "AI-DS" },
    { id: "t6", name: "Dr. Robert Brown", department: "Electronics" },
];

export const STUDENTS: Student[] = [
    {
        id: "20248912",
        name: "Marcus Chen",
        avatar: "MC",
        course: "B.Tech CSE",
        department: "Computer Science (CSE)",
        section: "A",
        riskStatus: "High Risk",
        riskTrend: "up",
        riskValue: "+12% Risk",
        attendance: 62,
        engagementScore: 45,
        lastInteraction: "Oct 24, 2025",
    },
    {
        id: "20243301",
        name: "Sarah Miller",
        avatar: "SM",
        course: "B.Tech Aero",
        department: "Aerospace",
        section: "B",
        riskStatus: "Safe",
        riskTrend: "stable",
        riskValue: "Stable",
        attendance: 88,
        engagementScore: 78,
        lastInteraction: "Oct 18, 2025",
        advisor: "Prof. Alan Grant"
    },
    {
        id: "20245592",
        name: "David Kim",
        avatar: "DK",
        course: "B.Tech Mech",
        department: "Mechanical",
        section: "A",
        riskStatus: "Safe",
        riskTrend: "down",
        riskValue: "-5% Risk",
        attendance: 92,
        engagementScore: 88,
        lastInteraction: "Oct 05, 2025",
        advisor: "Mr. James Wilson"
    },
    {
        id: "20241109",
        name: "Emma Wilson",
        avatar: "EW",
        course: "B.Tech Data Sci",
        department: "Data Science",
        section: "C",
        riskStatus: "High Risk",
        riskTrend: "up",
        riskValue: "+15% Risk",
        attendance: 58,
        engagementScore: 42,
        lastInteraction: "Oct 26, 2025",
    },
    {
        id: "20247721",
        name: "James Rodriguez",
        avatar: "JR",
        course: "B.Tech AI-DS",
        department: "AI-DS",
        section: "B",
        riskStatus: "Stable",
        riskTrend: "down",
        riskValue: "-2% Risk",
        attendance: 75,
        engagementScore: 65,
        lastInteraction: "Oct 10, 2025",
    },
    {
        id: "20242233",
        name: "Alice Johnson",
        avatar: "AJ",
        course: "B.Tech CSE",
        department: "Computer Science (CSE)",
        section: "A",
        riskStatus: "Moderate Risk",
        riskTrend: "up",
        riskValue: "+5% Risk",
        attendance: 68,
        engagementScore: 55,
        lastInteraction: "Oct 20, 2025",
    },
    {
        id: "20244455",
        name: "Bob Williams",
        avatar: "BW",
        course: "B.Tech Civil",
        department: "Civil",
        section: "C",
        riskStatus: "High Risk",
        riskTrend: "up",
        riskValue: "+20% Risk",
        attendance: 45,
        engagementScore: 30,
        lastInteraction: "Oct 25, 2025",
    },
    {
        id: "20246677",
        name: "Charlie Brown",
        avatar: "CB",
        course: "B.Tech ECE",
        department: "Electronics (ECE)",
        section: "B",
        riskStatus: "Safe",
        riskTrend: "stable",
        riskValue: "Stable",
        attendance: 95,
        engagementScore: 90,
        lastInteraction: "Oct 15, 2025",
        advisor: "Dr. Robert Brown"
    }
];
