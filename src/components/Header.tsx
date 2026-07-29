import React from 'react';
import { LogOut, User, Bell, Radio, ShieldCheck, Sparkles } from 'lucide-react';
import { Attendant, WhatsAppConnection } from '../types';

interface HeaderProps {
  currentAttendant: Attendant;
  connections: WhatsAppConnection[];
  onLogout: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ currentAttendant, connections, onLogout, activeTab }) => {
  const activeBaileys = connections.find((c) => c.provider === 'baileys' && c.status === 'connected');

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-lg shadow-emerald-900/30">
          FH
        </div>
        <div>
          <h1 className="font-bold text-sm text-gray-100 flex items-center gap-2">
            FHChat Central
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
              v2.5 Production
            </span>
          </h1>
          <p className="text-[11px] text-gray-400 hidden sm:block">
            Central Multi-Atendimento WhatsApp & Bot Triage Engine
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection Status Badge */}
        <div className="hidden md:flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-full px-3 py-1 text-xs">
          <span className={`w-2 h-2 rounded-full ${activeBaileys ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-gray-300 font-medium">
            {activeBaileys ? `Baileys Online: ${activeBaileys.phone}` : 'Baileys: Aguardando QR'}
          </span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
          <div className="relative">
            <img
              src={currentAttendant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentAttendant.name}
              className="w-8 h-8 rounded-full object-cover border border-emerald-500/50"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-gray-900" />
          </div>

          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-gray-200">{currentAttendant.name}</div>
            <div className="text-[10px] text-emerald-400 font-medium uppercase">{currentAttendant.role}</div>
          </div>

          <button
            onClick={onLogout}
            title="Sair da Plataforma"
            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-all cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
