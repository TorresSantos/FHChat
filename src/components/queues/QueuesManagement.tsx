import React from 'react';
import { Layers, Plus, Edit3, Trash2 } from 'lucide-react';
import { Queue, Department } from '../../types';

interface QueuesManagementProps {
  queues: Queue[];
  departments: Department[];
  onAddQueue: (queue: Queue) => void;
  onDeleteQueue: (id: string) => void;
}

export const QueuesManagement: React.FC<QueuesManagementProps> = ({ queues, departments, onAddQueue, onDeleteQueue }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Filas de Atendimento &amp; Triagem Bot
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Configure as opções numéricas (1, 2, 3, 4) para a triagem automática do WhatsApp.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queues.map((q) => (
            <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-100">{q.name}</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {q.id}
                </span>
              </div>
              <p className="text-xs text-gray-400 bg-gray-950 p-3 rounded-xl border border-gray-800">
                <strong>Mensagem do Bot:</strong> "{q.botGreeting || 'Aguarde um momento.'}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
