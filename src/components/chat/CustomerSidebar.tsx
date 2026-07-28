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
  FileText,
  ShieldCheck,
  History,
  Send,
  Star,
  Bell,
  Trash2,
  Copy,
  Check,
  Receipt
} from 'lucide-react';
import { Ticket, Department, Attendant, Priority, Contact, ScheduledMessage, TicketReminder } from '../../types';
import { EditContactModal } from '../contacts/EditContactModal';

interface CustomerSidebarProps {
  ticket: Ticket;
  allTickets?: Ticket[];
  departments: Department[];
  attendants: Attendant[];
  scheduledMessages?: ScheduledMessage[];
  reminders?: TicketReminder[];
  onUpdatePriority: (ticketId: string, priority: Priority) => void;
  onOpenTransferModal: () => void;
  onOpenCloseModal: () => void;
  onAddTag: (ticketId: string, tag: string) => void;
  onRemoveTag: (ticketId: string, tag: string) => void;
  onCloseSidebar: () => void;
  onUpdateContact?: (updated: Contact) => void;
  onAddScheduledMessage?: (msg: ScheduledMessage) => void;
  onCancelScheduledMessage?: (id: string) => void;
  onAddReminder?: (rem: TicketReminder) => void;
  onToggleReminder?: (id: string) => void;
  onSendMessage?: (text: string, isNote?: boolean) => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  ticket,
  allTickets = [],
  departments,
  attendants,
  scheduledMessages = [],
  reminders = [],
  onUpdatePriority,
  onOpenTransferModal,
  onOpenCloseModal,
  onAddTag,
  onRemoveTag,
  onCloseSidebar,
  onUpdateContact,
  onAddScheduledMessage,
  onCancelScheduledMessage,
  onAddReminder,
  onToggleReminder,
  onSendMessage
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Protocol actions feedback
  const [copiedProtocol, setCopiedProtocol] = useState(false);
  const [sentProtocol, setSentProtocol] = useState(false);

