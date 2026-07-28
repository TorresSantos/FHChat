import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Play,
  Save,
  Smartphone,
  Layers,
  MessageSquare,
  Sparkles,
  Clock,
  ArrowRight,
  ArrowLeft,
  Move,
  CornerDownRight,
  CheckCircle2,
  Copy,
  RotateCcw,
  Sliders,
  X,
  Send,
  Zap,
  HelpCircle,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import {
  BotFlow,
  FlowNode,
  FlowNodeType,
  FlowNodeOption,
  Queue,
  WhatsAppConnection
} from '../../types';

interface VisualBotFlowBuilderProps {
  queues: Queue[];
  connections: WhatsAppConnection[];
  initialBotFlow?: BotFlow;
  onSaveBotFlow?: (flow: BotFlow) => void;
  onBackToList?: () => void;
}

const INITIAL_DEMO_NODES: FlowNode[] = [
  {
    id: 'node-start',
    type: 'start',
    title: 'Gatilho: Entrada do WhatsApp',
    position: { x: 50, y: 50 },
    content: 'Ativado quando um novo cliente envia mensagem para as conexões selecionadas.',
    connectionIds: ['conn-1', 'conn-2', 'conn-3'],
    nextNodeId: 'node-greeting'
  },
  {
    id: 'node-greeting',
    type: 'message',
    title: '1. Mensagem de Boas-Vindas',
    position: { x: 380, y: 50 },
    content: 'Olá! Seja bem-vindo à nossa Central de Atendimento. Como podemos te ajudar hoje?',
    nextNodeId: 'node-menu'
  },
  {
    id: 'node-menu',
    type: 'menu',
    title: '2. Menu Principal de Opções',
    position: { x: 710, y: 50 },
    content: 'Escolha uma das opções abaixo digitando o número correspondente:',
    options: [
      {
        id: 'opt-1',
        key: '1',
        label: 'Vendas & Novos Projetos',
        targetQueueId: 'queue-1'
      },
      {
        id: 'opt-2',
        key: '2',
        label: 'Suporte Técnico & Dúvidas',
        targetQueueId: 'queue-2'
      },
      {
        id: 'opt-3',
        key: '3',
        label: 'Financeiro & 2ª Via PIX',
        targetQueueId: 'queue-3'
      },
      {
        id: 'opt-4',
        key: '4',
        label: 'Atendimento Autônomo com IA',
        targetNodeId: 'node-ai'
      }
    ]
  },
  {
    id: 'node-ai',
    type: 'ai_gemini',
    title: '3. Assistente IA Gemini',
    position: { x: 1080, y: 220 },
    content: 'Assistente IA pronto para responder perguntas e direcionar cliente.',
    aiPrompt: 'Você é um assistente virtual atencioso de recepção. Responda brevemente e ofereça suporte.',
    nextNodeId: 'node-transfer-default'
  },
  {
    id: 'node-transfer-default',
    type: 'transfer_queue',
    title: '4. Encaminhar para Fila Geral',
    position: { x: 1420, y: 220 },
    targetQueueId: 'queue-4',
    content: 'Transferindo atendimento para a fila de Recepção Geral.'
  }
];

