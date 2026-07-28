import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Clock,
  User,
  CheckCheck,
  Tag,
  Inbox,
  AlertCircle,
  MessageSquare,
  Smartphone,
  Layers
} from 'lucide-react';
import { Ticket, Department, Attendant, TicketStatus, Queue, WhatsAppConnection } from '../../types';

interface ChatListProps {
  tickets: Ticket[];
  departments: Department[];
  attendants: Attendant[];
  queues?: Queue[];
  connections?: WhatsAppConnection[];
  currentAttendant: Attendant;
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
}

type TabType = 'mine' | 'pending' | 'waiting' | 'resolved';

export const ChatList: React.FC<ChatListProps> = ({
  tickets,
  departments,
  attendants,
  queues = [],
  connections = [],
  currentAttendant,
  selectedTicketId,
  onSelectTicket
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedQueueId, setSelectedQueueId] = useState<string>('all');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('all');

  const [selectedAttendantId, setSelectedAttendantId] = useState<string>('all');

  // Filter logic
  const filteredTickets = tickets.filter((t) => {
    // Search query matching Name, Phone, CPF/CNPJ, PushName, JID, Message
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      t.contact.name.toLowerCase().includes(q) ||
      t.contact.phone.includes(q) ||
      (t.contact.cpfCnpj && t.contact.cpfCnpj.toLowerCase().includes(q)) ||
      (t.contact.pushName && t.contact.pushName.toLowerCase().includes(q)) ||
      (t.contact.jid && t.contact.jid.toLowerCase().includes(q)) ||
      (t.lastMessageSnippet && t.lastMessageSnippet.toLowerCase().includes(q));

    if (!matchSearch) return false;

    // Attendant Connection & Queue Restrictions (for non-admins)
    if (currentAttendant.role !== 'admin') {
      const allowedConns = currentAttendant.connectionIds || [];
      if (allowedConns.length > 0 && t.connectionId && !allowedConns.includes(t.connectionId)) {
        if (t.assignedAttendantId !== currentAttendant.id) {
          return false;
        }
      }

      const allowedQueues = currentAttendant.queueIds || [];
      if (allowedQueues.length > 0 && t.queueId && !allowedQueues.includes(t.queueId)) {
        if (t.assignedAttendantId !== currentAttendant.id) {
          return false;
        }
      }
    }

    // Manual Attendant Filter
    if (selectedAttendantId !== 'all' && t.assignedAttendantId !== selectedAttendantId) {
      return false;
    }

    // Manual Department filter
    if (selectedDeptId !== 'all' && t.departmentId !== selectedDeptId) {
      return false;
    }

    // Manual Queue filter
    if (selectedQueueId !== 'all' && t.queueId !== selectedQueueId) {
      return false;
    }

    // Manual Connection filter
    if (selectedConnectionId !== 'all' && t.connectionId !== selectedConnectionId) {
      return false;
    }

    // Tab filter
    if (activeTab === 'pending') {
      return t.status === 'pending';
    } else if (activeTab === 'mine') {
      return t.status === 'in_progress' && t.assignedAttendantId === currentAttendant.id;
    } else if (activeTab === 'waiting') {
      return t.status === 'waiting' && t.assignedAttendantId === currentAttendant.id;
    } else if (activeTab === 'resolved') {
      return t.status === 'resolved';
    }
    return true;
  });

  const getDepartment = (deptId: string) => {
    return departments.find((d) => d.id === deptId);
  };

  const getAttendant = (attId?: string) => {
    return attendants.find((a) => a.id === attId);
  };

  const getQueue = (qId?: string) => {
    return queues.find((q) => q.id === qId);
  };

  const getConnection = (cId?: string) => {
    return connections.find((c) => c.id === cId);
  };

  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const waitingCount = tickets.filter(
    (t) => t.status === 'waiting' && t.assignedAttendantId === currentAttendant.id
  ).length;
  const mineCount = tickets.filter(
    (t) => t.status === 'in_progress' && t.assignedAttendantId === currentAttendant.id
  ).length;

  // Auto switch tab if waitingCount becomes 0 while on waiting tab
  useEffect(() => {
    if (activeTab === 'waiting' && waitingCount === 0) {
      setActiveTab('mine');
    }
  }, [waitingCount, activeTab]);

  return (
    <div id="chat-list-panel" className="w-full md:w-80 lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full shrink-0">
      {/* Header Tabs */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">
            Fila de Atendimento
          </h2>
          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {filteredTickets.length} conversas
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar nome, telefone ou mensagem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className={`grid ${waitingCount > 0 ? 'grid-cols-4' : 'grid-cols-3'} bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-medium gap-1`}>
          <button
            onClick={() => setActiveTab('mine')}
            className={`py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all text-center relative ${
              activeTab === 'mine'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Meus ({mineCount})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all text-center relative ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Pendentes ({pendingCount})
          </button>

          {/* Dynamic "Em Espera" tab - Appears only when there are waiting tickets for this attendant */}
          {waitingCount > 0 && (
            <button
              onClick={() => setActiveTab('waiting')}
              className={`py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all text-center relative flex items-center justify-center gap-1 ${
                activeTab === 'waiting'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-950/40 ring-1 ring-amber-400'
                  : 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Clientes em espera aguardando resposta"
            >
              <Clock className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Espera ({waitingCount})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('resolved')}
            className={`py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all text-center ${
              activeTab === 'resolved'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Fechados
          </button>
        </div>

        {/* Dropdown Filters (Setor, Fila, Conexão, Atendente) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200/80 dark:border-gray-700">
            <Filter className="w-3 h-3 text-gray-400 shrink-0" />
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full bg-transparent text-[11px] text-gray-800 dark:text-gray-200 border-none focus:ring-0 p-0 font-medium cursor-pointer truncate"
            >
              <option value="all" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Setor: Todos</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200/80 dark:border-gray-700">
            <User className="w-3 h-3 text-gray-400 shrink-0" />
            <select
              value={selectedAttendantId}
              onChange={(e) => setSelectedAttendantId(e.target.value)}
              className="w-full bg-transparent text-[11px] text-gray-800 dark:text-gray-200 border-none focus:ring-0 p-0 font-medium cursor-pointer truncate"
            >
              <option value="all" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Atendente: Todos</option>
              {attendants.map((a) => (
                <option key={a.id} value={a.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200/80 dark:border-gray-700">
            <Layers className="w-3 h-3 text-gray-400 shrink-0" />
            <select
              value={selectedQueueId}
              onChange={(e) => setSelectedQueueId(e.target.value)}
              className="w-full bg-transparent text-[11px] text-gray-800 dark:text-gray-200 border-none focus:ring-0 p-0 font-medium cursor-pointer truncate"
            >
              <option value="all" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Fila: Todas</option>
              {queues.map((q) => (
                <option key={q.id} value={q.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  {q.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200/80 dark:border-gray-700">
            <Smartphone className="w-3 h-3 text-gray-400 shrink-0" />
            <select
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="w-full bg-transparent text-[11px] text-gray-800 dark:text-gray-200 border-none focus:ring-0 p-0 font-medium cursor-pointer truncate"
            >
              <option value="all" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Linha: Todas</option>
              {connections.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  {c.name.replace('WhatsApp ', '')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-400 space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 stroke-[1.5]" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Nenhum chamado encontrado nesta aba.
            </p>
            <p className="text-[11px] text-gray-400">
              Alterne os filtros acima ou crie um novo atendimento.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isSelected = ticket.id === selectedTicketId;
            const dept = getDepartment(ticket.departmentId);
            const queue = getQueue(ticket.queueId);
            const conn = getConnection(ticket.connectionId);
            const assignedAgent = getAttendant(ticket.assignedAttendantId);

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`p-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 flex space-x-3 relative ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-emerald-500'
                    : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={
                      ticket.contact.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={ticket.contact.name}
                    className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  {ticket.status === 'pending' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                  {ticket.status === 'waiting' && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-gray-900 rounded-full items-center justify-center text-[8px] font-bold text-white shadow-xs">
                      ⏳
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <h3 className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                        {ticket.contact.name}
                      </h3>
                      {ticket.status === 'waiting' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0 font-mono">
                          Em Espera
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                      {ticket.lastMessageTimestamp}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate leading-snug">
                    {ticket.lastMessageSnippet || 'Sem mensagens recentes'}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {/* Queue / Dept Tag & Connection Badge */}
                    <div className="flex items-center space-x-1.5 overflow-hidden">
                      {queue ? (
                        <span
                          className="px-1.5 py-0.5 text-[9px] font-bold rounded text-white truncate max-w-[100px]"
                          style={{ backgroundColor: queue.color }}
                        >
                          {queue.name}
                        </span>
                      ) : dept ? (
                        <span
                          className="px-1.5 py-0.5 text-[9px] font-bold rounded text-white truncate max-w-[100px]"
                          style={{ backgroundColor: dept.color }}
                        >
                          {dept.name}
                        </span>
                      ) : null}

                      {conn && (
                        <span
                          className="px-1.5 py-0.5 text-[8px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 truncate max-w-[80px]"
                          title={`Conexão: ${conn.name}`}
                        >
                          {conn.name.replace('WhatsApp ', '')}
                        </span>
                      )}

                      {assignedAgent ? (
                        <img
                          src={assignedAgent.avatar}
                          title={`Atendente: ${assignedAgent.name}`}
                          className="w-4 h-4 rounded-full object-cover border border-white shrink-0"
                        />
                      ) : (
                        <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium shrink-0">
                          Fila
                        </span>
                      )}
                    </div>

                    {/* Unread badge */}
                    {ticket.unreadCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                        {ticket.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
