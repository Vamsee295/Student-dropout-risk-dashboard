const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const authService = {
    login: async (email: string, password: string) => {
        await delay(1000);

        let role = "STUDENT";
        let name = "John Doe";
        let id = 1;

        if (email.includes("dean")) {
            role = "DEAN";
            name = "Dr. Strategic Dean";
            id = 999;
        } else if (email.includes("faculty")) {
            role = "FACULTY";
            name = "Prof. Michael Chen";
            id = 555;
        } else if (email.includes("student")) {
            role = "STUDENT";
            name = "John Student";
            id = 111;
        }

        return {
            access_token: "mock-token-12345",
            token_type: "bearer",
            user_id: id,
            role: role,
            name: name,
            student_id: role === "STUDENT" ? "S1001" : null
        };
    },

    getCurrentUser: async (token: string) => {
        await delay(500);
        return {
            id: "1",
            email: "user@example.com",
            name: "John Doe",
            role: "FACULTY"
        };
    },

    forgotPassword: async (email: string) => {
        await delay(800);
        return { message: "Reset link sent successfully." };
    },
};
