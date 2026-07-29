import React from 'react';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';

export const CalendarManager: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              Agendamentos &amp; Lembretes
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Agende retornos de chamadas e mensagens automáticas programadas no WhatsApp.
            </p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center text-gray-400 text-xs">
          Nenhum agendamento pendente para hoje.
        </div>
      </div>
    </div>
  );
};
