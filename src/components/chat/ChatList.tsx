import React from 'react';
import { Search, Filter, MessageSquare, Check, UserPlus, Clock, Sparkles } from 'lucide-react';
import { Ticket, Queue, Department, Attendant } from '../../types';

export type FilterTabType = 'mine' | 'pending' | 'waiting' | 'closed';

interface ChatListProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
  queues: Queue[];
  departments: Department[];
  attendants: Attendant[];
  currentAttendant: Attendant;
  filterTab: FilterTabType;
  setFilterTab: (tab: FilterTabType) => void;
  selectedQueueId: string;
  setSelectedQueueId: (qId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAcceptTicket?: (ticketId: string) => void;
  onReopenTicket?: (ticketId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  queues,
  departments,
  attendants,
  currentAttendant,
  filterTab,
  setFilterTab,
  selectedQueueId,
  setSelectedQueueId,
  searchQuery,
  setSearchQuery,
  onAcceptTicket,
  onReopenTicket
}) => {
  const filteredTickets = tickets.filter((ticket) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = ticket.contact.name.toLowerCase().includes(q);
      const matchPhone = ticket.contact.phone.toLowerCase().includes(q);
      const matchSnippet = ticket.lastMessageSnippet?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchSnippet) return false;
    }

    // Queue filter
    if (selectedQueueId && selectedQueueId !== 'all') {
      if (ticket.queueId !== selectedQueueId) return false;
    }

    // Tab filter
    if (filterTab === 'closed') {
      return ticket.status === 'resolved';
    } else if (filterTab === 'waiting') {
      return ticket.status === 'waiting';
    } else if (filterTab === 'pending') {
      return (ticket.status === 'pending' || !ticket.attendantId) && ticket.status !== 'resolved';
    } else if (filterTab === 'mine') {
      return ticket.attendantId === currentAttendant.id && ticket.status !== 'resolved' && ticket.status !== 'waiting';
    }

    return true;
  });

  return (
    <div className="w-full md:w-80 lg:w-96 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 h-full">
      {/* Filters Header */}
      <div className="p-3 border-b border-gray-800 space-y-3 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou mensagem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 text-[11px] font-semibold overflow-x-auto">
          <button
            onClick={() => setFilterTab('mine')}
            className={`flex-1 py-1.5 px-1 rounded-lg transition-all whitespace-nowrap ${
              filterTab === 'mine' ? 'bg-gray-800 text-emerald-400 shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Meus ({tickets.filter((t) => t.attendantId === currentAttendant.id && t.status !== 'resolved' && t.status !== 'waiting').length})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`flex-1 py-1.5 px-1 rounded-lg transition-all whitespace-nowrap ${
              filterTab === 'pending' ? 'bg-gray-800 text-amber-400 shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Fila ({tickets.filter((t) => (t.status === 'pending' || !t.attendantId) && t.status !== 'resolved').length})
          </button>
          <button
            onClick={() => setFilterTab('waiting')}
            className={`flex-1 py-1.5 px-1 rounded-lg transition-all whitespace-nowrap ${
              filterTab === 'waiting' ? 'bg-gray-800 text-blue-400 shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Espera ({tickets.filter((t) => t.status === 'waiting').length})
          </button>
          <button
            onClick={() => setFilterTab('closed')}
            className={`flex-1 py-1.5 px-1 rounded-lg transition-all whitespace-nowrap ${
              filterTab === 'closed' ? 'bg-gray-800 text-rose-400 shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Fechados ({tickets.filter((t) => t.status === 'resolved').length})
          </button>
        </div>

        {/* Queue Dropdown Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <select
            value={selectedQueueId}
            onChange={(e) => setSelectedQueueId(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 text-gray-300 text-[11px] focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas as Filas &amp; Setores</option>
            {queues.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            <MessageSquare className="w-8 h-8 mx-auto text-gray-600 mb-2 opacity-50" />
            Nenhum atendimento encontrado com estes filtros.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isSelected = ticket.id === selectedTicketId;
            const queue = queues.find((q) => q.id === ticket.queueId);
            const isPending = ticket.status === 'pending' || !ticket.attendantId;

            // REAL WHATSAPP AVATAR OR INITIALS
            const avatarUrl = ticket.contact.avatar;
            const contactInitials = ticket.contact.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-gray-800/50 relative ${
                  isSelected ? 'bg-gray-800/80 border-l-4 border-emerald-500' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={ticket.contact.name}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center font-bold text-white text-xs shadow">
                      {contactInitials}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-gray-900" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-semibold text-xs text-gray-100 truncate">{ticket.contact.name}</h4>
                    <span className="text-[10px] text-gray-500 shrink-0">{ticket.lastMessageTimestamp || 'Agora'}</span>
                  </div>

                  <p className="text-xs text-gray-400 truncate mb-1.5">
                    {ticket.lastMessageSnippet || 'Iniciou novo atendimento'}
                  </p>

                  <div className="flex items-center justify-between gap-1">
                    {/* Queue Tag */}
                    <span className="inline-block text-[10px] bg-emerald-500/10 text-emerald-400 font-medium px-2 py-0.5 rounded-md truncate max-w-[140px] border border-emerald-500/20">
                      {queue ? queue.name : 'Fila Geral'}
                    </span>

                    {/* Resolved status or Unread badge or Accept button */}
                    {ticket.status === 'resolved' ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md">
                          Encerrado
                        </span>
                        {onReopenTicket && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReopenTicket(ticket.id);
                            }}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all border border-gray-700 cursor-pointer"
                            title="Reabrir este atendimento"
                          >
                            Reabrir
                          </button>
                        )}
                      </div>
                    ) : isPending && onAcceptTicket ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptTicket(ticket.id);
                        }}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md transition-all shadow-sm cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        Aceitar
                      </button>
                    ) : (
                      ticket.unreadCount && ticket.unreadCount > 0 ? (
                        <span className="bg-emerald-500 text-gray-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {ticket.unreadCount}
                        </span>
                      ) : null
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
