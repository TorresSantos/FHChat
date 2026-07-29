import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Search,
  Filter,
  Trash2,
  Edit2,
  Send,
  X,
  Sparkles
} from 'lucide-react';
import { Contact, Attendant, ScheduleItem } from '../../types';

interface CalendarManagerProps {
  contacts?: Contact[];
  attendants?: Attendant[];
}

// Initial Mock Schedules for rich default UI
const initialMockSchedules: ScheduleItem[] = [
  {
    id: 'sched-1',
    title: 'Retorno de Proposta Comercial',
    contactName: 'Carlos Eduardo Santos',
    contactPhone: '+55 11 98888-1111',
    attendantId: 'att-1',
    attendantName: 'Marcos Vinícius',
    date: new Date().toISOString().split('T')[0], // Today
    time: '14:30',
    status: 'pending',
    notes: 'Cliente solicitou desconto de 5% no plano corporativo.',
    sendWhatsAppReminder: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sched-2',
    title: 'Demonstração de Plataforma',
    contactName: 'Mariana Oliveira',
    contactPhone: '+55 21 97777-2222',
    attendantId: 'att-2',
    attendantName: 'Fernanda Lima',
    date: new Date().toISOString().split('T')[0], // Today
    time: '16:00',
    status: 'confirmed',
    notes: 'Apresentar módulo de integração com ERP via API.',
    sendWhatsAppReminder: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sched-3',
    title: 'Suporte Técnico Presencial/Online',
    contactName: 'Roberto Almeida',
    contactPhone: '+55 31 96666-3333',
    attendantId: 'att-1',
    attendantName: 'Marcos Vinícius',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '10:00',
    status: 'pending',
    notes: 'Verificar conexão Baileys e webhook de sincronização.',
    sendWhatsAppReminder: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sched-4',
    title: 'Renovação de Contrato Anual',
    contactName: 'Juliana Costa',
    contactPhone: '+55 41 95555-4444',
    attendantId: 'att-3',
    attendantName: 'Lucas Mendes',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    time: '11:15',
    status: 'completed',
    notes: 'Contrato assinado e enviado via WhatsApp.',
    sendWhatsAppReminder: true,
    createdAt: new Date().toISOString()
  }
];

