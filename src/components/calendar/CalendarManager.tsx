import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Send,
  X,
  CheckCircle2,
  XCircle,
  Smartphone,
  Users,
  Search,
  Zap,
  Globe,
  Trash2,
  Sparkles,
  Repeat,
  Filter,
  Check
} from 'lucide-react';
import { ScheduledMessage, WhatsAppConnection, Contact, QuickResponse } from '../../types';

interface CalendarManagerProps {
  scheduledMessages: ScheduledMessage[];
  connections: WhatsAppConnection[];
  contacts: Contact[];
  quickResponses?: QuickResponse[];
  onAddScheduledMessage: (msg: ScheduledMessage) => void;
  onCancelScheduledMessage: (id: string) => void;
  onExecuteScheduledMessage?: (id: string) => void;
}

export const CalendarManager: React.FC<CalendarManagerProps> = ({
  scheduledMessages,
  connections,
  contacts,
  quickResponses = [],
  onAddScheduledMessage,
  onCancelScheduledMessage,
  onExecuteScheduledMessage
}) => {
  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Default July 2026 or current
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnectionFilter, setSelectedConnectionFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactMode, setContactMode] = useState<'existing' | 'custom'>('existing');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [selectedConnId, setSelectedConnId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [messageContent, setMessageContent] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Helper date string formatter YYYY-MM-DD
  const formatDateKey = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Open modal for a specific day
  const handleOpenModalForDate = (dateKey: string) => {
    setScheduledDate(dateKey);
    setScheduledTime('09:00');
    if (contacts.length > 0 && !selectedContactId) {
      setSelectedContactId(contacts[0].id);
    }
    if (connections.length > 0 && !selectedConnId) {
      setSelectedConnId(connections[0].id);
    }
    setIsModalOpen(true);
  };

  // Submit Schedule Form
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || !scheduledTime || !messageContent.trim()) return;

    let contactName = customName;
    let contactPhone = customPhone;

    if (contactMode === 'existing') {
      const c = contacts.find((item) => item.id === selectedContactId);
      if (c) {
        contactName = c.name;
        contactPhone = c.phone;
      }
    }

    if (!contactName.trim() || !contactPhone.trim()) {
      alert('Por favor, informe o nome e telefone do destinatário.');
      return;
    }

    const conn = connections.find((c) => c.id === selectedConnId) || connections[0];
    const isoDateTime = `${scheduledDate}T${scheduledTime}:00Z`;

    const newSchedule: ScheduledMessage = {
      id: 'sched-' + Date.now(),
      contactId: contactMode === 'existing' ? selectedContactId : undefined,
      contactName,
      contactPhone,
      connectionId: conn?.id || 'conn-1',
      connectionName: conn?.name || 'WhatsApp Standard',
      connectionProvider: conn?.provider || 'evolution',
      content: messageContent,
      scheduledAt: isoDateTime,
      status: 'pending',
      frequency,
      createdAt: new Date().toISOString()
    };

    onAddScheduledMessage(newSchedule);
    setIsModalOpen(false);
    setMessageContent('');

    setToastMessage(`Mensagem agendada com sucesso para ${contactName}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter schedules
  const filteredSchedules = scheduledMessages.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.contactName.toLowerCase().includes(q) ||
      s.contactPhone.includes(q) ||
      s.content.toLowerCase().includes(q);

    const matchConn =
      selectedConnectionFilter === 'all' || s.connectionId === selectedConnectionFilter;

    const matchStatus =
      selectedStatusFilter === 'all' || s.status === selectedStatusFilter;

    const matchDate =
      !selectedDateFilter || s.scheduledAt.startsWith(selectedDateFilter);

    return matchSearch && matchConn && matchStatus && matchDate;
  });

  return (
    <div id="calendar-manager-container" className="flex-1 flex flex-col h-full bg-gray-950 text-gray-100 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 border border-emerald-400/30 animate-bounce text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Agenda de Mensagens & Disparos
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                  {scheduledMessages.filter((s) => s.status === 'pending').length} pendentes
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Clique sobre qualquer dia do calendário para programar envio de mensagens WhatsApp via Evolution API ou Baileys.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModalForDate(new Date().toISOString().split('T')[0])}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Nova Mensagem</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Left, Upcoming List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Column (2 cols wide) */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
          {/* Calendar Month Header Bar */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-bold text-white">
                {monthNames[month]} <span className="text-purple-400 font-mono">{year}</span>
              </h2>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
              >
                Hoje
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Headers */}
          <div className="grid grid-cols-7 text-center font-bold text-xs text-gray-400 border-b border-gray-800/60 pb-2">
            <span className="text-rose-400">Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span className="text-purple-400">Sáb</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 auto-rows-fr">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[85px] bg-gray-950/40 rounded-xl border border-gray-800/30 opacity-30" />
            ))}

            {/* Days of the Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateKey = formatDateKey(dayNumber);
              const isToday =
                new Date().getDate() === dayNumber &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              const isSelected = selectedDateFilter === dateKey;

              // Find schedules for this day
              const daySchedules = scheduledMessages.filter((s) => s.scheduledAt.startsWith(dateKey));

              return (
                <div
                  key={`day-${dayNumber}`}
                  onClick={() => handleOpenModalForDate(dateKey)}
                  className={`min-h-[90px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isToday
                      ? 'bg-purple-950/30 border-purple-500/80 shadow-md shadow-purple-950/50'
                      : isSelected
                      ? 'bg-gray-800 border-purple-400'
                      : 'bg-gray-950 border-gray-800/80 hover:border-gray-700 hover:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-md ${
                        isToday
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 group-hover:text-purple-300'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {daySchedules.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {daySchedules.length}
                      </span>
                    )}
                  </div>

                  {/* Scheduled Items Badges inside day cell */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {daySchedules.slice(0, 2).map((sched) => (
                      <div
                        key={sched.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateFilter(isSelected ? null : dateKey);
                        }}
                        className={`text-[9px] p-1 rounded-md border truncate font-medium flex items-center justify-between ${
                          sched.status === 'sent'
                            ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                            : sched.status === 'cancelled'
                            ? 'bg-rose-950/60 border-rose-800/80 text-rose-300 line-through'
                            : 'bg-purple-950/70 border-purple-800/80 text-purple-200'
                        }`}
                        title={`${sched.contactName}: ${sched.content}`}
                      >
                        <span className="truncate">{sched.contactName}</span>
                        <span className="font-mono text-[8px] opacity-80 shrink-0 ml-1">
                          {sched.scheduledAt.split('T')[1]?.slice(0, 5) || '09:00'}
                        </span>
                      </div>
                    ))}

                    {daySchedules.length > 2 && (
                      <span className="text-[9px] text-gray-400 font-semibold block text-center">
                        +{daySchedules.length - 2} mais...
                      </span>
                    )}
                  </div>

                  <div className="text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 font-medium text-purple-400">
                    <Plus className="w-2.5 h-2.5" /> Agendar
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* List / Upcoming Panel (1 col wide) */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Próximos Agendamentos</span>
            </h3>
            {selectedDateFilter && (
              <button
                onClick={() => setSelectedDateFilter(null)}
                className="text-[10px] text-purple-300 underline font-semibold"
              >
                Limpar data ({selectedDateFilter})
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por contato ou mensagem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedConnectionFilter}
                onChange={(e) => setSelectedConnectionFilter(e.target.value)}
                className="bg-gray-950 border border-gray-800 rounded-xl px-2 py-1 text-[11px] text-gray-300 focus:outline-none"
              >
                <option value="all">Todas as Conexões</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-gray-950 border border-gray-800 rounded-xl px-2 py-1 text-[11px] text-gray-300 focus:outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendentes</option>
                <option value="sent">Enviados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>

          {/* List of Cards */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1">
            {filteredSchedules.length === 0 ? (
              <div className="text-center py-10 text-gray-500 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-gray-700" />
                <p className="text-xs">Nenhum agendamento encontrado.</p>
                <p className="text-[10px] text-gray-600">
                  Clique no calendário para criar um novo agendamento de mensagem.
                </p>
              </div>
            ) : (
              filteredSchedules.map((sched) => {
                const conn = connections.find((c) => c.id === sched.connectionId);
                const isBaileys = conn?.provider === 'baileys' || sched.connectionProvider === 'baileys';

                return (
                  <div
                    key={sched.id}
                    className="bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-xl p-3 space-y-2 transition-all shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-white">{sched.contactName}</h4>
                        <p className="text-[10px] text-emerald-400 font-mono">{sched.contactPhone}</p>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          sched.status === 'sent'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : sched.status === 'cancelled'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {sched.status === 'sent'
                          ? 'Enviado'
                          : sched.status === 'cancelled'
                          ? 'Cancelado'
                          : 'Pendente'}
                      </span>
                    </div>

                    {/* Content snippet */}
                    <div className="bg-gray-900 p-2 rounded-lg border border-gray-800 text-[11px] text-gray-300 italic whitespace-pre-wrap">
                      "{sched.content}"
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-800/60">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center gap-1 font-mono text-purple-300">
                          <Clock className="w-3 h-3 text-purple-400" />
                          {sched.scheduledAt.replace('T', ' ').slice(0, 16)}
                        </span>
                        {isBaileys ? (
                          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded text-[9px] font-mono">
                            Baileys
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded text-[9px] font-mono">
                            Evolution
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      {sched.status === 'pending' && (
                        <div className="flex items-center space-x-1">
                          {onExecuteScheduledMessage && (
                            <button
                              onClick={() => onExecuteScheduledMessage(sched.id)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[10px] transition-colors"
                              title="Enviar Agora"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => onCancelScheduledMessage(sched.id)}
                            className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-medium text-[10px] transition-colors"
                            title="Cancelar Agendamento"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Agendar Mensagem Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Agendar Nova Mensagem</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              {/* Contact Selector Mode */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Destinatário *</label>
                <div className="flex items-center space-x-3 mb-3">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMode"
                      checked={contactMode === 'existing'}
                      onChange={() => setContactMode('existing')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-300 font-medium">Selecionar da Agenda (CRM)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMode"
                      checked={contactMode === 'custom'}
                      onChange={() => setContactMode('custom')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-300 font-medium">Digitar Novo Número</span>
                  </label>
                </div>

                {contactMode === 'existing' ? (
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) {c.company ? `• ${c.company}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nome do Cliente"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      required={contactMode === 'custom'}
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp (ex: +55 11 99999-8888)"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                      required={contactMode === 'custom'}
                    />
                  </div>
                )}
              </div>

              {/* Connection Selector */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Conexão de Disparo WhatsApp *
                </label>
                <select
                  value={selectedConnId}
                  onChange={(e) => setSelectedConnId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-purple-500"
                >
                  {connections.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.provider === 'baileys' ? 'Baileys WS' : 'Evolution REST'}] {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Data do Envio *</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Horário *</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Repetição / Frequência</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="once">Envio Único (Sem repetição)</option>
                  <option value="daily">Diário (Todos os dias no mesmo horário)</option>
                  <option value="weekly">Semanal (Toda semana)</option>
                  <option value="monthly">Mensal (Todo mês)</option>
                </select>
              </div>

              {/* Message Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-300 font-semibold">Mensagem *</label>
                  {quickResponses.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setMessageContent((prev) => prev + (prev ? '\n' : '') + e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="bg-gray-950 text-[10px] text-purple-300 border border-purple-500/40 rounded-lg px-2 py-0.5 focus:outline-none"
                    >
                      <option value="">Inserir Resposta Rápida...</option>
                      {quickResponses.map((qr) => (
                        <option key={qr.id} value={qr.content}>
                          {qr.shortcut} - {qr.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <textarea
                  rows={4}
                  placeholder="Escreva a mensagem que será enviada automaticamente na data agendada..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                  required
                />

                <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-gray-400">
                  <span className="font-semibold text-purple-300">Variáveis disponíveis:</span>
                  <button
                    type="button"
                    onClick={() => setMessageContent((p) => p + ' {nome}')}
                    className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-200 hover:bg-gray-700"
                  >
                    {"{nome}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageContent((p) => p + ' {telefone}')}
                    className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-200 hover:bg-gray-700"
                  >
                    {"{telefone}"}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-md shadow-purple-900/50 flex items-center space-x-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Salvar Agendamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
