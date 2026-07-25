import React, { useState } from 'react';
import { ArrowRightLeft, X, Users, Headphones, Building } from 'lucide-react';
import { Ticket, Department, Attendant } from '../../types';

interface TransferModalProps {
  ticket: Ticket;
  departments: Department[];
  attendants: Attendant[];
  onConfirmTransfer: (ticketId: string, departmentId: string, attendantId?: string, note?: string) => void;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  ticket,
  departments,
  attendants,
  onConfirmTransfer,
  onClose
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState(ticket.departmentId);
  const [selectedAttendantId, setSelectedAttendantId] = useState<string>('');
  const [transferNote, setTransferNote] = useState('');

  // Filter attendants belonging to selected department or all
  const filteredAttendants = attendants.filter((a) =>
    selectedDeptId ? a.departmentId === selectedDeptId : true
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmTransfer(
      ticket.id,
      selectedDeptId,
      selectedAttendantId || undefined,
      transferNote
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Transferir Atendimento
              </h3>
              <p className="text-xs text-gray-500">
                Encaminhe o chamado de {ticket.contact.name} para outra fila ou colega.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Department */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Setor / Departamento de Destino:
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setSelectedAttendantId('');
              }}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} - ({d.description})
                </option>
              ))}
            </select>
          </div>

          {/* Select Specific Attendant (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Atendente Específico (Opcional - Deixe em branco para fila geral):
            </label>
            <select
              value={selectedAttendantId}
              onChange={(e) => setSelectedAttendantId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Qualquer Atendente Disponível da Fila --</option>
              {filteredAttendants.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status}) - {a.activeTicketsCount} chamados ativos
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Note */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nota do Motivo da Transferência (Interna):
            </label>
            <textarea
              rows={2}
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="Ex: Cliente solicita orçamento corporativo com desconto especial..."
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-900/30"
            >
              Confirmar Transferência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
