import React, { useState, useMemo } from 'react';
import {
  BarChart2,
  TrendingUp,
  Clock,
  CheckCircle2,
  MessageSquare,
  Star,
  Users,
  Shield,
  ShieldAlert,
  Smartphone,
  Layers,
  Filter,
  ArrowUpRight,
  UserCheck,
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  Building
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Ticket, Attendant, Department, WhatsAppConnection, Queue, TicketStatus } from '../../types';

interface AnalyticsDashboardProps {
  tickets: Ticket[];
  attendants: Attendant[];
  departments: Department[];
  connections: WhatsAppConnection[];
  queues: Queue[];
  currentAttendant: Attendant;
  onSelectTicket?: (ticketId: string) => void;
  onNavigateToChats?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  tickets,
  attendants,
  departments,
  connections,
  queues,
  currentAttendant,
  onSelectTicket,
  onNavigateToChats
}) => {
  const isAdmin = currentAttendant.role === 'admin';
  const isSupervisor = currentAttendant.role === 'supervisor';
  const hasAccess = isAdmin || isSupervisor;

  // Filter state inside dashboard table
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('all');
  const [tableQueueFilter, setTableQueueFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Determine Scope of Connections & Queues
  const supervisorConns = useMemo(() => {
    return currentAttendant.connectionIds || [];
  }, [currentAttendant]);

  const supervisorQueues = useMemo(() => {
    return currentAttendant.queueIds || [];
  }, [currentAttendant]);

  // 2. Filter Scoped Tickets
  const scopedTickets = useMemo(() => {
    if (isAdmin) {
      return tickets;
    }
    if (isSupervisor) {
      return tickets.filter((t) => {
        const matchesConn = t.connectionId && supervisorConns.includes(t.connectionId);
        const matchesQueue = t.queueId && supervisorQueues.includes(t.queueId);
        const matchesAttendant = t.assignedAttendantId === currentAttendant.id;

        // If supervisor has assigned queues/connections, filter by them; otherwise show their tickets
        if (supervisorConns.length > 0 || supervisorQueues.length > 0) {
          return Boolean(matchesConn || matchesQueue || matchesAttendant);
        }
        return true;
      });
    }
    return [];
  }, [tickets, isAdmin, isSupervisor, supervisorConns, supervisorQueues, currentAttendant.id]);

  // 3. Filter Scoped Attendants
  const scopedAttendants = useMemo(() => {
    if (isAdmin) {
      return attendants;
    }
    if (isSupervisor) {
      // Return attendants assigned to supervisor's queues or connections
      return attendants.filter((a) => {
        if (a.id === currentAttendant.id) return true;
        const sharesConn = (a.connectionIds || []).some((cId) => supervisorConns.includes(cId));
        const sharesQueue = (a.queueIds || []).some((qId) => supervisorQueues.includes(qId));
        return sharesConn || sharesQueue;
      });
    }
    return [];
  }, [attendants, isAdmin, isSupervisor, supervisorConns, supervisorQueues, currentAttendant.id]);

  // Scope Metrics Calculations
  const totalScoped = scopedTickets.length;
  const inProgressCount = scopedTickets.filter((t) => t.status === 'in_progress').length;
  const pendingCount = scopedTickets.filter((t) => t.status === 'pending').length;
  const resolvedCount = scopedTickets.filter((t) => t.status === 'resolved').length;
  const resolutionRate = totalScoped > 0 ? Math.round((resolvedCount / totalScoped) * 100) : 100;

  // Chart 1: Queue Distribution Data
  const queueChartData = useMemo(() => {
    return queues
      .map((q) => {
        const count = scopedTickets.filter((t) => t.queueId === q.id).length;
        return {
          name: q.name,
          color: q.color,
          chamados: count
        };
      })
      .filter((q) => isAdmin || q.chamados > 0 || supervisorQueues.includes(queues.find((item) => item.name === q.name)?.id || ''));
  }, [queues, scopedTickets, isAdmin, supervisorQueues]);

  // Chart 2: Connection Distribution Data
  const connectionChartData = useMemo(() => {
    return connections
      .map((c) => {
        const count = scopedTickets.filter((t) => t.connectionId === c.id).length;
        return {
          name: c.name.replace('WhatsApp ', ''),
          fullName: c.name,
          value: count
        };
      })
      .filter((c) => isAdmin || c.value > 0);
  }, [connections, scopedTickets, isAdmin]);

  // Chart 3: Weekly Trend Simulation Data
  const weeklyTrendData = [
    { dia: 'Seg', recebidos: 24, atendidos: 22, fila: 2 },
    { dia: 'Ter', recebidos: 35, atendidos: 31, fila: 4 },
    { dia: 'Qua', recebidos: 48, atendidos: 42, fila: 6 },
    { dia: 'Qui', recebidos: 40, atendidos: 38, fila: 2 },
    { dia: 'Sex', recebidos: 52, atendidos: 48, fila: 4 },
    { dia: 'Sáb', recebidos: 28, atendidos: 27, fila: 1 },
    { dia: 'Dom', recebidos: 15, atendidos: 15, fila: 0 }
  ];

  // Table Filtered Tickets
  const filteredTableTickets = useMemo(() => {
    return scopedTickets.filter((t) => {
      // Status filter
      if (tableStatusFilter !== 'all' && t.status !== tableStatusFilter) {
        return false;
      }
      // Queue filter
      if (tableQueueFilter !== 'all' && t.queueId !== tableQueueFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const contactName = t.contact.name.toLowerCase();
        const contactPhone = t.contact.phone.toLowerCase();
        const snippet = (t.lastMessageSnippet || '').toLowerCase();
        return contactName.includes(query) || contactPhone.includes(query) || snippet.includes(query);
      }
      return true;
    });
  }, [scopedTickets, tableStatusFilter, tableQueueFilter, searchTerm]);

  // Helper functions
  const getQueue = (id?: string) => queues.find((q) => q.id === id);
  const getConnection = (id?: string) => connections.find((c) => c.id === id);
  const getAttendant = (id?: string) => attendants.find((a) => a.id === id);

  const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'];

  // Access Denied Screen for regular Attendants
  if (!hasAccess) {
    return (
      <div className="p-8 max-w-3xl mx-auto my-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Acesso Restrito ao Painel de Métricas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            O Dashboard de inteligência operacional e métricas de desempenho é exclusivo para{' '}
            <strong className="text-gray-900 dark:text-white">Supervisores</strong> e{' '}
            <strong className="text-gray-900 dark:text-white">Administradores</strong>.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 text-left space-y-2 max-w-md mx-auto">
          <p className="font-bold flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
            <Shield className="w-4 h-4 text-emerald-500" /> Seu perfil atual:
          </p>
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <img src={currentAttendant.avatar} alt={currentAttendant.name} className="w-7 h-7 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{currentAttendant.name}</p>
                <p className="text-[10px] text-gray-400">{currentAttendant.email}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded uppercase">
              {currentAttendant.role === 'attendant' ? 'Atendente Operacional' : currentAttendant.role}
            </span>
          </div>
        </div>

        {onNavigateToChats && (
          <button
            onClick={onNavigateToChats}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Ir para Minha Fila de Atendimentos
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full text-gray-900 dark:text-white">
      {/* Top Header & Role Scope Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-extrabold flex items-center gap-2">
              <BarChart2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              Painel de Desempenho & Supervisão
            </h2>

            {isAdmin ? (
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-bold text-[11px] rounded-lg flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Visão Geral - Administrador
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-300 font-bold text-[11px] rounded-lg flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Visão de Supervisor
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin
              ? 'Acompanhamento em tempo real de todas as conexões WhatsApp, filas de atendimento e equipe.'
              : `Monitorando ${supervisorQueues.length} fila(s) e ${supervisorConns.length} conexão(ões) de WhatsApp atribuídas ao seu perfil.`}
          </p>
        </div>

        {/* Supervisor Scope Tags Pill */}
        {isSupervisor && (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2.5 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suas Filas:</span>
            {supervisorQueues.length > 0 ? (
              supervisorQueues.map((qId) => {
                const q = getQueue(qId);
                return q ? (
                  <span
                    key={q.id}
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: q.color }}
                  >
                    {q.name}
                  </span>
                ) : null;
              })
            ) : (
              <span className="text-[11px] text-gray-400 italic">Todas as filas</span>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total de Chamados</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{totalScoped}</p>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> No seu escopo
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Em Andamento</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{inProgressCount}</p>
          <p className="text-[10px] text-gray-400">Com atendente ativo</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Aguardando Fila</p>
          <p className="text-2xl font-extrabold text-amber-500">{pendingCount}</p>
          <p className="text-[10px] text-gray-400">Espera estimada: ~2m</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Concluídos</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{resolvedCount}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">{resolutionRate}% resolvidos</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TMA (Resposta)</p>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">1m 32s</p>
          <p className="text-[10px] text-emerald-600 font-semibold">SLA de Atendimento Ótimo</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Satisfação CSAT</p>
          <div className="flex items-center gap-1 text-2xl font-extrabold text-amber-400">
            4.9 <Star className="w-5 h-5 fill-current" />
          </div>
          <p className="text-[10px] text-gray-400">Avaliação do cliente</p>
        </div>
      </div>

      {/* Main Graphics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-500" /> Fluxo Semanal de Atendimentos
              </h3>
              <p className="text-[11px] text-gray-400">Chamados recebidos vs atendidos no seu escopo</p>
            </div>
            <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-500">
              Últimos 7 dias
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRecebidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAtendidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="dia" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="recebidos"
                  name="Recebidos"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRecebidos)"
                />
                <Area
                  type="monotone"
                  dataKey="atendidos"
                  name="Atendidos"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAtendidos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Queue Distribution Bar Chart (1 Col) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" /> Volume por Fila
            </h3>
            <p className="text-[11px] text-gray-400">Distribuição de tickets nas filas atribuídas</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queueChartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="#888888" fontSize={11} hide />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="chamados" name="Chamados na Fila" radius={[0, 6, 6, 0]}>
                  {queueChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendants Leaderboard & Connection Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendants Performance in Scope */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" /> Atendentes no Seu Escopo
            </h3>
            <span className="text-[11px] text-gray-400">{scopedAttendants.length} operante(s)</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {scopedAttendants.length > 0 ? (
              scopedAttendants.map((a) => {
                const boundConns = connections.filter((c) => (a.connectionIds || []).includes(c.id));
                const boundQueues = queues.filter((q) => (a.queueIds || []).includes(q.id));

                return (
                  <div
                    key={a.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs transition-all hover:border-emerald-500/40"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img src={a.avatar} alt={a.name} className="w-9 h-9 rounded-full object-cover" />
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${
                            a.status === 'online' ? 'bg-emerald-500' : a.status === 'busy' ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-1.5">
                          <p className="font-bold text-gray-900 dark:text-white">{a.name}</p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium capitalize">
                            {a.role}
                          </span>
                        </div>

                        {/* Bound Badges */}
                        <div className="flex items-center space-x-1 mt-1 flex-wrap gap-0.5">
                          {boundConns.slice(0, 2).map((c) => (
                            <span key={c.id} className="text-[8px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1 py-0.2 rounded">
                              {c.name.replace('WhatsApp ', '')}
                            </span>
                          ))}
                          {boundQueues.slice(0, 2).map((q) => (
                            <span key={q.id} className="text-[8px] px-1 py-0.2 rounded text-white font-bold" style={{ backgroundColor: q.color }}>
                              {q.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg font-bold text-xs">
                        {a.activeTicketsCount} ativos
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 italic py-4 text-center">Nenhum atendente vinculado a este escopo.</p>
            )}
          </div>
        </div>

        {/* WhatsApp Connection Share */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-500" /> Volume por Linha / Conexão WhatsApp
            </h3>
            <p className="text-[11px] text-gray-400">Proporção de chamados recebidos em cada número</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {connectionChartData.some((c) => c.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={connectionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {connectionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-gray-400 space-y-1">
                <Smartphone className="w-8 h-8 mx-auto text-gray-500 opacity-50" />
                <p>Nenhum chamado registrado nas conexões ativas do seu escopo.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Tickets Table for Scope */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" /> Atendimentos no Seu Escopo
            </h3>
            <p className="text-xs text-gray-400">
              Listagem em tempo real dos chamados filtrados pelas suas permissões de Supervisor/Admin.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 w-36 sm:w-48"
              />
            </div>

            {/* Status Filter */}
            <select
              value={tableStatusFilter}
              onChange={(e) => setTableStatusFilter(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 font-medium focus:outline-none"
            >
              <option value="all">Status: Todos</option>
              <option value="pending">Aguardando Fila</option>
              <option value="in_progress">Em Andamento</option>
              <option value="resolved">Resolvidos</option>
            </select>

            {/* Queue Filter */}
            <select
              value={tableQueueFilter}
              onChange={(e) => setTableQueueFilter(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 font-medium focus:outline-none"
            >
              <option value="all">Filas: Todas</option>
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Fila / Setor</th>
                <th className="py-2.5 px-3">Linha WhatsApp</th>
                <th className="py-2.5 px-3">Atendente</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredTableTickets.length > 0 ? (
                filteredTableTickets.map((t) => {
                  const queue = getQueue(t.queueId);
                  const conn = getConnection(t.connectionId);
                  const attendant = getAttendant(t.assignedAttendantId);

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={t.contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.contact.name)}`}
                            alt={t.contact.name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{t.contact.name}</p>
                            <p className="text-[10px] text-gray-400">{t.contact.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {queue ? (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white inline-block truncate max-w-[120px]"
                            style={{ backgroundColor: queue.color }}
                          >
                            {queue.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Sem fila</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {conn ? (
                          <span className="px-2 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-medium border border-gray-200 dark:border-gray-700">
                            {conn.name.replace('WhatsApp ', '')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Geral</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {attendant ? (
                          <div className="flex items-center space-x-1.5">
                            <img src={attendant.avatar} alt={attendant.name} className="w-5 h-5 rounded-full object-cover" />
                            <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                              {attendant.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded font-bold">
                            Aguardando Fila
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            t.status === 'in_progress'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : t.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {t.status === 'in_progress'
                            ? 'Em Andamento'
                            : t.status === 'pending'
                            ? 'Pendente'
                            : 'Concluído'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {onSelectTicket && onNavigateToChats && (
                          <button
                            onClick={() => {
                              onSelectTicket(t.id);
                              onNavigateToChats();
                            }}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                            title="Abrir Chat"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Chat</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    Nenhum atendimento encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
