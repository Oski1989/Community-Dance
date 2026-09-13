'use client';

import React from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'reservation' | 'quest' | 'payment' | 'announcement';
  read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'reservation': return '📅';
      case 'quest': return '🏆';
      case 'payment': return '💶';
      case 'announcement': default: return '📢';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="glass-panel w-full max-w-sm p-4 bg-slate-950 border-purple-500/30 shadow-2xl rounded-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🔔</span>
            <h3 className="font-heading font-bold text-white text-base">Notificaciones</h3>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
              >
                Marcar leídas
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition font-bold text-sm w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500">
              No tienes notificaciones pendientes.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition ${
                  n.read ? 'bg-gray-900/50 border-gray-800/60 opacity-70' : 'bg-purple-900/20 border-purple-500/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0 mt-0.5">{getIcon(n.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-semibold text-white text-xs">{n.title}</h4>
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-snug">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