  // Scheduled message form state
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleText, setScheduleText] = useState('');
  const [scheduleDateTime, setScheduleDateTime] = useState('');

  // Reminder form state
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDateTime, setReminderDateTime] = useState('');

  const dept = departments.find((d) => d.id === ticket.departmentId);
  const assignedAgent = attendants.find((a) => a.id === ticket.assignedAttendantId);

  // Filter previous tickets for this contact
  const previousTickets = allTickets.filter(
    (t) => t.contactId === ticket.contactId && t.status === 'resolved' && t.id !== ticket.id
  );

  // Filter scheduled messages & reminders for this ticket
  const ticketSchedules = scheduledMessages.filter((s) => s.ticketId === ticket.id && s.status === 'pending');
  const ticketReminders = reminders.filter((r) => r.ticketId === ticket.id);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleText.trim() || !scheduleDateTime) return;

    const newSched: ScheduledMessage = {
      id: 'sched-' + Date.now(),
      ticketId: ticket.id,
      contactId: ticket.contactId,
      contactName: ticket.contact.name,
      contactPhone: ticket.contact.phone,
      connectionId: ticket.connectionId || 'conn-1',
      connectionName: 'WhatsApp Standard',
      connectionProvider: 'evolution',
      content: scheduleText.trim(),
      scheduledAt: scheduleDateTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (onAddScheduledMessage) {
      onAddScheduledMessage(newSched);
    }
    setScheduleText('');
    setScheduleDateTime('');
    setShowScheduleForm(false);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim() || !reminderDateTime) return;

    const newRem: TicketReminder = {
      id: 'rem-' + Date.now(),
      ticketId: ticket.id,
      title: reminderTitle.trim(),
      remindAt: reminderDateTime,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    if (onAddReminder) {
      onAddReminder(newRem);
    }
    setReminderTitle('');
    setReminderDateTime('');
    setShowReminderForm(false);
  };

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

  // Protocol Helpers & Actions
  const protocolNumber =
    ticket.protocol ||
    `PROT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${ticket.id.replace(/\D/g, '') || '101'}`;

  const getProtocolFormattedMessage = () => {
    return `📋 *PROTOCOLO DE ATENDIMENTO*\n\nOlá, *${ticket.contact.name}*!\nO número do seu protocolo de atendimento é:\n\n🎫 *Protocolo:* \`${protocolNumber}\`\n📅 *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n👤 *Atendente:* ${assignedAgent ? assignedAgent.name : 'Equipe de Suporte'}\n🏢 *Setor:* ${dept ? dept.name : 'Atendimento'}\n\nGuardamos este registro com carinho para seu acompanhamento!`;
  };

  const handleCopyProtocolText = () => {
    navigator.clipboard.writeText(getProtocolFormattedMessage());
    setCopiedProtocol(true);
    setTimeout(() => setCopiedProtocol(false), 2500);
  };

  const handleSendProtocolMessage = () => {
    if (onSendMessage) {
      onSendMessage(getProtocolFormattedMessage(), false);
      setSentProtocol(true);
      setTimeout(() => setSentProtocol(false), 2500);
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
          <div className="flex items-center justify-center gap-2">
            <h4 className="font-bold text-base text-gray-900 dark:text-white">
              {ticket.contact.name}
            </h4>
            <button
              onClick={() => setIsEditingContact(true)}
              className="p-1 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
              title="Editar dados do cliente (Nome, CPF/CNPJ, etc)"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            {ticket.contact.phone}
          </p>

          {ticket.contact.cpfCnpj && (
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 mt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Doc: {ticket.contact.cpfCnpj}</span>
            </div>
          )}

          {ticket.contact.pushName && (
            <p className="text-[11px] text-purple-400 font-medium mt-1">
              Nome original WhatsApp: <span className="text-white font-semibold">{ticket.contact.pushName}</span>
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

      {/* Protocol Section */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-2.5 bg-emerald-500/5 dark:bg-emerald-950/20">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-emerald-500" /> Protocolo do Chamado
          </h5>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {protocolNumber}
          </span>
        </div>

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Envie ou copie o protocolo oficial de atendimento caso o cliente solicite.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleSendProtocolMessage}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              sentProtocol
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="Enviar mensagem formatada com o protocolo no chat do cliente"
          >
            {sentProtocol ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Enviado!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Protocolo</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyProtocolText}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
              copiedProtocol
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
            }`}
            title="Copiar texto do protocolo para a área de transferência"
          >
            {copiedProtocol ? (
              <>
                <Check className="w-3.5 h-3.5 text-purple-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-purple-400" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
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
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" /> Anotações do Contato
        </h5>
        <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700 italic">
          {ticket.contact.notes || 'Nenhuma anotação adicional cadastrada para este contato.'}
        </p>
      </div>

      {/* Feature #5: Agendamento de Mensagens & Lembretes (Follow-Up) */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
            <Send className="w-3.5 h-3.5" /> Mensagem Agendada & Follow-Up
          </h5>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setShowScheduleForm(!showScheduleForm);
                setShowReminderForm(false);
              }}
              className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg font-bold border border-emerald-500/30 transition-colors"
            >
              + Mensagem
            </button>
            <button
              onClick={() => {
                setShowReminderForm(!showReminderForm);
                setShowScheduleForm(false);
              }}
              className="text-[10px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-1 rounded-lg font-bold border border-purple-500/30 transition-colors"
            >
              + Lembrete
            </button>
          </div>
        </div>

        {/* Form Agendar Mensagem */}
        {showScheduleForm && (
          <form onSubmit={handleCreateSchedule} className="p-3 bg-gray-900 border border-emerald-500/30 rounded-xl space-y-2">
            <label className="block text-[10px] font-bold text-emerald-400 uppercase">
              Agendar Envio de Mensagem no WhatsApp
            </label>
            <textarea
              rows={2}
              required
              placeholder="Digite a mensagem para envio automático futuro..."
              value={scheduleText}
              onChange={(e) => setScheduleText(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                required
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Agendar
              </button>
            </div>
          </form>
        )}

        {/* Form Criar Lembrete */}
        {showReminderForm && (
          <form onSubmit={handleCreateReminder} className="p-3 bg-gray-900 border border-purple-500/30 rounded-xl space-y-2">
            <label className="block text-[10px] font-bold text-purple-400 uppercase">
              Lembrete Interno / Retorno (Follow-Up)
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Ligar para confirmar pagamento do pedido..."
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                required
                value={reminderDateTime}
                onChange={(e) => setReminderDateTime(e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Criar
              </button>
            </div>
          </form>
        )}

        {/* Schedule List */}
        {ticketSchedules.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Mensagens Agendadas:</p>
            {ticketSchedules.map((s) => (
              <div key={s.id} className="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start justify-between gap-2">
                <div className="text-xs">
                  <span className="font-semibold text-emerald-300 block">{s.content}</span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    Envio em: {new Date(s.scheduledAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                {onCancelScheduledMessage && (
                  <button
                    onClick={() => onCancelScheduledMessage(s.id)}
                    className="text-gray-500 hover:text-rose-400 p-1"
                    title="Cancelar agendamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reminders List */}
        {ticketReminders.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Lembretes de Follow-up:</p>
            {ticketReminders.map((r) => (
              <div key={r.id} className="p-2 bg-purple-950/30 border border-purple-500/30 rounded-xl flex items-start justify-between gap-2">
                <div className="text-xs">
                  <span className={`font-semibold block ${r.isCompleted ? 'line-through text-gray-500' : 'text-purple-200'}`}>
                    {r.title}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <Bell className="w-3 h-3 text-purple-400" />
                    {new Date(r.remindAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                {onToggleReminder && (
                  <input
                    type="checkbox"
                    checked={r.isCompleted}
                    onChange={() => onToggleReminder(r.id)}
                    className="accent-purple-500 w-4 h-4 rounded cursor-pointer mt-0.5"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {ticketSchedules.length === 0 && ticketReminders.length === 0 && !showScheduleForm && !showReminderForm && (
          <p className="text-[11px] text-gray-500 italic">
            Nenhuma mensagem agendada ou lembrete pendente para este chamado.
          </p>
        )}
      </div>

      {/* Feature #2: Histórico de Atendimentos Anteriores Fechados */}
      <div className="p-4 space-y-3">
        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1">
            <History className="w-3.5 h-3.5 text-blue-400" /> Histórico de Atendimentos Anteriores
          </span>
          <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full font-bold">
            {previousTickets.length} fechados
          </span>
        </h5>

        {previousTickets.length === 0 ? (
          <p className="text-[11px] text-gray-500 italic bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            Este é o primeiro atendimento registrado para este cliente.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {previousTickets.map((prevT) => {
              const closedAgent = attendants.find((a) => a.id === prevT.assignedAttendantId);
              const deptName = departments.find((d) => d.id === prevT.departmentId)?.name;

              return (
                <div
                  key={prevT.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/80 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white text-[11px]">
                      Ticket #{prevT.id.replace('t-', '')}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {prevT.closedAt ? new Date(prevT.closedAt).toLocaleDateString('pt-BR') : prevT.updatedAt}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Setor: <strong className="text-gray-300">{deptName || 'Geral'}</strong></span>
                    {closedAgent && (
                      <span className="flex items-center gap-1">
                        <img src={closedAgent.avatar} className="w-3.5 h-3.5 rounded-full" />
                        {closedAgent.name}
                      </span>
                    )}
                  </div>

                  {prevT.rating && (
                    <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold pt-0.5">
                      <span>Avaliação:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= prevT.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {prevT.lastMessageSnippet && (
                    <p className="text-[10px] text-gray-400 line-clamp-2 bg-gray-100 dark:bg-gray-900/60 p-2 rounded-xl italic">
                      "{prevT.lastMessageSnippet}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Contact Modal */}
      {isEditingContact && (
        <EditContactModal
          contact={ticket.contact}
          onSave={(updated) => {
            if (onUpdateContact) {
              onUpdateContact(updated);
            }
            setIsEditingContact(false);
          }}
          onClose={() => setIsEditingContact(false)}
        />
      )}
    </aside>
  );
};