export const VisualBotFlowBuilder: React.FC<VisualBotFlowBuilderProps> = ({
  queues,
  connections,
  initialBotFlow,
  onSaveBotFlow,
  onBackToList
}) => {
  // Current Flow State
  const [nodes, setNodes] = useState<FlowNode[]>(initialBotFlow?.nodes?.length ? initialBotFlow.nodes : INITIAL_DEMO_NODES);
  const [flowName, setFlowName] = useState(initialBotFlow?.name || 'Bot Triagem Principal & Atribuição de Filas');
  const [flowDescription, setFlowDescription] = useState(initialBotFlow?.description || 'Fluxo automatizado com menu interativo e roteamento direto de clientes.');
  const [isActive, setIsActive] = useState(initialBotFlow ? initialBotFlow.isActive : true);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>(
    initialBotFlow?.connectionIds || connections.map((c) => c.id)
  );

  useEffect(() => {
    if (initialBotFlow) {
      setNodes(initialBotFlow.nodes && initialBotFlow.nodes.length ? initialBotFlow.nodes : INITIAL_DEMO_NODES);
      setFlowName(initialBotFlow.name);
      setFlowDescription(initialBotFlow.description || '');
      setIsActive(initialBotFlow.isActive);
      setSelectedConnectionIds(initialBotFlow.connectionIds || connections.map(c => c.id));
    }
  }, [initialBotFlow]);

  // Selected Node for Editing
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-menu');

  // Canvas Zoom State
  const [zoom, setZoom] = useState<number>(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(2.0, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.4, +(prev - 0.15).toFixed(2)));
  const handleResetZoom = () => setZoom(1);

  // Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const nodeStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Simulator Modal State
  const [showSimulator, setShowSimulator] = useState(false);
  const [simStepNodeId, setSimStepNodeId] = useState<string>('node-greeting');
  const [simInput, setSimInput] = useState('');
  const [simMessages, setSimMessages] = useState<
    { sender: 'bot' | 'user' | 'system'; text: string; queueBadge?: string }[]
  >([]);

  // Selected node object
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Drag Handlers
  const handleMouseDownNode = (e: React.MouseEvent, node: FlowNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    nodeStartPos.current = { ...node.position };
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;

    // Divide delta movement by zoom scale so dragging stays perfectly aligned with cursor
    const dx = (e.clientX - dragStartPos.current.x) / zoom;
    const dy = (e.clientY - dragStartPos.current.y) / zoom;

    setNodes((prev) =>
      prev.map((n) =>
        n.id === draggingNodeId
          ? {
              ...n,
              position: {
                x: Math.max(20, nodeStartPos.current.x + dx),
                y: Math.max(20, nodeStartPos.current.y + dy)
              }
            }
          : n
      )
    );
  };

  const handleMouseUpCanvas = () => {
    setDraggingNodeId(null);
  };

  // Node CRUD
  const handleAddNode = (type: FlowNodeType) => {
    const newId = `node-${Date.now()}`;
    let newTitle = 'Novo Bloco';
    let defaultContent = '';

    if (type === 'message') {
      newTitle = 'Mensagem de Texto';
      defaultContent = 'Digite aqui o texto que será enviado ao cliente...';
    } else if (type === 'menu') {
      newTitle = 'Menu de Opções';
      defaultContent = 'Escolha uma das opções abaixo:';
    } else if (type === 'transfer_queue') {
      newTitle = 'Transferir para Fila';
      defaultContent = 'Atendimento transferido para a fila selecionada.';
    } else if (type === 'ai_gemini') {
      newTitle = 'Assistente IA Gemini';
      defaultContent = 'Analisando mensagem com Inteligência Artificial...';
    } else if (type === 'condition_time') {
      newTitle = 'Horário Comercial';
      defaultContent = 'Verificando se a empresa está em horário de atendimento.';
    }

    const newNode: FlowNode = {
      id: newId,
      type,
      title: newTitle,
      position: {
        x: 350 + Math.floor(Math.random() * 80),
        y: 200 + Math.floor(Math.random() * 80)
      },
      content: defaultContent,
      targetQueueId: queues[0]?.id,
      options:
        type === 'menu'
          ? [
              { id: 'opt-1', key: '1', label: 'Opção 1', targetQueueId: queues[0]?.id },
              { id: 'opt-2', key: '2', label: 'Opção 2', targetQueueId: queues[1]?.id || queues[0]?.id }
            ]
          : undefined
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
  };

  const handleDeleteNode = (id: string) => {
    if (nodes.length <= 1) return;
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNodeId === id) {
      setSelectedNodeId(nodes.find((n) => n.id !== id)?.id || null);
    }
  };

  const handleUpdateSelectedNode = (field: keyof FlowNode, value: any) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, [field]: value } : n))
    );
  };

  const handleAddMenuOption = () => {
    if (!selectedNode || selectedNode.type !== 'menu') return;
    const currentOpts = selectedNode.options || [];
    const nextKey = (currentOpts.length + 1).toString();
    const newOpt: FlowNodeOption = {
      id: `opt-${Date.now()}`,
      key: nextKey,
      label: `Nova Opção ${nextKey}`,
      targetQueueId: queues[0]?.id
    };
    handleUpdateSelectedNode('options', [...currentOpts, newOpt]);
  };

  const handleUpdateOption = (optId: string, updates: Partial<FlowNodeOption>) => {
    if (!selectedNode || selectedNode.type !== 'menu') return;
    const updatedOpts = (selectedNode.options || []).map((o) =>
      o.id === optId ? { ...o, ...updates } : o
    );
    handleUpdateSelectedNode('options', updatedOpts);
  };

  const handleDeleteOption = (optId: string) => {
    if (!selectedNode || selectedNode.type !== 'menu') return;
    const updatedOpts = (selectedNode.options || []).filter((o) => o.id !== optId);
    handleUpdateSelectedNode('options', updatedOpts);
  };

  // Start Simulator
  const handleStartSimulator = () => {
    const startNode = nodes.find((n) => n.type === 'start') || nodes[0];
    const greetingNode = nodes.find((n) => n.id === startNode?.nextNodeId) || nodes[1] || startNode;

    let initText = greetingNode?.content || 'Olá! Como posso ajudar?';

    // If greeting connects to menu, attach menu options text
    const menuNode = nodes.find((n) => n.id === greetingNode?.nextNodeId && n.type === 'menu') || (greetingNode?.type === 'menu' ? greetingNode : null);
    if (menuNode && menuNode.options) {
      initText += '\n\n' + menuNode.options.map((o) => `${o.key}️⃣ ${o.label}`).join('\n');
    }

    setSimMessages([
      {
        sender: 'bot',
        text: initText
      }
    ]);
    setSimStepNodeId(menuNode ? menuNode.id : greetingNode?.id || '');
    setShowSimulator(true);
  };

  const handleSendSimMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim()) return;

    const userChoice = simInput.trim();
    setSimInput('');

    // Append user msg
    const newMsgs = [...simMessages, { sender: 'user' as const, text: userChoice }];

    const currentSimNode = nodes.find((n) => n.id === simStepNodeId);

    if (currentSimNode && currentSimNode.type === 'menu') {
      const matchedOpt = currentSimNode.options?.find(
        (o) => o.key === userChoice || o.label.toLowerCase().includes(userChoice.toLowerCase())
      );

      if (matchedOpt) {
        if (matchedOpt.targetQueueId) {
          const targetQ = queues.find((q) => q.id === matchedOpt.targetQueueId);
          newMsgs.push({
            sender: 'bot',
            text: `Perfeito! Você escolheu "${matchedOpt.label}". ${targetQ?.greetingMessage || 'Aguarde um momento enquanto te conectamos a um atendente.'}`,
            queueBadge: targetQ?.name
          });
          newMsgs.push({
            sender: 'system',
            text: ` Atendimento roteado com sucesso para a fila: ${targetQ?.name || 'Fila Selecionada'}`
          });
        } else if (matchedOpt.targetNodeId) {
          const nextNode = nodes.find((n) => n.id === matchedOpt.targetNodeId);
          if (nextNode) {
            setSimStepNodeId(nextNode.id);
            newMsgs.push({
              sender: 'bot',
              text: nextNode.content || `Avançando para: ${nextNode.title}`
            });
          }
        }
      } else {
        newMsgs.push({
          sender: 'bot',
          text: `Opção inválida. Por favor digite um dos números indicados no menu:\n\n` +
            (currentSimNode.options || []).map((o) => `${o.key}️⃣ ${o.label}`).join('\n')
        });
      }
    } else {
      newMsgs.push({
        sender: 'bot',
        text: 'Obrigado pela sua resposta! Nosso bot continuará o fluxo automaticamente.'
      });
    }

    setSimMessages(newMsgs);
  };

  // Helper function to get queue name
  const getQueue = (id?: string) => queues.find((q) => q.id === id);

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white select-none">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="p-2 text-gray-400 hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all shrink-0"
              title="Voltar para Lista de Bots"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6 text-emerald-500" />
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="font-extrabold text-lg text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:border-emerald-500 focus:outline-none px-1"
              />
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-700'
                }`}
              >
                {isActive ? 'Ativo' : 'Inativo'}
              </button>
            </div>
            <p className="text-xs text-gray-400 pl-1">
              Construa o fluxo visual de triagem automatizada, menu de escolhas e roteamento direto para filas de atendimento.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleStartSimulator}
            className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Testar no Simulador</span>
          </button>

          <button
            onClick={() => {
              const savedBot: BotFlow = {
                id: initialBotFlow?.id || `bot-${Date.now()}`,
                name: flowName,
                description: flowDescription,
                isActive,
                connectionIds: selectedConnectionIds,
                nodes,
                createdAt: initialBotFlow?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              if (onSaveBotFlow) {
                onSaveBotFlow(savedBot);
              }
              alert(`Bot "${flowName}" salvo com sucesso!`);
              if (onBackToList) {
                onBackToList();
              }
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Fluxo Bot</span>
          </button>
        </div>
      </div>

      {/* Main Container: Sidebar Palette + Canvas + Node Properties Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Palette (Add Blocks & Active Connections) */}
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 space-y-5 overflow-y-auto shrink-0 z-10">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-500" /> Adicionar Blocos de Fluxo
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => handleAddNode('message')}
                className="w-full text-left p-2.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-emerald-500/10 hover:border-emerald-500/50 border border-gray-200 dark:border-gray-700/80 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>Mensagem de Texto</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Envia saudação ou instrução escrita ao cliente.</p>
              </button>

              <button
                onClick={() => handleAddNode('menu')}
                className="w-full text-left p-2.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-blue-500/10 hover:border-blue-500/50 border border-gray-200 dark:border-gray-700/80 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>Menu de Opções (1, 2, 3...)</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Apresenta menu numerado e roteia respostas.</p>
              </button>

              <button
                onClick={() => handleAddNode('transfer_queue')}
                className="w-full text-left p-2.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-purple-500/10 hover:border-purple-500/50 border border-gray-200 dark:border-gray-700/80 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Transferir para Fila</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Direciona conversa para atendentes da Fila.</p>
              </button>

              <button
                onClick={() => handleAddNode('ai_gemini')}
                className="w-full text-left p-2.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-amber-500/10 hover:border-amber-500/50 border border-gray-200 dark:border-gray-700/80 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Atendimento com IA Gemini</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Gera respostas dinâmicas e tira dúvidas.</p>
              </button>

              <button
                onClick={() => handleAddNode('condition_time')}
                className="w-full text-left p-2.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-cyan-500/10 hover:border-cyan-500/50 border border-gray-200 dark:border-gray-700/80 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Verificar Horário Comercial</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Valida se está dentro do expediente de atendimento.</p>
              </button>
            </div>
          </div>

          {/* WhatsApp Connections Binding */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Linhas Vinculadas
              </span>
              <span className="text-[10px] text-emerald-500">{selectedConnectionIds.length}</span>
            </h4>
            <p className="text-[10px] text-gray-400">Marque os números de WhatsApp que usarão este bot:</p>

            <div className="space-y-1.5">
              {connections.map((c) => {
                const isChecked = selectedConnectionIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedConnectionIds((prev) =>
                            prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                          );
                        }}
                        className="rounded text-emerald-600 focus:ring-0"
                      />
                      <span className="truncate">{c.name.replace('WhatsApp ', '')}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Infinite Drag-and-Drop Canvas */}
        <div
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
          className="flex-1 bg-gray-100 dark:bg-gray-950 relative overflow-auto cursor-crosshair select-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(156, 163, 175, 0.25) 1px, transparent 1px)',
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`
          }}
        >
          {/* Floating Canvas Zoom Controls Overlay */}
          <div className="sticky top-4 left-4 z-20 float-right mr-4 mt-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl p-1.5 shadow-2xl flex items-center space-x-1.5 text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.4}
              className="p-1.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
              title="Diminuir Zoom (-15%)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2.5 py-1 rounded-xl font-bold font-mono text-[11px] text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700/60"
              title="Redefinir Zoom para 100%"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 2.0}
              className="p-1.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
              title="Aumentar Zoom (+15%)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1" />

            <button
              type="button"
              onClick={() => setZoom(0.7)}
              className="px-2 py-1 rounded-xl text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-all flex items-center gap-1 border border-emerald-500/20"
              title="Ajustar Visão Geral do Fluxo"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ajustar Tela</span>
            </button>
          </div>

          {/* Scalable Canvas Content Container */}
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: `${2400}px`,
              height: `${1600}px`
            }}
            className="relative"
          >
            {/* Canvas SVG Connecting Lines */}
            <svg className="absolute inset-0 w-[2400px] h-[1600px] pointer-events-none z-0">
            {nodes.map((node) => {
              if (node.nextNodeId) {
                const targetNode = nodes.find((n) => n.id === node.nextNodeId);
                if (targetNode) {
                  const x1 = node.position.x + 240;
                  const y1 = node.position.y + 60;
                  const x2 = targetNode.position.x;
                  const y2 = targetNode.position.y + 60;

                  return (
                    <g key={`line-${node.id}-${targetNode.id}`}>
                      <path
                        d={`M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                        className="animate-pulse opacity-80"
                      />
                      <circle cx={x2} cy={y2} r="5" fill="#10B981" />
                    </g>
                  );
                }
              }

              // Menu Options connections
              if (node.type === 'menu' && node.options) {
                return node.options.map((opt, idx) => {
                  if (opt.targetNodeId) {
                    const targetNode = nodes.find((n) => n.id === opt.targetNodeId);
                    if (targetNode) {
                      const x1 = node.position.x + 240;
                      const y1 = node.position.y + 90 + idx * 30;
                      const x2 = targetNode.position.x;
                      const y2 = targetNode.position.y + 60;

                      return (
                        <g key={`opt-line-${opt.id}-${targetNode.id}`}>
                          <path
                            d={`M ${x1} ${y1} C ${x1 + 80} ${y1}, ${x2 - 80} ${y2}, ${x2} ${y2}`}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="2.5"
                          />
                          <circle cx={x2} cy={y2} r="4" fill="#3B82F6" />
                        </g>
                      );
                    }
                  }
                  return null;
                });
              }

              return null;
            })}
          </svg>

          {/* Node Cards on Canvas */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDownNode(e, node)}
                style={{
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`
                }}
                className={`absolute w-64 bg-white dark:bg-gray-900 rounded-2xl border shadow-lg transition-shadow z-10 cursor-grab active:cursor-grabbing ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 dark:ring-emerald-500/40 shadow-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-400'
                }`}
              >
                {/* Card Header */}
                <div
                  className={`px-3.5 py-2.5 rounded-t-2xl flex items-center justify-between border-b ${
                    node.type === 'start'
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                      : node.type === 'menu'
                      ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300'
                      : node.type === 'transfer_queue'
                      ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-900 text-purple-800 dark:text-purple-300'
                      : node.type === 'ai_gemini'
                      ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Move className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    <span className="font-bold text-xs truncate">{node.title}</span>
                  </div>

                  {node.type !== 'start' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className="p-1 text-gray-400 hover:text-rose-500 rounded"
                      title="Excluir Bloco"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Card Content Summary */}
                <div className="p-3 space-y-2 text-xs">
                  {node.content && (
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed text-[11px]">
                      {node.content}
                    </p>
                  )}

                  {/* Start Node Connection Pills */}
                  {node.type === 'start' && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {connections.map((c) => (
                        <span
                          key={c.id}
                          className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold"
                        >
                          {c.name.replace('WhatsApp ', '')}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Menu Options Summary */}
                  {node.type === 'menu' && node.options && (
                    <div className="space-y-1 pt-1">
                      {node.options.map((opt) => {
                        const boundQueue = getQueue(opt.targetQueueId);
                        return (
                          <div
                            key={opt.id}
                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-[10px]"
                          >
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {opt.key}️⃣ {opt.label}
                            </span>
                            {boundQueue && (
                              <span
                                className="px-1.5 py-0.2 rounded font-bold text-white text-[9px]"
                                style={{ backgroundColor: boundQueue.color }}
                              >
                                {boundQueue.name}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Queue Transfer Target Badge */}
                  {node.type === 'transfer_queue' && (
                    <div className="pt-1">
                      {getQueue(node.targetQueueId) ? (
                        <span
                          className="px-2 py-1 rounded-md text-[10px] font-bold text-white block text-center shadow-xs"
                          style={{ backgroundColor: getQueue(node.targetQueueId)?.color }}
                        >
                          {getQueue(node.targetQueueId)?.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Selecione uma Fila</span>
                      )}
                    </div>
                  )}

                  {/* AI Gemini Prompt Tag */}
                  {node.type === 'ai_gemini' && (
                    <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-1.5 rounded-lg text-[10px] font-mono border border-amber-500/20 truncate">
                      Prompt: {node.aiPrompt || 'Assistente de Suporte'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Right Side Node Inspector & Property Editor */}
        <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-4 space-y-4 overflow-y-auto shrink-0 z-10">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-500" /> Propriedades do Bloco
            </h4>
            {selectedNode && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded uppercase">
                {selectedNode.type}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Título do Bloco</label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => handleUpdateSelectedNode('title', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 mt-1 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Conteúdo / Mensagem</label>
                <textarea
                  rows={4}
                  value={selectedNode.content || ''}
                  onChange={(e) => handleUpdateSelectedNode('content', e.target.value)}
                  placeholder="Texto que o cliente visualizará..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 mt-1 text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Menu Options Editor */}
              {selectedNode.type === 'menu' && (
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-200 uppercase text-[10px]">
                      Opções de Seleção ({selectedNode.options?.length || 0})
                    </span>
                    <button
                      onClick={handleAddMenuOption}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Opção
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(selectedNode.options || []).map((opt) => (
                      <div
                        key={opt.id}
                        className="p-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={opt.key}
                            onChange={(e) => handleUpdateOption(opt.id, { key: e.target.value })}
                            className="w-8 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-1 text-xs font-bold text-blue-500"
                          />
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => handleUpdateOption(opt.id, { label: e.target.value })}
                            placeholder="Rótulo da opção..."
                            className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-1 text-xs font-semibold"
                          />
                          <button
                            onClick={() => handleDeleteOption(opt.id)}
                            className="text-gray-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Assign Queue directly to option */}
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">
                            Roteamento para Fila:
                          </label>
                          <select
                            value={opt.targetQueueId || ''}
                            onChange={(e) => handleUpdateOption(opt.id, { targetQueueId: e.target.value })}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-1 text-xs font-medium"
                          >
                            <option value="">Nenhuma (Avançar para Próximo Bloco)</option>
                            {queues.map((q) => (
                              <option key={q.id} value={q.id}>
                                Fila: {q.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Queue Transfer Selector */}
              {selectedNode.type === 'transfer_queue' && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                  <label className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                    Fila Destino de Atendimento *
                  </label>
                  <select
                    value={selectedNode.targetQueueId || ''}
                    onChange={(e) => handleUpdateSelectedNode('targetQueueId', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 text-xs font-semibold"
                  >
                    {queues.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* AI Gemini Prompt Editor */}
              {selectedNode.type === 'ai_gemini' && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                  <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                    Instrução / Prompt para IA Gemini
                  </label>
                  <textarea
                    rows={3}
                    value={selectedNode.aiPrompt || ''}
                    onChange={(e) => handleUpdateSelectedNode('aiPrompt', e.target.value)}
                    placeholder="E.g., Responda dúvidas técnicas com base nas regras..."
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 text-xs"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-400 space-y-2">
              <Bot className="w-8 h-8 mx-auto text-gray-400 opacity-40" />
              <p>Clique em qualquer bloco do fluxo para editar suas propriedades e opções.</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Bot Simulator Modal */}
      {showSimulator && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 flex flex-col h-[600px]">
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    Simulador Interativo do Bot
                  </h3>
                  <p className="text-[10px] text-gray-400">Teste em tempo real como o cliente interagirá com este fluxo.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulator(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Chat Feed */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-950 rounded-xl p-3 border border-gray-200 dark:border-gray-800 overflow-y-auto space-y-3 text-xs">
              {simMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user'
                      ? 'items-end'
                      : msg.sender === 'system'
                      ? 'items-center'
                      : 'items-start'
                  }`}
                >
                  {msg.sender === 'system' ? (
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                      {msg.text}
                    </span>
                  ) : (
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.queueBadge && (
                        <div className="mt-2 pt-1 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <span className="text-[9px] text-gray-400">Fila atrelada:</span>
                          <span className="text-[9px] bg-blue-500 text-white font-bold px-2 py-0.5 rounded">
                            {msg.queueBadge}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendSimMessage} className="flex gap-2 shrink-0">
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder="Digite o número da opção ou mensagem..."
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
