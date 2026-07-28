import React, { useState } from 'react';
import {
  MessageSquare,
  Wifi,
  WifiOff,
  User,
  Settings,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { Attendant, AttendantStatus, EvolutionConfig } from '../types';

interface HeaderProps {
  currentAttendant: Attendant;
  attendants: Attendant[];
  onSelectAttendant: (attendant: Attendant) => void;
  onUpdateAttendantStatus: (status: AttendantStatus) => void;
  evolutionConfig: EvolutionConfig;
  onNavigateToEvolution: () => void;
  unreadTotal: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAttendant,
  attendants,
  onSelectAttendant,
  onUpdateAttendantStatus,
  evolutionConfig,
  onNavigateToEvolution,
  unreadTotal,
  onLogout
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showConfigPopover, setShowConfigPopover] = useState(false);

  const getStatusColor = (status: AttendantStatus) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'busy': return 'bg-rose-500';
      case 'away': return 'bg-amber-500';
      case 'offline': return 'bg-gray-400';
    }
  };

  const getStatusText = (status: AttendantStatus) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      case 'offline': return 'Offline';
    }
  };

  return (
    <header id="main-header" className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between z-20 shrink-0 select-none shadow-xs">
      {/* Brand Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white text-base tracking-tight">
            Central WhatsApp
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Sistema Multiatendimento & Gestão de Filas
          </p>
        </div>
      </div>

      {/* Right User & Attendant Switcher */}
      <div className="flex items-center space-x-3">
        {/* Attendant Status Badge */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${getStatusColor(currentAttendant.status)}`}></span>
            <span>{getStatusText(currentAttendant.status)}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showStatusDropdown && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
              {(['online', 'busy', 'away', 'offline'] as AttendantStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    onUpdateAttendantStatus(st);
                    setShowStatusDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(st)}`}></span>
                  <span>{getStatusText(st)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Logged-in Attendant Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <img
              src={currentAttendant.avatar}
              alt={currentAttendant.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                {currentAttendant.name}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                {currentAttendant.role === 'admin'
                  ? 'Administrador'
                  : currentAttendant.role === 'supervisor'
                  ? 'Supervisor'
                  : 'Atendente'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-1 w-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 z-50 space-y-3">
              <div className="flex items-center space-x-3 pb-2.5 border-b border-gray-100 dark:border-gray-700">
                <img
                  src={currentAttendant.avatar}
                  alt={currentAttendant.name}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {currentAttendant.name}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {currentAttendant.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold rounded capitalize">
                    {currentAttendant.role === 'admin'
                      ? '👑 Administrador'
                      : currentAttendant.role === 'supervisor'
                      ? '📊 Supervisor'
                      : '🎧 Atendente'}
                  </span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 rounded-lg text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta / Login</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
