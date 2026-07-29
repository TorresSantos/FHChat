import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  Clock,
  Users,
  Layers,
  PhoneCall,
  Search,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Ticket, Queue, Attendant, WhatsAppConnection, Department } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface ReportsManagerProps {
  tickets: Ticket[];
  queues?: Queue[];
  attendants?: Attendant[];
  connections?: WhatsAppConnection[];
  departments?: Department[];
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  tickets,
  queues = [],
  attendants = [],
  connections = [],
  departments = []
}) => {
  // Filters State
  const [selectedConnection, setSelectedConnection] = useState<string>('all');
  const [selectedQueue, setSelectedQueue] = useState<string>('all');
  const [selectedAttendant, setSelectedAttendant] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Date Range Filter
  const [datePreset, setDatePreset] = useState<string>('all'); // 'all', 'today', 'yesterday', '7days', '30days', 'custom'
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Hourly Range Filter
  const [hourPreset, setHourPreset] = useState<string>('all'); // 'all', 'morning', 'afternoon', 'night', 'custom'
  const [startHour, setStartHour] = useState<number>(0); // 0..23
  const [endHour, setEndHour] = useState<number>(23); // 0..23

  // Search in table
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedConnection('all');
    setSelectedQueue('all');
    setSelectedAttendant('all');
    setSelectedStatus('all');
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setHourPreset('all');
    setStartHour(0);
    setEndHour(23);
    setSearchTerm('');
  };

  // Filter Logic
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Connection Filter
      if (selectedConnection !== 'all' && t.connectionId !== selectedConnection) {
        return false;
      }

      // 2. Queue Filter
      if (selectedQueue !== 'all' && t.queueId !== selectedQueue) {
        return false;
      }

      // 3. Attendant Filter
      if (selectedAttendant !== 'all' && t.attendantId !== selectedAttendant) {
        return false;
      }

      // 4. Status Filter
      if (selectedStatus !== 'all' && t.status !== selectedStatus) {
        return false;
      }

      // 5. Date Filter
      const ticketDate = new Date(t.createdAt || Date.now());

      if (datePreset === 'today') {
        const today = new Date();
        if (
          ticketDate.getDate() !== today.getDate() ||
          ticketDate.getMonth() !== today.getMonth() ||
          ticketDate.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }
      } else if (datePreset === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (
          ticketDate.getDate() !== yesterday.getDate() ||
          ticketDate.getMonth() !== yesterday.getMonth() ||
          ticketDate.getFullYear() !== yesterday.getFullYear()
        ) {
          return false;
        }
      } else if (datePreset === '7days') {
        const past7 = new Date();
        past7.setDate(past7.getDate() - 7);
        if (ticketDate < past7) return false;
      } else if (datePreset === '30days') {
        const past30 = new Date();
        past30.setDate(past30.getDate() - 30);
        if (ticketDate < past30) return false;
      } else if (datePreset === 'custom' && customStartDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        if (ticketDate < start) return false;

        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (ticketDate > end) return false;
        }
      }

      // 6. Hourly Filter
      const ticketHour = ticketDate.getHours();

      if (hourPreset === 'morning') {
        if (ticketHour < 8 || ticketHour >= 12) return false;
      } else if (hourPreset === 'afternoon') {
        if (ticketHour < 12 || ticketHour >= 18) return false;
      } else if (hourPreset === 'night') {
        if (ticketHour < 18 || ticketHour > 23) return false;
      } else if (hourPreset === 'custom') {
        if (ticketHour < startHour || ticketHour > endHour) return false;
      }

      // 7. Text Search
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        const matchesProtocol = t.protocol.toLowerCase().includes(lower);
        const matchesContact = t.contact.name.toLowerCase().includes(lower);
        const matchesPhone = t.contact.phone.toLowerCase().includes(lower);
        if (!matchesProtocol && !matchesContact && !matchesPhone) return false;
      }

      return true;
    });
  }, [
    tickets,
    selectedConnection,
    selectedQueue,
    selectedAttendant,
    selectedStatus,
    datePreset,
    customStartDate,
    customEndDate,
    hourPreset,
    startHour,
    endHour,
    searchTerm
  ]);

  // Hourly Chart Data (Distribution 00h to 23h)
  const hourlyData = useMemo(() => {
    const hoursMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hoursMap[h] = 0;

    filteredTickets.forEach((t) => {
      const date = new Date(t.createdAt || Date.now());
      const h = date.getHours();
      hoursMap[h] = (hoursMap[h] || 0) + 1;
    });

    return Object.keys(hoursMap).map((h) => ({
      hora: `${h.padStart(2, '0')}:00`,
      atendimentos: hoursMap[Number(h)]
    }));
  }, [filteredTickets]);

  // Queue Chart Data
  const queueData = useMemo(() => {
    const queueCounts: Record<string, number> = {};

    filteredTickets.forEach((t) => {
      const q = queues.find((item) => item.id === t.queueId);
      const qName = q ? q.name : 'Sem Fila';
      queueCounts[qName] = (queueCounts[qName] || 0) + 1;
    });

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4'];

    return Object.keys(queueCounts).map((name, idx) => ({
      name,
      value: queueCounts[name],
      color: colors[idx % colors.length]
    }));
  }, [filteredTickets, queues]);

  // Attendant Breakdown Data
  const attendantData = useMemo(() => {
    const attCounts: Record<string, number> = {};

    filteredTickets.forEach((t) => {
      const att = attendants.find((item) => item.id === t.attendantId);
      const attName = att ? att.name : 'Bot / Não Atribuído';
      attCounts[attName] = (attCounts[attName] || 0) + 1;
    });

    return Object.keys(attCounts).map((name) => ({
      name,
      atendimentos: attCounts[name]
    }));
  }, [filteredTickets, attendants]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredTickets.length === 0) return;

    const headers = [
      'Protocolo',
      'Cliente',
      'Telefone',
      'Conexao',
      'Fila',
      'Atendente',
      'Status',
      'Data de Criacao',
      'Hora'
    ];

    const rows = filteredTickets.map((t) => {
      const conn = connections.find((c) => c.id === t.connectionId)?.name || 'Linha Geral';
      const q = queues.find((item) => item.id === t.queueId)?.name || 'Sem Fila';
      const att = attendants.find((item) => item.id === t.attendantId)?.name || 'Bot / Não Atribuído';
      const dt = new Date(t.createdAt || Date.now());

      return [
        `"${t.protocol}"`,
        `"${t.contact.name.replace(/"/g, '""')}"`,
        `"${t.contact.phone}"`,
        `"${conn.replace(/"/g, '""')}"`,
        `"${q.replace(/"/g, '""')}"`,
        `"${att.replace(/"/g, '""')}"`,
        `"${t.status}"`,
        `"${dt.toLocaleDateString('pt-BR')}"`,
        `"${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_atendimentos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFiltered = filteredTickets.length;
  const resolvedCount = filteredTickets.filter((t) => t.status === 'resolved').length;
  const inProgressCount = filteredTickets.filter((t) => t.status === 'in_progress').length;
  const pendingCount = filteredTickets.filter((t) => t.status === 'pending').length;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              Relatórios Avançados de Atendimento
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Filtre atendimentos por conexões WhatsApp, filas, atendentes, período de dias e intervalos de horas personalizados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-700 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpar Filtros
            </button>
            <button
              onClick={handleExportCSV}
              disabled={totalFiltered === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar CSV ({totalFiltered})
            </button>
          </div>
        </div>

        {/* Multi-Dimensional Filter Control Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Filter className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-gray-200">Painel de Filtros e Segmentação</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. Conexões */}
            <div className="space-y-1">
              <label className="text-gray-400 font-medium flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                Conexão WhatsApp
              </label>
              <select
                value={selectedConnection}
                onChange={(e) => setSelectedConnection(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="all">Todas as Conexões ({connections.length})</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Filas */}
            <div className="space-y-1">
              <label className="text-gray-400 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Fila de Atendimento
              </label>
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="all">Todas as Filas ({queues.length})</option>
                {queues.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Atendente */}
            <div className="space-y-1">
              <label className="text-gray-400 font-medium flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Atendente Responsável
              </label>
              <select
                value={selectedAttendant}
                onChange={(e) => setSelectedAttendant(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="all">Todos os Atendentes ({attendants.length})</option>
                {attendants.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Período / Dias */}
            <div className="space-y-1">
              <label className="text-gray-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Período / Dia
              </label>
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="all">Todo o Histórico</option>
                <option value="today">Hoje</option>
                <option value="yesterday">Ontem</option>
                <option value="7days">Últimos 7 dias</option>
                <option value="30days">Últimos 30 dias</option>
                <option value="custom">Data Personalizada</option>
              </select>
            </div>

            {/* 5. Intervalo de Horas */}
            <div className="space-y-1">
              <label className="text-gray-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Intervalo de Horas
              </label>
              <select
                value={hourPreset}
                onChange={(e) => setHourPreset(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="all">Todas as Horas (00h-23h)</option>
                <option value="morning">Manhã (08h - 12h)</option>
                <option value="afternoon">Tarde (12h - 18h)</option>
                <option value="night">Noite (18h - 23h)</option>
                <option value="custom">Faixa Específica de Horário</option>
              </select>
            </div>
          </div>

          {/* Conditional Custom Date Inputs */}
          {datePreset === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-800 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Data Inicial</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Data Final</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Conditional Custom Hour Range Inputs */}
          {hourPreset === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-800 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Hora Inicial (0h a 23h)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="23"
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <span className="font-mono text-emerald-400 font-bold px-2 py-0.5 bg-gray-950 rounded border border-gray-800">
                    {String(startHour).padStart(2, '0')}:00
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Hora Final (0h a 23h)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="23"
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <span className="font-mono text-emerald-400 font-bold px-2 py-0.5 bg-gray-950 rounded border border-gray-800">
                    {String(endHour).padStart(2, '0')}:59
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter KPI Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs text-gray-400 font-medium">Atendimentos Filtrados</p>
              <p className="text-2xl font-extrabold text-white font-mono mt-1">{totalFiltered}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs text-emerald-400 font-medium">Finalizados / Fechados</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{resolvedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs text-blue-400 font-medium">Em Andamento</p>
              <p className="text-2xl font-extrabold text-blue-400 font-mono mt-1">{inProgressCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs text-amber-400 font-medium">Aguardando na Fila</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Interactive Recharts Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Volume por Hora do Dia */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Volume de Atendimentos por Hora do Dia
            </h3>
            <p className="text-xs text-gray-400">
              Identifique horários de pico e concentração de chamados no filtro selecionado.
            </p>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="hora" stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="atendimentos" stroke="#10b981" fillOpacity={1} fill="url(#colorHourly)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Atendimentos por Fila */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Distribuição por Fila de Atendimento
            </h3>
            <p className="text-xs text-gray-400">
              Proporção de demanda dividida entre as filas ativas.
            </p>
            <div className="h-64 w-full flex items-center justify-center">
              {queueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={queueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {queueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-gray-500 italic">Sem dados suficientes para exibição.</p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Filtered Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-200">
                Detalhamento dos Atendimentos ({filteredTickets.length})
              </h3>
              <p className="text-xs text-gray-400">
                Lista completa com dados de conexões, filas, atendentes e timestamps.
              </p>
            </div>

            {/* Quick Search in Table */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por protocolo, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-semibold">
                  <th className="pb-3 px-2">Protocolo</th>
                  <th className="pb-3 px-2">Cliente / Telefone</th>
                  <th className="pb-3 px-2">Conexão WhatsApp</th>
                  <th className="pb-3 px-2">Fila</th>
                  <th className="pb-3 px-2">Atendente</th>
                  <th className="pb-3 px-2">Data &amp; Hora</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredTickets.map((t) => {
                  const conn = connections.find((c) => c.id === t.connectionId)?.name || 'Linha Principal';
                  const q = queues.find((item) => item.id === t.queueId)?.name || 'Sem Fila';
                  const att = attendants.find((item) => item.id === t.attendantId)?.name || 'Bot FHChat';
                  const dt = new Date(t.createdAt || Date.now());

                  return (
                    <tr key={t.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-2 font-mono text-emerald-400 font-bold">{t.protocol}</td>
                      <td className="py-3 px-2">
                        <div className="font-semibold text-gray-200">{t.contact.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{t.contact.phone}</div>
                      </td>
                      <td className="py-3 px-2 font-medium text-gray-300">
                        <span className="bg-gray-950 border border-gray-800 px-2 py-0.5 rounded-md font-mono text-[11px]">
                          {conn}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium text-emerald-400">{q}</td>
                      <td className="py-3 px-2 font-medium text-gray-300">{att}</td>
                      <td className="py-3 px-2 text-gray-400 font-mono text-[11px]">
                        {dt.toLocaleDateString('pt-BR')} às {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-2">
                        {t.status === 'resolved' && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Finalizado
                          </span>
                        )}
                        {t.status === 'in_progress' && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Em Andamento
                          </span>
                        )}
                        {t.status === 'pending' && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Fila / Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 text-xs italic">
                      Nenhum atendimento encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
