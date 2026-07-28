import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  Smartphone,
  Layers,
  UserCheck,
  Copy,
  Check,
  ExternalLink,
  Download,
  CheckCircle2,
  Clock,
  Star,
  RefreshCw,
  FileText,
  X,
  ArrowUpDown,
  Printer
} from 'lucide-react';
import {
  Ticket,
  WhatsAppConnection,
  Queue,
  Attendant,
  Department
} from '../../types';

interface ReportsManagerProps {
  tickets: Ticket[];
  connections: WhatsAppConnection[];
  queues: Queue[];
  attendants: Attendant[];
  departments: Department[];
  onSelectTicket: (ticketId: string) => void;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  tickets,
  connections,
  queues,
  attendants,
  departments,
  onSelectTicket
}) => {
  // Filter States
  const [datePreset, setDatePreset] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('all');
  const [selectedQueueId, setSelectedQueueId] = useState<string>('all');
  const [selectedAttendantId, setSelectedAttendantId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, open, closed
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI States
  const [selectedProtocolTicket, setSelectedProtocolTicket] = useState<Ticket | null>(null);
  const [copiedProtocolId, setCopiedProtocolId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Handle Preset Changes
  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7days') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === '30days') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Filter Logic
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Helper protocol format generator if missing
      const protocol =
        t.protocol ||
        `PROT-${new Date(t.createdAt).getFullYear()}${String(new Date(t.createdAt).getMonth() + 1).padStart(2, '0')}${String(new Date(t.createdAt).getDate()).padStart(2, '0')}-${t.id.replace(/\D/g, '') || '101'}`;

      // 1. Search Query (Name, Phone, Protocol)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = t.contact.name.toLowerCase().includes(query);
        const matchesPhone = t.contact.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '')) || t.contact.phone.includes(query);
        const matchesProtocol = protocol.toLowerCase().includes(query);

        if (!matchesName && !matchesPhone && !matchesProtocol) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter === 'open' && t.status === 'resolved') return false;
      if (statusFilter === 'closed' && t.status !== 'resolved') return false;

      // 3. Connection Filter
      if (selectedConnectionId !== 'all' && t.connectionId !== selectedConnectionId) {
        return false;
      }

      // 4. Queue Filter
      if (selectedQueueId !== 'all' && t.queueId !== selectedQueueId) {
        return false;
      }

      // 5. Attendant Filter
      if (selectedAttendantId !== 'all' && t.assignedAttendantId !== selectedAttendantId) {
        return false;
      }

      // 6. Date Range Filter
      if (startDate) {
        const ticketDate = new Date(t.createdAt).toISOString().split('T')[0];
        if (ticketDate < startDate) return false;
      }
      if (endDate) {
        const ticketDate = new Date(t.createdAt).toISOString().split('T')[0];
        if (ticketDate > endDate) return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [
    tickets,
    searchQuery,
    statusFilter,
    selectedConnectionId,
    selectedQueueId,
    selectedAttendantId,
    startDate,
    endDate,
    sortOrder
  ]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = filteredTickets.length;
    const open = filteredTickets.filter((t) => t.status !== 'resolved').length;
    const closed = filteredTickets.filter((t) => t.status === 'resolved').length;

    const ratedTickets = filteredTickets.filter((t) => t.rating && t.rating > 0);
    const avgRating = ratedTickets.length
      ? (ratedTickets.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedTickets.length).toFixed(1)
      : '5.0';

    return { total, open, closed, avgRating };
  }, [filteredTickets]);

  // Reset all filters
  const handleResetFilters = () => {
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setSelectedConnectionId('all');
    setSelectedQueueId('all');
    setSelectedAttendantId('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  // Copy Protocol Handler
  const handleCopyProtocol = (protocolStr: string, ticketId: string) => {
    navigator.clipboard.writeText(protocolStr);
    setCopiedProtocolId(ticketId);
    setTimeout(() => setCopiedProtocolId(null), 2000);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredTickets.length === 0) return;

    const headers = [
      'Protocolo',
      'Status Protocolo',
      'Data Abertura',
      'Data Encerramento',
      'Cliente Nome',
      'Cliente Telefone',
      'Conexão WhatsApp',
      'Fila/Setor',
      'Atendente',
      'Avaliação CSAT'
    ];

    const rows = filteredTickets.map((t) => {
      const protocol =
        t.protocol ||
        `PROT-${new Date(t.createdAt).getFullYear()}${String(new Date(t.createdAt).getMonth() + 1).padStart(2, '0')}${String(new Date(t.createdAt).getDate()).padStart(2, '0')}-${t.id.replace(/\D/g, '') || '101'}`;
      const statusText = t.status === 'resolved' ? 'Encerrado' : 'Aberto';
      const openDate = new Date(t.createdAt).toLocaleString('pt-BR');
      const closeDate = t.closedAt ? new Date(t.closedAt).toLocaleString('pt-BR') : 'Em Aberto';
      const conn = connections.find((c) => c.id === t.connectionId)?.name || 'Padrão';
      const queue = queues.find((q) => q.id === t.queueId)?.name || 'Geral';
      const att = attendants.find((a) => a.id === t.assignedAttendantId)?.name || 'Não atribuído';
      const rating = t.rating ? `${t.rating}/5` : 'Sem nota';

      return [
        `"${protocol}"`,
        `"${statusText}"`,
        `"${openDate}"`,
        `"${closeDate}"`,
        `"${t.contact.name}"`,
        `"${t.contact.phone}"`,
        `"${conn}"`,
        `"${queue}"`,
        `"${att}"`,
        `"${rating}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_protocolos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 md:p-6 overflow-y-auto space-y-6">
      {/* Top Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Relatório Geral de Atendimentos & Protocolos
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase font-bold">
                  Painel Admin
                </span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Consulte todos os protocolos abertos e encerrados com filtros por data, conexão, fila e atendente.
              </p>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white flex items-center gap-2 transition-all shadow-md shadow-emerald-900/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Protocol Lifecycle Rules Banner */}
      <div className="bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 text-xs text-emerald-800 dark:text-emerald-300">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm mb-0.5 text-emerald-600 dark:text-emerald-400">
            Regra do Protocolo de Atendimento:
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Mesmo que o atendente não envie manualmente o número do protocolo ao cliente, todo atendimento abre e gera automaticamente um protocolo único de acompanhamento. O protocolo permanece com o status <strong className="text-emerald-600 dark:text-emerald-400">ABERTO</strong> durante todo o fluxo do chat, e só é <strong className="text-rose-600 dark:text-rose-400">ENCERRADO</strong> quando o atendimento for finalizado pelo operador.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-500" /> Filtros e Pesquisa Avançada
          </h3>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Limpar Filtros
          </button>
        </div>

        {/* Primary Search Bar (Search by Client Name, Phone or Protocol) */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por Nome do Cliente, Telefone ou Número do Protocolo (ex: PROT-20260728-101)..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* Preset Date Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-500" /> Período
            </label>
            <select
              value={datePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todo o Histórico</option>
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="month">Este Mês</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {/* Connection Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-500" /> Conexão WhatsApp
            </label>
            <select
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas as Conexões</option>
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Queue / Sector Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-500" /> Fila / Setor
            </label>
            <select
              value={selectedQueueId}
              onChange={(e) => setSelectedQueueId(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas as Filas</option>
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>

          {/* Attendant Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-500" /> Atendente
            </label>
            <select
              value={selectedAttendantId}
              onChange={(e) => setSelectedAttendantId(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos os Atendentes</option>
              {attendants.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-500" /> Status do Protocolo
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos os Status</option>
              <option value="open">Abertos / Em Andamento</option>
              <option value="closed">Encerrados / Finalizados</option>
            </select>
          </div>
        </div>

        {/* Custom Date Pickers if 'custom' datePreset is selected */}
        {datePreset === 'custom' && (
          <div className="flex items-center space-x-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-gray-500">Data Inicial:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-1.5 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-gray-500">Data Final:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full py-1.5 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Total de Protocolos
            </p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {metrics.total}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Protocolos Abertos
            </p>
            <p className="text-xl font-extrabold text-amber-500 mt-0.5">
              {metrics.open}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Protocolos Encerrados
            </p>
            <p className="text-xl font-extrabold text-blue-500 mt-0.5">
              {metrics.closed}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Satisfação Média (CSAT)
            </p>
            <p className="text-xl font-extrabold text-purple-500 mt-0.5 flex items-center gap-1">
              {metrics.avgRating} <span className="text-xs text-amber-400 font-normal">★</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              Listagem de Protocolos
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
              {filteredTickets.length} registros encontrados
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-emerald-500 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Ordenar por Data ({sortOrder === 'desc' ? 'Mais Recentes' : 'Mais Antigos'})</span>
          </button>
        </div>

        {/* Table Body */}
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">
              Nenhum protocolo encontrado com os filtros selecionados
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Tente alterar os termos da busca, ajustar as datas do período ou selecionar outro atendente ou fila de atendimento.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 transition-all shadow-md"
            >
              Resetar Todos os Filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100 dark:border-gray-800 select-none">
                <tr>
                  <th className="py-3.5 px-4">Protocolo & Status</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Abertura</th>
                  <th className="py-3.5 px-4">Encerramento</th>
                  <th className="py-3.5 px-4">Conexão / Fila</th>
                  <th className="py-3.5 px-4">Atendente</th>
                  <th className="py-3.5 px-4 text-center">CSAT</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200 font-medium">
                {filteredTickets.map((t) => {
                  const protocol =
                    t.protocol ||
                    `PROT-${new Date(t.createdAt).getFullYear()}${String(new Date(t.createdAt).getMonth() + 1).padStart(2, '0')}${String(new Date(t.createdAt).getDate()).padStart(2, '0')}-${t.id.replace(/\D/g, '') || '101'}`;

                  const conn = connections.find((c) => c.id === t.connectionId);
                  const queue = queues.find((q) => q.id === t.queueId);
                  const att = attendants.find((a) => a.id === t.assignedAttendantId);
                  const isClosed = t.status === 'resolved';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group"
                    >
                      {/* Protocol Code & Status Badge */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-[11px]">
                              {protocol}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyProtocol(protocol, t.id)}
                              className="text-gray-400 hover:text-emerald-500 p-1 transition-colors"
                              title="Copiar Código do Protocolo"
                            >
                              {copiedProtocolId === t.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {isClosed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Encerrado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
                              <Clock className="w-3 h-3" /> Aberto / Em Andamento
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Client Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          {t.contact.avatar ? (
                            <img
                              src={t.contact.avatar}
                              alt={t.contact.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-500/20">
                              {t.contact.name.charAt(0)}
                            </div>
                          )}
                          <div className="truncate max-w-[150px]">
                            <p className="font-bold text-gray-900 dark:text-white truncate">
                              {t.contact.name}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono truncate">
                              {t.contact.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Open Date */}
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[11px]">
                            {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(t.createdAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </td>

                      {/* Close Date */}
                      <td className="py-3.5 px-4">
                        {isClosed && t.closedAt ? (
                          <div className="space-y-0.5 text-blue-600 dark:text-blue-400">
                            <p className="font-semibold text-[11px]">
                              {new Date(t.closedAt).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-[10px] opacity-80">
                              {new Date(t.closedAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-500 italic font-medium">
                            Em aberto...
                          </span>
                        )}
                      </td>

                      {/* Connection & Queue */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[120px]">
                              {conn ? conn.name : 'Conexão Padrão'}
                            </span>
                          </p>
                          <p
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md inline-block"
                            style={{
                              backgroundColor: queue ? `${queue.color}15` : '#10B98115',
                              color: queue ? queue.color : '#10B981'
                            }}
                          >
                            {queue ? queue.name : 'Fila Geral'}
                          </p>
                        </div>
                      </td>

                      {/* Attendant */}
                      <td className="py-3.5 px-4">
                        {att ? (
                          <div className="flex items-center space-x-2">
                            {att.avatar ? (
                              <img
                                src={att.avatar}
                                alt={att.name}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 font-bold flex items-center justify-center text-[10px] shrink-0">
                                {att.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[110px]">
                              {att.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">
                            Aguardando da fila
                          </span>
                        )}
                      </td>

                      {/* CSAT Rating */}
                      <td className="py-3.5 px-4 text-center">
                        {t.rating ? (
                          <div className="inline-flex items-center gap-0.5 font-bold text-amber-400 text-xs">
                            <span>{t.rating}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[10px]">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => setSelectedProtocolTicket(t)}
                            className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all"
                            title="Ver Detalhes do Protocolo"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectTicket(t.id)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] rounded-xl transition-all flex items-center gap-1 shadow-xs"
                            title="Abrir Chat deste Atendimento"
                          >
                            <span>Abrir Chat</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Protocol Details Modal */}
      {selectedProtocolTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Ficha do Protocolo
                  </h3>
                  <p className="text-xs text-gray-500">
                    Detalhes completos do registro de atendimento
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProtocolTicket(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Protocol Card */}
            <div className="bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Código de Registro:
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {selectedProtocolTicket.protocol ||
                    `PROT-${new Date(selectedProtocolTicket.createdAt).getFullYear()}${String(new Date(selectedProtocolTicket.createdAt).getMonth() + 1).padStart(2, '0')}${String(new Date(selectedProtocolTicket.createdAt).getDate()).padStart(2, '0')}-${selectedProtocolTicket.id.replace(/\D/g, '') || '101'}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Status Atual:
                </span>
                {selectedProtocolTicket.status === 'resolved' ? (
                  <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    Encerrado
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Aberto / Em Andamento
                  </span>
                )}
              </div>
            </div>

            {/* Ticket Information */}
            <div className="space-y-2 text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Cliente:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedProtocolTicket.contact.name} ({selectedProtocolTicket.contact.phone})
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Data de Abertura:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {new Date(selectedProtocolTicket.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Data de Encerramento:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedProtocolTicket.closedAt
                    ? new Date(selectedProtocolTicket.closedAt).toLocaleString('pt-BR')
                    : 'Ainda em aberto'}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Atendente:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {attendants.find((a) => a.id === selectedProtocolTicket.assignedAttendantId)
                    ?.name || 'Não atribuído'}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Fila / Setor:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {queues.find((q) => q.id === selectedProtocolTicket.queueId)?.name || 'Geral'}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Conexão WhatsApp:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {connections.find((c) => c.id === selectedProtocolTicket.connectionId)?.name ||
                    'Padrão'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleCopyProtocol(
                    selectedProtocolTicket.protocol ||
                      `PROT-${new Date(selectedProtocolTicket.createdAt).getFullYear()}${String(new Date(selectedProtocolTicket.createdAt).getMonth() + 1).padStart(2, '0')}${String(new Date(selectedProtocolTicket.createdAt).getDate()).padStart(2, '0')}-${selectedProtocolTicket.id.replace(/\D/g, '') || '101'}`,
                    selectedProtocolTicket.id
                  );
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Protocolo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTicket(selectedProtocolTicket.id);
                  setSelectedProtocolTicket(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <span>Ir para Atendimento</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
