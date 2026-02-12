"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { Plus, Edit2, Trash, Check, X } from "lucide-react";

export function UserManagement() {
    const { users, addUser, removeUser, updateUserRole } = useSettingsStore();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-500">
                        Manage access, roles, and permissions for the dashboard.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700">
                    <Plus size={16} />
                    Add User
                </button>
            </div>

            {/* User Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                        <tr>
                            <th className="px-6 py-3">Name / Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Last Login</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{user.name}</div>
                                    <div className="text-gray-500 text-xs">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'Advisor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span className="text-emerald-700 font-medium">Active</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{user.lastLogin}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => removeUser(user.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Permission Matrix */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Role Capabilities</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500">
                                <th className="text-left py-2">Feature Capability</th>
                                <th className="text-center py-2">Admin</th>
                                <th className="text-center py-2">Advisor</th>
                                <th className="text-center py-2">Faculty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr className="py-2">
                                <td className="py-2 font-medium text-gray-700">View ML Insights</td>
                                <td className="text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                                <td className="text-center"><X size={16} className="mx-auto text-gray-300" /></td>
                                <td className="text-center"><X size={16} className="mx-auto text-gray-300" /></td>
                            </tr>
                            <tr className="py-2">
                                <td className="py-2 font-medium text-gray-700">Manage Interventions</td>
                                <td className="text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                                <td className="text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                                <td className="text-center"><X size={16} className="mx-auto text-gray-300" /></td>
                            </tr>
                            <tr className="py-2">
                                <td className="py-2 font-medium text-gray-700">View Students</td>
                                <td className="text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                                <td className="text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                                <td className="text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
