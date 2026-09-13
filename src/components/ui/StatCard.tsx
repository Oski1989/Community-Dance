'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon = '📈',
  trend,
  trendUp = true,
}) => {
  return (
    <div className="glass-panel p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-heading font-extrabold text-2xl text-white">{value}</span>
          {trend && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                trendUp ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg p-6 relative bg-slate-900 border-purple-500/30 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
          <h3 className="font-heading font-bold text-lg text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            ×
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
