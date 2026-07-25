import React, { useState } from 'react';
import { CheckCircle, Star, X, MessageSquare } from 'lucide-react';
import { Ticket } from '../../types';

interface CloseTicketModalProps {
  ticket: Ticket;
  onConfirmClose: (ticketId: string, rating?: number, summary?: string) => void;
  onClose: () => void;
}

export const CloseTicketModal: React.FC<CloseTicketModalProps> = ({
  ticket,
  onConfirmClose,
  onClose
}) => {
  const [rating, setRating] = useState<number>(5);
  const [summary, setSummary] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmClose(ticket.id, rating, summary);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Finalizar Atendimento
              </h3>
              <p className="text-xs text-gray-500">
                Encerrar o chamado de {ticket.contact.name}.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CSAT Rating Simulator */}
          <div className="space-y-1 text-center">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Avaliação de Satisfação Registrada (CSAT):
            </label>
            <div className="flex justify-center space-x-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 rounded transition-transform hover:scale-125 ${
                    star <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-700'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Summary */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Resumo da Resolução do Atendimento:
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ex: Cliente atendeu às dúvidas sobre faturamento, boleto enviado e quitado via PIX..."
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Action buttons */}
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30"
            >
              Confirmar Fechamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