export const CalendarManager: React.FC<CalendarManagerProps> = ({
  contacts = [],
  attendants = []
}) => {
  // Load schedules from localStorage or fallback
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('fhchat_schedules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialMockSchedules;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('fhchat_schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Current viewed month & year
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [attendantFilter, setAttendantFilter] = useState<string>('all');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('10:00');
  const [formAttendantId, setFormAttendantId] = useState('');
  const [formStatus, setFormStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');
  const [formNotes, setFormNotes] = useState('');
  const [formSendReminder, setFormSendReminder] = useState(true);

  // Success toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Open modal for new schedule
  const handleOpenNewModal = (prefilledDate?: string) => {
    setFormTitle('');
    setFormContactName(contacts[0]?.name || '');
    setFormContactPhone(contacts[0]?.phone || '');
    setFormDate(prefilledDate || new Date().toISOString().split('T')[0]);
    setFormTime('10:00');
    setFormAttendantId(attendants[0]?.id || '');
    setFormStatus('pending');
    setFormNotes('');
    setFormSendReminder(true);
    setSelectedSchedule(null);
    setIsNewModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: ScheduleItem) => {
    setSelectedSchedule(item);
    setFormTitle(item.title);
    setFormContactName(item.contactName);
    setFormContactPhone(item.contactPhone);
    setFormDate(item.date);
    setFormTime(item.time);
    setFormAttendantId(item.attendantId || '');
    setFormStatus(item.status);
    setFormNotes(item.notes || '');
    setFormSendReminder(item.sendWhatsAppReminder ?? true);
    setIsDetailModalOpen(false);
    setIsNewModalOpen(true);
  };

  // Save schedule handler
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContactName.trim()) return;

    const selectedAttendant = attendants.find((a) => a.id === formAttendantId);

    if (selectedSchedule) {
      // Edit
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === selectedSchedule.id
            ? {
                ...s,
                title: formTitle,
                contactName: formContactName,
                contactPhone: formContactPhone,
                attendantId: formAttendantId,
                attendantName: selectedAttendant?.name || s.attendantName,
                date: formDate,
                time: formTime,
                status: formStatus,
                notes: formNotes,
                sendWhatsAppReminder: formSendReminder
              }
            : s
        )
      );
      showToast('Agendamento atualizado com sucesso!');
    } else {
      // Create
      const newItem: ScheduleItem = {
        id: 'sched-' + Date.now(),
        title: formTitle,
        contactName: formContactName,
        contactPhone: formContactPhone,
        attendantId: formAttendantId,
        attendantName: selectedAttendant?.name || 'Atendente Responsável',
        date: formDate,
        time: formTime,
        status: formStatus,
        notes: formNotes,
        sendWhatsAppReminder: formSendReminder,
        createdAt: new Date().toISOString()
      };
      setSchedules((prev) => [...prev, newItem]);
      showToast('Novo agendamento criado!');
    }

    setIsNewModalOpen(false);
  };

  // Delete schedule handler
  const handleDeleteSchedule = (id: string) => {
    if (confirm('Deseja realmente excluir este agendamento?')) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      setIsDetailModalOpen(false);
      setIsNewModalOpen(false);
      showToast('Agendamento removido.');
    }
  };

  // Update status quickly
  const handleQuickStatusUpdate = (id: string, newStatus: ScheduleItem['status']) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    if (selectedSchedule && selectedSchedule.id === id) {
      setSelectedSchedule({ ...selectedSchedule, status: newStatus });
    }
    showToast(`Status alterado para ${getStatusLabel(newStatus)}.`);
  };

  // Send WhatsApp Reminder Action
  const handleSendReminderNow = (item: ScheduleItem) => {
    showToast(`Lembrete WhatsApp enviado para ${item.contactName} (${item.contactPhone})!`);
  };

  // Calendar Date calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build Grid Calendar Days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevDay = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, prevDay);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    calendarDays.push({ dateStr, dayNum: prevDay, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d);
    // Format YYYY-MM-DD in local time
    const yyyy = dayDate.getFullYear();
    const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    calendarDays.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // Next month leading days to fill grid (42 cells = 6 rows)
  const remainingCells = 42 - calendarDays.length;
  for (let n = 1; n <= remainingCells; n++) {
    const nextMonthDate = new Date(year, month + 1, n);
    const dateStr = nextMonthDate.toISOString().split('T')[0];
    calendarDays.push({ dateStr, dayNum: n, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered schedules list
  const filteredSchedules = schedules.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPhone.includes(searchTerm);

    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchAttendant = attendantFilter === 'all' || s.attendantId === attendantFilter;

    return matchSearch && matchStatus && matchAttendant;
  });

  // Calculate Metrics
  const totalCount = schedules.length;
  const todayCount = schedules.filter((s) => s.date === todayStr).length;
  const pendingCount = schedules.filter((s) => s.status === 'pending').length;
  const completedCount = schedules.filter((s) => s.status === 'completed' || s.status === 'confirmed').length;

  function getStatusBadge(status: ScheduleItem['status']) {
    switch (status) {
      case 'confirmed':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmado</span>;
      case 'completed':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Realizado</span>;
      case 'cancelled':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelado</span>;
      default:
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Pendente</span>;
    }
  }

  function getStatusLabel(status: ScheduleItem['status']) {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Realizado';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-6 text-gray-100 space-y-6">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400/30 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          {toastMsg}
        </div>
      )}

      {/* Header & Main Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-5 rounded-2xl border border-gray-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
            Calendário de Agendamentos &amp; Compromissos
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Gerencie retornos, reuniões e lembretes com sincronização de mensagens WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenNewModal()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-[11px] font-medium text-gray-400">Total Agendados</span>
          <div className="text-2xl font-black text-gray-100">{totalCount}</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-[11px] font-medium text-amber-400">Agendados para Hoje</span>
          <div className="text-2xl font-black text-amber-400">{todayCount}</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-[11px] font-medium text-amber-300">Pendentes</span>
          <div className="text-2xl font-black text-amber-300">{pendingCount}</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-[11px] font-medium text-emerald-400">Confirmados/Concluídos</span>
          <div className="text-2xl font-black text-emerald-400">{completedCount}</div>
        </div>
      </div>

      {/* Navigation Controls & Filters */}
      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Month Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-gray-400 hover:text-white bg-gray-950 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all cursor-pointer"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-gray-100 min-w-[140px] text-center">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 text-gray-400 hover:text-white bg-gray-950 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all cursor-pointer"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 rounded-xl transition-all cursor-pointer"
            >
              Hoje
            </button>
          </div>

          {/* View Mode Toggle & Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por cliente ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Grade Mensal
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-800/80 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filtros:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1.5 text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Realizado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          {attendants.length > 0 && (
            <select
              value={attendantFilter}
              onChange={(e) => setAttendantFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1.5 text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos os Atendentes</option>
              {attendants.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* VIEW MODE: MONTH GRID */}
      {viewMode === 'grid' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 bg-gray-950/80 border-b border-gray-800 text-center text-xs font-bold text-gray-400 py-3">
            {dayNames.map((d, i) => (
              <div key={d} className={i === 0 || i === 6 ? 'text-rose-400/80' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-800/60 bg-gray-950/30">
            {calendarDays.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              const daySchedules = filteredSchedules.filter((s) => s.date === cell.dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenNewModal(cell.dateStr)}
                  className={`min-h-[110px] md:min-h-[130px] p-1.5 md:p-2 transition-colors relative group cursor-pointer hover:bg-gray-800/40 flex flex-col ${
                    !cell.isCurrentMonth ? 'opacity-30 bg-gray-950/80' : 'bg-gray-900/40'
                  }`}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-emerald-500 text-black font-extrabold ring-2 ring-emerald-300'
                          : cell.isCurrentMonth
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Quick Add icon on hover */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-emerald-400">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Day Event Pills */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5 custom-scrollbar">
                    {daySchedules.map((item) => {
                      let colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-800/60';
                      if (item.status === 'confirmed') colorClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
                      if (item.status === 'completed') colorClasses = 'bg-blue-950/80 text-blue-300 border-blue-800/60';
                      if (item.status === 'cancelled') colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-800/60';

                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSchedule(item);
                            setIsDetailModalOpen(true);
                          }}
                          className={`p-1 rounded-lg border text-[10px] leading-tight font-medium truncate shadow-sm hover:scale-[1.02] transition-transform flex items-center gap-1 ${colorClasses}`}
                          title={`${item.time} - ${item.title} (${item.contactName})`}
                        >
                          <span className="font-mono text-[9px] opacity-80 shrink-0">{item.time}</span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE: LIST / AGENDA */}
      {viewMode === 'list' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredSchedules.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">
              Nenhum agendamento encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredSchedules
                .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1))
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-gray-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-lg">
                          {item.date.split('-').reverse().join('/')} às {item.time}
                        </span>
                        {getStatusBadge(item.status)}
                        {item.sendWhatsAppReminder && (
                          <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                            <MessageSquare className="w-2.5 h-2.5" /> Lembrete Ativo
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-gray-100 text-sm">{item.title}</h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1 text-gray-300">
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          {item.contactName} ({item.contactPhone})
                        </span>
                        {item.attendantName && (
                          <span className="text-gray-400">
                            Atendente: <strong className="text-gray-200">{item.attendantName}</strong>
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-gray-400 italic bg-gray-950 p-2 rounded-xl border border-gray-800 mt-2">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSendReminderNow(item)}
                        className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-semibold text-xs px-3 py-1.5 rounded-xl border border-emerald-800/60 flex items-center gap-1.5 cursor-pointer"
                        title="Enviar lembrete agora via WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Disparar WhatsApp
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 text-gray-400 hover:text-white bg-gray-950 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteSchedule(item.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 bg-gray-950 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL / QUICK ACTION MODAL */}
      {isDetailModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-gray-100 text-base">Detalhes do Agendamento</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400">Título / Assunto:</span>
                <p className="text-sm font-bold text-gray-100">{selectedSchedule.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-950 p-3 rounded-xl border border-gray-800">
                <div>
                  <span className="text-gray-400">Data &amp; Horário:</span>
                  <p className="font-bold text-emerald-400">
                    {selectedSchedule.date.split('-').reverse().join('/')} às {selectedSchedule.time}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Status Atual:</span>
                  <div className="mt-1">{getStatusBadge(selectedSchedule.status)}</div>
                </div>
              </div>

              <div>
                <span className="text-gray-400">Cliente / Contato:</span>
                <p className="font-semibold text-gray-200">
                  {selectedSchedule.contactName} ({selectedSchedule.contactPhone})
                </p>
              </div>

              {selectedSchedule.attendantName && (
                <div>
                  <span className="text-gray-400">Atendente Responsável:</span>
                  <p className="text-gray-200">{selectedSchedule.attendantName}</p>
                </div>
              )}

              {selectedSchedule.notes && (
                <div>
                  <span className="text-gray-400">Observações:</span>
                  <p className="bg-gray-950 p-2.5 rounded-xl border border-gray-800 text-gray-300 italic">
                    "{selectedSchedule.notes}"
                  </p>
                </div>
              )}

              {/* Quick status buttons */}
              <div className="pt-2 border-t border-gray-800 space-y-1.5">
                <span className="text-gray-400 font-semibold block">Mudar Status Rápido:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleQuickStatusUpdate(selectedSchedule.id, 'confirmed')}
                    className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold py-1.5 rounded-xl border border-emerald-800 text-[11px] cursor-pointer"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleQuickStatusUpdate(selectedSchedule.id, 'completed')}
                    className="bg-blue-950 hover:bg-blue-900 text-blue-300 font-bold py-1.5 rounded-xl border border-blue-800 text-[11px] cursor-pointer"
                  >
                    Concluir
                  </button>
                  <button
                    onClick={() => handleQuickStatusUpdate(selectedSchedule.id, 'cancelled')}
                    className="bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold py-1.5 rounded-xl border border-rose-800 text-[11px] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
              <button
                onClick={() => handleSendReminderNow(selectedSchedule)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <Send className="w-3.5 h-3.5" />
                Lembrete WhatsApp
              </button>

              <button
                onClick={() => handleOpenEditModal(selectedSchedule)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs px-3 py-2 rounded-xl border border-gray-700 cursor-pointer"
              >
                Editar
              </button>

              <button
                onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                className="bg-rose-950 hover:bg-rose-900 text-rose-300 p-2 rounded-xl border border-rose-800 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW / EDIT SCHEDULE MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSchedule}
            className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-gray-100 text-base">
                {selectedSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Título do Agendamento / Assunto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Retorno Comercial, Reunião de Alinhamento..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Nome do Cliente / Contato *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo..."
                    value={formContactName}
                    onChange={(e) => setFormContactName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+55 11 99999-9999"
                    value={formContactPhone}
                    onChange={(e) => setFormContactPhone(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Data *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Horário *</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Atendente Responsável</label>
                  <select
                    value={formAttendantId}
                    onChange={(e) => setFormAttendantId(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Selecione atendente...</option>
                    {attendants.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Status Inicial</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Realizado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Observações / Detalhes</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais para a reunião..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-gray-800">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSendReminder}
                    onChange={(e) => setFormSendReminder(e.target.checked)}
                    className="rounded bg-gray-950 border-gray-800 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Enviar lembrete de agendamento no WhatsApp do cliente</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer shadow"
              >
                {selectedSchedule ? 'Salvar Alterações' : 'Criar Agendamento'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
