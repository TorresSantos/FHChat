import React from 'react';
import { BarChart3, Download, FileText } from 'lucide-react';
import { Ticket } from '../../types';

interface ReportsManagerProps {
  tickets: Ticket[];
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({ tickets }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Relatórios de Atendimento &amp; Exportação
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Exporte históricos completos de conversas, protocolos e métricas em formato CSV.
            </p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-gray-200">Atendimentos Registrados no Sistema ({tickets.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="pb-3">Protocolo</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Telefone</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Última Atualização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-800/40">
                    <td className="py-3 font-mono text-emerald-400">{t.protocol}</td>
                    <td className="py-3 font-medium text-gray-200">{t.contact.name}</td>
                    <td className="py-3 font-mono text-gray-400">{t.contact.phone}</td>
                    <td className="py-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{t.lastMessageTimestamp || 'Hoje'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
