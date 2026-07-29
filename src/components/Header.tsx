import React, { useState } from 'react';
import { LogOut, User, Bell, Radio, ShieldCheck, Sparkles, Lock, Check, X, AlertCircle } from 'lucide-react';
import { Attendant, WhatsAppConnection, AuthorizationRequest } from '../types';

interface HeaderProps {
  currentAttendant: Attendant;
  connections: WhatsAppConnection[];
  onLogout: () => void;
  activeTab: string;
  authorizationRequests?: AuthorizationRequest[];
  onApproveAuthorization?: (requestId: string) => void;
  onRejectAuthorization?: (requestId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAttendant,
  connections,
  onLogout,
  activeTab,
  authorizationRequests = [],
  onApproveAuthorization,
  onRejectAuthorization
}) => {
  const activeBaileys = connections.find((c) => c.provider === 'baileys' && c.status === 'connected');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Filter requests targeted at current attendant that are pending
  const myPendingRequests = authorizationRequests.filter(
    (r) => r.targetAttendantId === currentAttendant.id && r.status === 'pending'
  );

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

        {/* Notifications Bell for Authorization Requests */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-all relative cursor-pointer border border-gray-800"
            title="Notificações de Autorização"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {myPendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-gray-900">
                {myPendingRequests.length}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Solicitações de Acesso a Protocolos
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {myPendingRequests.length} pendente(s)
                </span>
              </div>

              {myPendingRequests.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-xs">
                  Nenhuma solicitação de autorização pendente.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {myPendingRequests.map((req) => (
                    <div key={req.id} className="bg-gray-950 p-2.5 rounded-xl border border-gray-800 space-y-1.5 text-xs">
                      <p className="text-gray-300 leading-tight">
                        <strong className="text-amber-300">{req.requesterAttendantName}</strong> solicitou liberação para visualizar a conversa do protocolo <strong className="font-mono text-emerald-400">#{req.protocol}</strong> ({req.contactName}).
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            onApproveAuthorization?.(req.id);
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Autorizar Acesso
                        </button>
                        <button
                          onClick={() => {
                            onRejectAuthorization?.(req.id);
                          }}
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-[10px] py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border border-gray-700"
                        >
                          <X className="w-3 h-3 text-rose-400" />
                          Negar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
