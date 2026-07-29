import React from 'react';
import { PieChart, TrendingUp, Users, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { Ticket } from '../../types';

interface AnalyticsDashboardProps {
  tickets: Ticket[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tickets }) => {
  const total = tickets.length;
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
  const pending = tickets.filter((t) => t.status === 'pending').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              Métricas &amp; Performance
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Indicadores operacionais em tempo real de filas e tempo médio de resposta.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-2">
            <span className="text-xs text-gray-400 font-medium">Total de Atendimentos</span>
            <div className="text-2xl font-bold text-white font-mono">{total}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-2">
            <span className="text-xs text-emerald-400 font-medium">Em Andamento</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{inProgress}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-2">
            <span className="text-xs text-amber-400 font-medium">Aguardando Fila</span>
            <div className="text-2xl font-bold text-amber-400 font-mono">{pending}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-2">
            <span className="text-xs text-blue-400 font-medium">Finalizados</span>
            <div className="text-2xl font-bold text-blue-400 font-mono">{resolved}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
