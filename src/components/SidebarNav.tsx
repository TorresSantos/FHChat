import React from 'react';
import {
  MessageSquare,
  Radio,
  Users,
  UserCheck,
  Layers,
  Zap,
  BarChart3,
  PieChart,
  Bot,
  Settings,
  Calendar,
  Webhook
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingTicketsCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, setActiveTab, pendingTicketsCount }) => {
  const menuItems = [
    { id: 'chat', label: 'Atendimento', icon: MessageSquare, badge: pendingTicketsCount > 0 ? pendingTicketsCount : null },
    { id: 'connections', label: 'Conexões WhatsApp', icon: Radio },
    { id: 'contacts', label: 'Contatos & Clientes', icon: Users },
    { id: 'attendants', label: 'Atendentes', icon: UserCheck },
    { id: 'queues', label: 'Filas & Setores', icon: Layers },
    { id: 'quickReplies', label: 'Respostas Rápidas', icon: Zap },
    { id: 'bot', label: 'Bot Triage / Fluxo', icon: Bot },
    { id: 'reports', label: 'Relatórios & Export', icon: BarChart3 },
    { id: 'analytics', label: 'Métricas Dashboard', icon: PieChart },
    { id: 'calendar', label: 'Agendamentos', icon: Calendar },
    { id: 'evolution', label: 'Configurações API', icon: Settings }
  ];

  return (
    <aside className="w-16 md:w-60 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      <nav className="flex-1 py-4 px-2 md:px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer group relative ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 font-semibold'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-400'}`} />
              <span className="hidden md:inline truncate">{item.label}</span>

              {item.badge && (
                <span className="ml-auto hidden md:flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-800 text-[10px] text-gray-500 hidden md:block">
        <div className="font-semibold text-gray-400">FHChat Engine Baileys</div>
        <div>Status: Ativo &amp; Monitorado</div>
      </div>
    </aside>
  );
};
