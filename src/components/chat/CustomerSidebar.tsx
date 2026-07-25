import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Building,
  Tag,
  Calendar,
  Clock,
  Edit3,
  Plus,
  X,
  Share2,
  Lock,
  ArrowRightLeft,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Ticket, Department, Attendant, Priority } from '../../types';

interface CustomerSidebarProps {
  ticket: Ticket;
  departments: Department[];
  attendants: Attendant[];
  onUpdatePriority: (ticketId: string, priority: Priority) => void;
  onOpenTransferModal: () => void;
  onOpenCloseModal: () => void;
  onAddTag: (ticketId: string, tag: string) => void;
  onRemoveTag: (ticketId: string, tag: string) => void;
  onCloseSidebar: () => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  ticket,
  departments,
  attendants,
  onUpdatePriority,
  onOpenTransferModal,
  onOpenCloseModal,
  onAddTag,
  onRemoveTag,
  onCloseSidebar
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const dept = departments.find((d) => d.id === ticket.departmentId);
  const assignedAgent = attendants.find((a) => a.id === ticket.assignedAttendantId);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      onAddTag(ticket.id, newTagInput.trim());
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      case 'high': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300';
    }
  };

  return (
    <aside id="customer-sidebar" className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-y-auto shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
          Detalhes do Cliente & Chamado
        </h3>
        <button
          onClick={onCloseSidebar}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Customer Profile Card */}
      <div className="p-4 text-center border-b border-gray-100 dark:border-gray-800 space-y-2">
        <img
          src={
            ticket.contact.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          }
          alt={ticket.contact.name}
          className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-emerald-500 shadow-sm"
        />
        <div>
          <h4 className="font-bold text-base text-gray-900 dark:text-white">
            {ticket.contact.name}
          </h4>
          <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            {ticket.contact.phone}
          </p>
          {ticket.contact.pushName && (
            <p className="text-[11px] text-purple-400 font-medium mt-0.5">
              WhatsApp User: <span className="text-white font-semibold">{ticket.contact.pushName}</span>
            </p>
          )}
          <div className="mt-2 space-y-1 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800/60 p-2 rounded-lg border border-gray-200 dark:border-gray-700/60 text-left">
            <p className="truncate" title={ticket.contact.jid || `${ticket.contact.phone.replace(/\D/g, '')}@s.whatsapp.net`}>
              <span className="text-gray-500 font-sans font-medium">JID: </span>
              {ticket.contact.jid || `${ticket.contact.phone.replace(/\D/g, '')}@s.whatsapp.net`}
            </p>
            {ticket.contact.lid && (
              <p className="truncate" title={ticket.contact.lid}>
                <span className="text-gray-500 font-sans font-medium">LID: </span>
                <span className="text-purple-400">{ticket.contact.lid}</span>
              </p>
            )}
          </div>
          {ticket.contact.company && (
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1.5">
              <Building className="w-3 h-3" /> {ticket.contact.company}
            </p>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={onOpenTransferModal}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" /> Transferir
          </button>
          <button
            onClick={onOpenCloseModal}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Finalizar
          </button>
        </div>
      </div>

      {/* Status & Priority Section */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Informações do Atendimento
        </h5>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Setor / Departamento:</span>
            {dept && (
              <span
                className="px-2 py-0.5 text-[10px] font-bold text-white rounded"
                style={{ backgroundColor: dept.color }}
              >
                {dept.name}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Atendente Responsável:</span>
            {assignedAgent ? (
              <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                <img src={assignedAgent.avatar} className="w-4 h-4 rounded-full" />
                {assignedAgent.name}
              </span>
            ) : (
              <span className="text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                Sem Atendente
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Prioridade:</span>
            <select
              value={ticket.priority}
              onChange={(e) => onUpdatePriority(ticket.id, e.target.value as Priority)}
              className={`text-[11px] font-semibold border rounded px-2 py-0.5 cursor-pointer ${getPriorityBadge(
                ticket.priority
              )}`}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tags Manager */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Etiquetas do Cliente
          </h5>
          <button
            onClick={() => setShowTagInput(!showTagInput)}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" /> Adicionar
          </button>
        </div>

        {showTagInput && (
          <form onSubmit={handleAddTag} className="flex gap-1">
            <input
              type="text"
              placeholder="Nova etiqueta..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-2 py-1 rounded-lg text-xs font-medium"
            >
              Salvar
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-1.5">
          {ticket.tags.map((t) => (
            <span
              key={t}
              className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
            >
              {t}
              <button
                onClick={() => onRemoveTag(ticket.id, t)}
                className="hover:text-rose-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Notes / Internal CRM Data */}
      <div className="p-4 space-y-3">
        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" /> Anotações do Contato
        </h5>
        <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700 italic">
          {ticket.contact.notes || 'Nenhuma anotação adicional cadastrada para este contato.'}
        </p>
      </div>
    </aside>
  );
};
