import React, { useState } from 'react';
import { ArrowRightLeft, Users, Layers, X } from 'lucide-react';
import { Queue, Department, Attendant } from '../../types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  queues: Queue[];
  departments: Department[];
  attendants: Attendant[];
  onTransfer: (queueId?: string, attendantId?: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  queues,
  attendants,
  onTransfer
}) => {
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [selectedAttendantId, setSelectedAttendantId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTransfer(selectedQueueId || undefined, selectedAttendantId || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
            Transferir Atendimento
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1 font-medium">Transferir para Fila / Setor</label>
            <select
              value={selectedQueueId}
              onChange={(e) => setSelectedQueueId(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">Manter Fila Atual</option>
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-medium">Transferir para Atendente Específico</label>
            <select
              value={selectedAttendantId}
              onChange={(e) => setSelectedAttendantId(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">Nenhum (Devolver para a Fila)</option>
              {attendants.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
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
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/40 cursor-pointer"
            >
              Confirmar Transferência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
