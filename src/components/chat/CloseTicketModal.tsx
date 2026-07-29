import React, { useState } from 'react';
import { CheckCircle2, Lock, Star, X, KeyRound } from 'lucide-react';

interface CloseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClose: (reason?: string, sendSurvey?: boolean, isProtected?: boolean, password?: string) => void;
}

export const CloseTicketModal: React.FC<CloseTicketModalProps> = ({ isOpen, onClose, onConfirmClose }) => {
  const [reason, setReason] = useState('');
  const [sendSurvey, setSendSurvey] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [protectPassword, setProtectPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmClose(reason, sendSurvey, isProtected, protectPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-rose-400" />
            Encerrar Atendimento
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1 font-medium">Motivo do Encerramento / Resumo</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Dúvida resolvida pelo suporte com envio de 2a via..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sendSurvey}
              onChange={(e) => setSendSurvey(e.target.checked)}
              className="rounded bg-gray-950 border-gray-800 text-emerald-500 focus:ring-emerald-500"
            />
            <span>Enviar pesquisa de satisfação automática (NPS) no WhatsApp</span>
          </label>

          {/* Protection / Lock Settings */}
          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
            <label className="flex items-center gap-2 text-amber-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={isProtected}
                onChange={(e) => setIsProtected(e.target.checked)}
                className="rounded bg-gray-900 border-gray-700 text-amber-500 focus:ring-amber-500"
              />
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Proteger histórico deste protocolo com senha / autorização</span>
            </label>

            {isProtected && (
              <div className="space-y-2 pt-1 border-t border-gray-800/80">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Quando outro atendente buscar este cliente futuramente, a conversa deste protocolo estará bloqueada com um cadeado. Ele precisará da sua senha ou solicitar sua autorização.
                </p>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-medium flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Definir Senha de Acesso Direto (Opcional)
                  </label>
                  <input
                    type="password"
                    placeholder="Sua senha secreta para este protocolo"
                    value={protectPassword}
                    onChange={(e) => setProtectPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl transition-all border border-gray-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-md shadow-rose-900/40 cursor-pointer"
            >
              Finalizar Atendimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
