"use client";

import { Shield, Smartphone, Key, FileText, Download } from "lucide-react";

export function SecuritySettings() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Security & Access</h2>
                <p className="text-sm text-gray-500">
                    Configure authentication policies and view audit logs.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Shield size={20} /></div>
                        <h3 className="font-bold text-gray-900">Authentication</h3>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Smartphone className="text-gray-400" size={18} />
                            <div>
                                <p className="text-sm font-bold text-gray-800">Two-Factor Authentication (2FA)</p>
                                <p className="text-xs text-gray-500">Require for all Admin accounts</p>
                            </div>
                        </div>
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Key className="text-gray-400" size={18} />
                            <div>
                                <p className="text-sm font-bold text-gray-800">Password Policy</p>
                                <p className="text-xs text-gray-500">Minimum 12 characters, special chars</p>
                            </div>
                        </div>
                        <button className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FileText size={20} /></div>
                        <h3 className="font-bold text-gray-900">Audit Logs</h3>
                    </div>

                    <div className="space-y-3">
                        {[
                            { action: "Risk Threshold Updated", user: "Jane Doe (Admin)", time: "10 mins ago" },
                            { action: "User Role Changed", user: "Jane Doe (Admin)", time: "2 hours ago" },
                            { action: "Integration Sync", user: "System", time: "5 hours ago" },
                        ].map((log, i) => (
                            <div key={i} className="text-xs p-2 bg-gray-50 rounded flex justify-between">
                                <div>
                                    <span className="font-bold text-gray-800 block">{log.action}</span>
                                    <span className="text-gray-500">{log.user}</span>
                                </div>
                                <span className="text-gray-400">{log.time}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                        <Download size={14} /> Download Full Logs
                    </button>
                </div>
            </div>
        </div>
    );
}
