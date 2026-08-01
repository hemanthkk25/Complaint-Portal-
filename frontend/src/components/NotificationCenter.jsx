import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, Clock, ShieldAlert, CheckCircle2, Ticket } from 'lucide-react';

export function NotificationCenter() {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Filter notifications for current user
  const userNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifs.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100">
          {/* Header */}
          <div className="p-4 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                {unreadCount} unread
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {userNotifs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-500" />
                No notifications yet
              </div>
            ) : (
              userNotifs.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-4 transition-colors cursor-pointer flex gap-3 ${
                    notif.isRead ? 'bg-white hover:bg-slate-50 opacity-75' : 'bg-blue-50/40 hover:bg-blue-50'
                  }`}
                >
                  <div className="mt-0.5">
                    {notif.type === 'assignment' && <Ticket className="w-4 h-4 text-amber-600" />}
                    {notif.type === 'completion' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {notif.type === 'status_change' && <Clock className="w-4 h-4 text-blue-600" />}
                    {notif.type === 'creation' && <ShieldAlert className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{notif.message}</p>
                    {notif.ticketId && (
                      <span className="inline-block mt-1 text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        #{notif.ticketId}
                      </span>
                    )}
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 self-center" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
