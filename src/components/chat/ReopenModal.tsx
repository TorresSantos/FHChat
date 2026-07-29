import React, { useState } from 'react';
import { RefreshCw, Layers, X, Sparkles } from 'lucide-react';
import { Queue } from '../../types';

interface ReopenModalProps {
  isOpen: boolean;
  onClose: () => void;
  queues: Queue[];
  onConfirmReopen: (queueId: string) => void;
}

export const ReopenModal: React.FC<ReopenModalProps> = ({
  isOpen,
  onClose,
  queues,
  onConfirmReopen
}) => {
  const [selectedQueueId, setSelectedQueueId] = useState<string>(queues[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueId && queues.length > 0) {
      onConfirmReopen(queues[0].id);
    } else {
      onConfirmReopen(selectedQueueId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            Reabrir Atendimento
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          Selecione em qual fila deseja reabrir este atendimento. Um <strong className="text-emerald-400">NOVO protocolo</strong> será gerado automaticamente para acompanhar essa nova interação.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Fila de Destino *
            </label>
            <select
              required
              value={selectedQueueId}
              onChange={(e) => setSelectedQueueId(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>O histórico anterior permanecerá seguro e arquivado na aba de protocolos do cliente.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reabrir com Novo Protocolo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
