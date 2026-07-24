const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const authService = {
    login: async (email: string, password: string) => {
        await delay(500);

        const cleanEmail = email.trim().toLowerCase();

        // Exact Role Mapping — Authentication & Authorization
        let role: "STUDENT" | "FACULTY" | "DEAN" | "ADMIN" | null = null;
        let name = "";
        let id = 1;
        let student_id: string | null = null;

        if (cleanEmail === "faculty@gmail.com" || cleanEmail === "faculty1@gmail.com") {
            role = "FACULTY";
            name = "Prof. Michael Chen";
            id = 555;
        } else if (cleanEmail === "student@gmail.com" || cleanEmail === "student1@gmail.com") {
            role = "STUDENT";
            name = "John Student";
            id = 111;
            student_id = "S1001";
        } else if (cleanEmail === "dean@gmail.com" || cleanEmail === "dean1@gmail.com") {
            role = "DEAN";
            name = "Dr. Strategic Dean";
            id = 999;
        } else if (cleanEmail === "admin@gmail.com") {
            role = "ADMIN";
            name = "System Admin";
            id = 99;
        }

        // Strictly reject unauthorized/unrecognized emails
        if (!role) {
            throw new Error("Access Denied: Unrecognized email. Only authorized faculty@gmail.com, student@gmail.com, or dean@gmail.com accounts can log in.");
        }

        return {
            access_token: "mock-token-12345",
            token_type: "bearer",
            user_id: id,
            role: role,
            name: name,
            student_id: student_id
        };
    },

    getCurrentUser: async (token: string) => {
        await delay(300);
        return {
            id: "1",
            email: "faculty@gmail.com",
            name: "Prof. Michael Chen",
            role: "FACULTY"
        };
    },

    forgotPassword: async (email: string) => {
        await delay(400);
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail !== "faculty@gmail.com" && cleanEmail !== "student@gmail.com" && cleanEmail !== "dean@gmail.com" && cleanEmail !== "faculty1@gmail.com" && cleanEmail !== "student1@gmail.com" && cleanEmail !== "dean1@gmail.com") {
            throw new Error("Access Denied: Email not registered.");
        }
        return { message: "Reset link sent successfully." };
    },
};
