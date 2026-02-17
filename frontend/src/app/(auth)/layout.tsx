import { Logo } from "@/components/Logo";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Branding & Visual */}
            {/* Left: Branding & Visual */}
            <div className="hidden lg:flex flex-col bg-black text-white p-12 relative overflow-hidden login-left">
                {/* Logo */}
                <div className="z-10">
                    <Logo variant="dark" />
                </div>

                {/* Centered Hero Content */}
                <div className="flex-1 flex flex-col justify-center z-10 max-w-lg">
                    <h1 className="text-5xl font-bold leading-tight mb-6">Predict. Intervene. Succeed.</h1>
                    <p className="text-gray-400 text-xl leading-relaxed">
                        The most advanced student success platform powered by machine learning. Identify at-risk students before it's too late.
                    </p>
                </div>

                {/* Abstract Pattern */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="z-10 text-sm text-gray-500">
                    © 2026 EduSight Analytics. All rights reserved.
                </div>
            </div>

            {/* Right: Auth Form */}
            <div className="flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md space-y-8 login-wrapper">
                    {children}
                </div>
            </div>
        </div>
    );
}
