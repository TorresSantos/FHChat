import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Users,
  Bot,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  CornerDownRight,
  ShieldCheck,
  Smartphone,
  Hash,
  HelpCircle,
  Check,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { Queue, Attendant, WhatsAppConnection, BotFlow } from '../../types';
import { VisualBotFlowBuilder } from '../bot/VisualBotFlowBuilder';

interface QueuesManagementProps {
  queues: Queue[];
  attendants: Attendant[];
  connections: WhatsAppConnection[];
  onAddQueue: (queue: Omit<Queue, 'id'>) => void;
  onUpdateQueue: (queue: Queue) => void;
  onDeleteQueue: (id: string) => void;
}

const DEMO_BOTS: BotFlow[] = [
  {
    id: 'bot-1',
    name: 'Bot Triagem Principal & Atribuição de Filas',
    description: 'Fluxo automatizado com menu interativo (1-Vendas, 2-Suporte, 3-Financeiro) e atalho para IA Gemini.',
    isActive: true,
    connectionIds: ['conn-1', 'conn-2', 'conn-3'],
    nodes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bot-2',
    name: 'Bot Fora do Expediente (Horário Noturno)',
    description: 'Atende mensagens enviadas fora do horário comercial com respostas automáticas e agendamento.',
    isActive: false,
    connectionIds: ['conn-1'],
    nodes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const QueuesManagement: React.FC<QueuesManagementProps> = ({
  queues,
  attendants,
  connections,
  onAddQueue,
  onUpdateQueue,
  onDeleteQueue
}) => {
  const [viewMode, setViewMode] = useState<'queues' | 'bots' | 'flow_builder'>('bots');
  const [bots, setBots] = useState<BotFlow[]>(DEMO_BOTS);
  const [selectedBot, setSelectedBot] = useState<BotFlow | null>(DEMO_BOTS[0]);

  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bot Handlers
  const handleCreateNewBot = () => {
    const newBot: BotFlow = {
      id: `bot-${Date.now()}`,
      name: `Novo Bot Automatizado ${bots.length + 1}`,
      description: 'Defina o fluxo de mensagens e opções para automatizar seu atendimento.',
      isActive: true,
      connectionIds: connections.map((c) => c.id),
      nodes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSelectedBot(newBot);
    setViewMode('flow_builder');
  };

  const handleEditBot = (bot: BotFlow) => {
    setSelectedBot(bot);
    setViewMode('flow_builder');
  };

  const handleSaveBotFlow = (savedFlow: BotFlow) => {
    setBots((prev) => {
      const idx = prev.findIndex((b) => b.id === savedFlow.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedFlow;
        return copy;
      }
      return [savedFlow, ...prev];
    });
    setSelectedBot(savedFlow);
  };

  const handleToggleBotActive = (botId: string) => {
    setBots((prev) =>
      prev.map((b) => (b.id === botId ? { ...b, isActive: !b.isActive } : b))
    );
  };

  const handleDeleteBot = (botId: string) => {
    if (confirm('Tem certeza que deseja excluir este bot de atendimento?')) {
      setBots((prev) => prev.filter((b) => b.id !== botId));
    }
  };


  // Simulator State
  const [simMessage, setSimMessage] = useState('');
  const [simChatLog, setSimChatLog] = useState<
    { sender: 'bot' | 'user'; text: string; queueName?: string }[]
  >([
    {
      sender: 'bot',
      text: 'Olá! Seja bem-vindo à nossa Central Digital. Digite o número da opção desejada:\n\n' +
        queues.map((q) => `${q.optionNumber}️⃣ ${q.name}`).join('\n')
    }
  ]);

  // Modal Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#10B981',
    optionNumber: 1,
    greetingMessage: '',
    attendantIds: [] as string[],
    isDefault: false,
    isActive: true
  });

  const availableColors = [
    '#10B981', // emerald
    '#3B82F6', // blue
    '#F59E0B', // amber
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#EF4444', // red
    '#06B6D4', // cyan
    '#6366F1'  // indigo
  ];

  const handleOpenAddModal = () => {
    setSelectedQueue(null);
    const nextOptionNumber = Math.max(...queues.map((q) => q.optionNumber), 0) + 1;
    setFormData({
      name: '',
      description: '',
      color: availableColors[(queues.length) % availableColors.length],
      optionNumber: nextOptionNumber,
      greetingMessage: 'Você foi direcionado para esta fila de atendimento! Em instantes responderemos.',
      attendantIds: attendants.map((a) => a.id),
      isDefault: queues.length === 0,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (queue: Queue) => {
    setSelectedQueue(queue);
    setFormData({
      name: queue.name,
      description: queue.description,
      color: queue.color,
      optionNumber: queue.optionNumber,
      greetingMessage: queue.greetingMessage,
      attendantIds: [...queue.attendantIds],
      isDefault: !!queue.isDefault,
      isActive: queue.isActive
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (selectedQueue) {
      onUpdateQueue({
        ...selectedQueue,
        name: formData.name,
        description: formData.description,
        color: formData.color,
        optionNumber: formData.optionNumber,
        greetingMessage: formData.greetingMessage,
        attendantIds: formData.attendantIds,
        isDefault: formData.isDefault,
        isActive: formData.isActive
      });
    } else {
      onAddQueue({
        name: formData.name,
        description: formData.description,
        color: formData.color,
        optionNumber: formData.optionNumber,
        greetingMessage: formData.greetingMessage,
        attendantIds: formData.attendantIds,
        isDefault: formData.isDefault,
        isActive: formData.isActive
      });
    }
    setIsModalOpen(false);
  };

  const handleToggleAttendant = (attendantId: string) => {
    setFormData((prev) => {
      const exists = prev.attendantIds.includes(attendantId);
      if (exists) {
        return { ...prev, attendantIds: prev.attendantIds.filter((id) => id !== attendantId) };
      } else {
        return { ...prev, attendantIds: [...prev.attendantIds, attendantId] };
      }
    });
  };

  // Bot Simulator Handler
  const handleSimSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;

    const userText = simMessage.trim();
    setSimMessage('');

    // Append user message
    const updated = [...simChatLog, { sender: 'user' as const, text: userText }];

    // Check if input matches any queue option number
    const matchedNumber = parseInt(userText);
    const matchedQueue = queues.find(
      (q) => q.optionNumber === matchedNumber || q.name.toLowerCase().includes(userText.toLowerCase())
    );

    if (matchedQueue) {
      updated.push({
        sender: 'bot',
        text: `✅ Roteado com sucesso para Fila: *${matchedQueue.name}*\n\n${matchedQueue.greetingMessage}`,
        queueName: matchedQueue.name
      });
    } else {
      updated.push({
        sender: 'bot',
        text: '⚠️ Opção não reconhecida. Por favor digite o número correspondente:\n\n' +
          queues.map((q) => `${q.optionNumber}️⃣ ${q.name}`).join('\n')
      });
    }

    setSimChatLog(updated);
  };

  return (
    <div className="flex-1 overflow-hidden bg-gray-950 text-gray-100 flex flex-col h-full">
      {/* View Mode Sub-Header Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('bots')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'bots'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-300" />
            <span>Meus Bots & Automações ({bots.length})</span>
          </button>

          <button
            onClick={() => setViewMode('queues')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'queues'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-300" />
            <span>Gestão de Filas ({queues.length})</span>
          </button>

          {viewMode === 'flow_builder' && (
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Editor de Fluxo Visual ({selectedBot?.name || 'Novo Bot'})</span>
            </span>
          )}
        </div>

        <div>
          {viewMode === 'queues' && (
            <button
              onClick={handleOpenAddModal}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-blue-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Nova Fila</span>
            </button>
          )}

          {viewMode === 'bots' && (
            <button
              onClick={handleCreateNewBot}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Bot</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'flow_builder' ? (
        <div className="flex-1 overflow-hidden">
          <VisualBotFlowBuilder
            queues={queues}
            connections={connections}
            initialBotFlow={selectedBot || undefined}
            onSaveBotFlow={handleSaveBotFlow}
            onBackToList={() => setViewMode('bots')}
          />
        </div>
      ) : viewMode === 'bots' ? (
        /* BOTS LIST VIEW */
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    Bots de Atendimento & Triagem
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                      Fluxo Visual Arrasta & Solta
                    </span>
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Crie e edite bots automatizados que recebem clientes no WhatsApp e os encaminham para as filas corretas.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCreateNewBot}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center space-x-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Bot</span>
              </button>
            </div>

            {/* Bots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {bots.map((bot) => {
                const boundConnections = connections.filter((c) =>
                  bot.connectionIds?.includes(c.id)
                );

                return (
                  <div
                    key={bot.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all space-y-4 shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
                            <Bot className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-white">{bot.name}</h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                bot.isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                              }`}
                            >
                              {bot.isActive ? 'Bot Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleBotActive(bot.id)}
                            className="text-xs px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 font-medium transition-all"
                            title="Alternar Status"
                          >
                            {bot.isActive ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => handleDeleteBot(bot.id)}
                            className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Excluir Bot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed">
                        {bot.description}
                      </p>

                      {/* Bound WhatsApp Lines */}
                      <div className="pt-2 border-t border-gray-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          WhatsApp Vinculados:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {boundConnections.length > 0 ? (
                            boundConnections.map((c) => (
                              <span
                                key={c.id}
                                className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 rounded-md text-[10px] font-semibold flex items-center gap-1"
                              >
                                <Smartphone className="w-3 h-3 text-emerald-400" />
                                <span>{c.name.replace('WhatsApp ', '')}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-500 italic">
                              Todas as conexões ativas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* EDIT BOT BUTTON THAT LEADS TO DRAG AND DROP BUILDER */}
                    <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">
                        Editor Visual de Arrasta & Solta
                      </span>

                      <button
                        onClick={() => handleEditBot(bot)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-900/30 flex items-center space-x-2 cursor-pointer"
                      >
                        <Sliders className="w-4 h-4" />
                        <span>Editar Bot (Arrasta & Solta)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    Filas de Atendimento & Setores
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">
                      Roteamento Inteligente
                    </span>
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Crie setores e filas (Vendas, Suporte, Financeiro) vinculados ao bot e aos atendentes.
                  </p>
                </div>
              </div>
            </div>


        {/* Main Grid: Left = Queues Cards / Right = Interactive Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queues List Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span>Filas Cadastradas ({queues.length})</span>
            </h2>

            <div className="space-y-4">
              {queues.map((q) => {
                const assignedAtts = attendants.filter((a) => q.attendantIds.includes(a.id));
                const linkedConns = connections.filter((c) => c.queueIds.includes(q.id));

                return (
                  <div
                    key={q.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md"
                          style={{ backgroundColor: q.color }}
                        >
                          #{q.optionNumber}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-white text-base">{q.name}</h3>
                            {q.isDefault && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
                                Fila Padrão
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{q.description || 'Sem descrição'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                          title="Editar Fila"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir a fila "${q.name}"?`)) {
                              onDeleteQueue(q.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                          title="Excluir Fila"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Greeting Message Preview */}
                    <div className="bg-gray-950 rounded-xl p-3 border border-gray-800 text-xs space-y-2">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                          Mensagem de Boas-Vindas ao Entrar na Fila:
                        </span>
                        <p className="text-gray-300 italic mt-0.5 font-sans">
                          "{q.greetingMessage}"
                        </p>
                      </div>

                      {/* Attendants & Connections badges */}
                      <div className="pt-2 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center space-x-2">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-gray-400">Atendentes ({assignedAtts.length}):</span>
                          <div className="flex -space-x-1.5">
                            {assignedAtts.map((att) => (
                              <img
                                key={att.id}
                                src={att.avatar}
                                alt={att.name}
                                title={att.name}
                                className="w-5 h-5 rounded-full border border-gray-800 object-cover"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 text-gray-400">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Em {linkedConns.length} conexão(ões) WhatsApp</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bot Simulator Column (1 col) */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Simulador do Bot de Filas</span>
            </h2>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
              {/* Phone Mockup Header */}
              <div className="bg-emerald-900/40 border border-emerald-500/20 p-3 rounded-xl flex items-center space-x-2 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-emerald-300">WhatsApp Auto-Bot Teste</p>
                  <p className="text-[10px] text-emerald-400/80">Digite números (ex: 1, 2) para testar o roteamento</p>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 my-2 text-xs font-sans">
                {simChatLog.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 shadow-md whitespace-pre-wrap ${
                        m.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700/60'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSimSend} className="flex items-center space-x-2 shrink-0 pt-2 border-t border-gray-800">
                <input
                  type="text"
                  placeholder="Digite 1, 2, 3..."
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Queue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 text-gray-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedQueue ? 'Editar Fila de Atendimento' : 'Criar Nova Fila'}
                  </h3>
                  <p className="text-xs text-gray-400">Configure o setor, opção no bot e mensagem de entrada.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Nome da Fila / Setor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1 - Vendas & Comercial"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Nº da Opção *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.optionNumber}
                    onChange={(e) => setFormData({ ...formData, optionNumber: parseInt(e.target.value) || 1 })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Descrição Interna
                </label>
                <input
                  type="text"
                  placeholder="Ex: Atendimento focado em propostas comerciais"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Cor de Destaque
                </label>
                <div className="flex items-center space-x-2">
                  {availableColors.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        formData.color === c ? 'scale-110 border-white' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Mensagem Automática de Boas-Vindas
                </label>
                <textarea
                  rows={3}
                  placeholder="Mensagem enviada assim que o cliente escolhe esta fila..."
                  value={formData.greetingMessage}
                  onChange={(e) => setFormData({ ...formData, greetingMessage: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Atendentes Alocados nesta Fila
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {attendants.map((att) => {
                    const isSelected = formData.attendantIds.includes(att.id);
                    return (
                      <button
                        type="button"
                        key={att.id}
                        onClick={() => handleToggleAttendant(att.id)}
                        className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                            : 'bg-gray-950 border-gray-800 text-gray-400'
                        }`}
                      >
                        <img src={att.avatar} alt={att.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate">{att.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/30"
                >
                  {selectedQueue ? 'Salvar Alterações' : 'Criar Fila'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};



