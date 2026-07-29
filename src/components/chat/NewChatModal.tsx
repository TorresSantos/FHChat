import React, { useState } from 'react';
import { Plus, User, Phone, Layers, X } from 'lucide-react';
import { Queue, WhatsAppConnection } from '../../types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  queues: Queue[];
  connections: WhatsAppConnection[];
  onCreateChat: (name: string, phone: string, queueId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  queues,
  connections,
  onCreateChat
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [queueId, setQueueId] = useState(queues[0]?.id || 'queue-1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onCreateChat(name, phone, queueId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Iniciar Novo Atendimento WhatsApp
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1 font-medium">Nome do Cliente</label>
            <input
              type="text"
              required
              placeholder="Ex: João da Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-medium">Telefone com DDD</label>
            <input
              type="text"
              required
              placeholder="Ex: +5511999887766"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-medium">Fila de Atendimento</label>
            <select
              value={queueId}
              onChange={(e) => setQueueId(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/40 cursor-pointer"
            >
              Iniciar Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
