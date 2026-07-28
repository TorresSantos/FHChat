import React from 'react';
import {
  MessageSquare,
  Users,
  Zap,
  BarChart2,
  Sliders,
  UserCheck,
  PlusCircle,
  Smartphone,
  Layers
} from 'lucide-react';
import { Role } from '../types';

export type NavTab =
  | 'chats'
  | 'contacts'
  | 'quick_replies'
  | 'analytics'
  | 'connections'
  | 'queues'
  | 'evolution'
  | 'attendants';

interface SidebarNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadCount: number;
  pendingTicketsCount: number;
  onNewChat: () => void;
  userRole?: Role;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
  pendingTicketsCount,
  onNewChat,
  userRole = 'admin'
}) => {
  const isManagementAllowed = userRole === 'admin' || userRole === 'supervisor';

  const navItems = [
    {
      id: 'chats' as NavTab,
      label: 'Atendimentos',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'bg-emerald-500',
      allowed: true
    },
    {
      id: 'connections' as NavTab,
      label: 'Conexões WhatsApp',
      icon: Smartphone,
      allowed: isManagementAllowed
    },
    {
      id: 'queues' as NavTab,
      label: 'Filas & Bot Menu',
      icon: Layers,
      allowed: isManagementAllowed
    },
    {
      id: 'contacts' as NavTab,
      label: 'Contatos / CRM',
      icon: Users,
      allowed: true
    },
    {
      id: 'quick_replies' as NavTab,
      label: 'Respostas Rápidas',
      icon: Zap,
      allowed: true
    },
    {
      id: 'analytics' as NavTab,
      label: 'Métricas & IA',
      icon: BarChart2,
      allowed: true
    },
    {
      id: 'evolution' as NavTab,
      label: 'Evolution API',
      icon: Sliders,
      allowed: isManagementAllowed
    },
    {
      id: 'attendants' as NavTab,
      label: 'Atendentes',
      icon: UserCheck,
      allowed: isManagementAllowed
    }
  ].filter((item) => item.allowed);

  return (
    <aside id="sidebar-nav" className="w-16 md:w-56 bg-gray-900 text-gray-300 flex flex-col justify-between shrink-0 select-none border-r border-gray-800">
      <div className="py-4 space-y-6">
        {/* New Chat Primary Action Button */}
        <div className="px-2 md:px-4">
          <button
            onClick={onNewChat}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium py-2.5 px-3 rounded-xl transition-all shadow-md shadow-emerald-900/40 flex items-center justify-center space-x-2 group"
            title="Novo Atendimento WhatsApp"
          >
            <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-semibold">Novo Atendimento</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1 pl-2.5 pr-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold rounded-l-xl rounded-r-none border-r-2 border-emerald-400 shadow-xs'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60 rounded-xl mr-2.5'
                }`}
              >
                <div className="relative shrink-0">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 text-[9px] font-bold text-white bg-emerald-500 px-1 rounded-full min-w-[14px] text-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-800 text-[10px] text-gray-500 hidden md:block">
        <div className="flex items-center justify-between">
          <span>Aguardando Fila:</span>
          <span className="font-bold text-amber-400">{pendingTicketsCount} clientes</span>
        </div>
        <p className="mt-1 text-[9px] opacity-70">
          Powered by Evolution API & Gemini AI
        </p>
      </div>
    </aside>
  );
};
