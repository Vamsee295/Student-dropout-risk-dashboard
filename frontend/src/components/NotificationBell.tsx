"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useNotifications, type Notification } from "@/context/NotificationsContext";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (id: string, read: boolean) => {
        if (!read) {
            markAsRead(id);
        }
    };

    const getIconColor = (type: Notification['type']) => {
        switch (type) {
            case 'alert': return 'text-red-500 bg-red-50';
            case 'warning': return 'text-amber-500 bg-amber-50';
            case 'success': return 'text-green-500 bg-green-50';
            case 'info': return 'text-blue-500 bg-blue-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-xs font-bold transition-colors hover:bg-neutral-100 ${isOpen ? 'bg-neutral-100' : ''}`}
                aria-label="Notifications"
            >
                <Bell size={16} className="text-neutral-600" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    <Check size={12} /> Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearNotifications}
                                    className="text-xs font-medium text-gray-500 hover:text-red-600 flex items-center gap-1"
                                >
                                    <Trash2 size={12} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Bell size={32} className="mb-2 opacity-20" />
                                <p className="text-sm">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id, notification.read)}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-indigo-50/10' : ''}`}
                                    >
                                        <div className={`flex-shrink-0 h-2 w-2 mt-2 rounded-full ${!notification.read ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm ${!notification.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                    {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}
