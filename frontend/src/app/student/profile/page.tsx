"use client";

import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { Mail, Phone, MapPin, User, Book } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="max-w-[1240px] mx-auto p-4 text-gray-900 bg-[#f8f9fa] min-h-[calc(100vh-64px)] rounded-xl mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Sidebar - Approx 30-35% width -> col-span-4 */}
                <div className="lg:col-span-4">
                    <ProfileSidebar />
                </div>

                {/* Main Content - Approx 65-70% width -> col-span-8 */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Advisor Information */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="text-indigo-600" size={18} />
                            Faculty Advisor
                        </h3>
                        <div className="flex items-start gap-4">
                            <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center">
                                <User size={32} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">Dr. Sarah Jenkins</h4>
                                <p className="text-sm text-gray-500 mb-2">Associate Professor, Computer Science</p>
                                <div className="flex flex-col gap-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> s.jenkins@university.edu</div>
                                    <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> +1 (555) 123-4567</div>
                                    <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> Room 402, Engineering Block</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enrolled Courses */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Book className="text-blue-600" size={18} />
                            Enrolled Courses (Current Semester)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">Course Code</th>
                                        <th className="px-4 py-3">Course Name</th>
                                        <th className="px-4 py-3">Credits</th>
                                        <th className="px-4 py-3">Instructor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">CS301</td>
                                        <td className="px-4 py-3">Database Management Systems</td>
                                        <td className="px-4 py-3">4</td>
                                        <td className="px-4 py-3">Prof. A. Smith</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">CS302</td>
                                        <td className="px-4 py-3">Operating Systems</td>
                                        <td className="px-4 py-3">4</td>
                                        <td className="px-4 py-3">Dr. B. Johnson</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">CS303</td>
                                        <td className="px-4 py-3">Computer Networks</td>
                                        <td className="px-4 py-3">3</td>
                                        <td className="px-4 py-3">Dr. C. Williams</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">HS101</td>
                                        <td className="px-4 py-3">Technical Communication</td>
                                        <td className="px-4 py-3">2</td>
                                        <td className="px-4 py-3">Prof. D. Brown</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
