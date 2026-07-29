import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Bot,
  GitBranch,
  Plus,
  Trash2,
  Play,
  Sparkles,
  MessageSquare,
  Layers,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  Save,
  Download,
  Upload,
  X,
  Edit3,
  Sliders,
  Send,
  RefreshCw,
  Move,
  Minimize2,
  Maximize2,
  HelpCircle
} from 'lucide-react';

// --- CUSTOM NODES FOR DRAG & DROP CANVAS ---

// 1. Start Node
const StartNodeComponent = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-3 rounded-2xl bg-gray-900 border-2 shadow-xl min-w-[220px] transition-all ${
      selected ? 'border-emerald-500 shadow-emerald-950/50 scale-105' : 'border-emerald-500/40'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
          🏁
        </div>
        <span className="font-bold text-xs text-emerald-400 uppercase tracking-wider">Início do Fluxo</span>
      </div>
      <p className="text-[11px] text-gray-300 font-medium">{data.title || 'Boas-Vindas WhatsApp'}</p>
      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{data.content || 'Gatilho inicial para mensagens'}</p>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3.5 h-3.5 bg-emerald-500 border-2 border-gray-950 !bottom-[-7px]"
      />
    </div>
  );
};

// 2. Message Node
const MessageNodeComponent = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-3 rounded-2xl bg-gray-900 border-2 shadow-xl min-w-[240px] max-w-[280px] transition-all ${
      selected ? 'border-blue-500 shadow-blue-950/50 scale-105' : 'border-blue-500/40'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3.5 h-3.5 bg-blue-500 border-2 border-gray-950 !top-[-7px]"
      />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
          💬
        </div>
        <span className="font-bold text-xs text-blue-400 uppercase tracking-wider">Mensagem Texto</span>
      </div>
      <p className="text-[11px] text-gray-200 font-semibold">{data.title}</p>
      <div className="bg-gray-950 p-2 rounded-xl border border-gray-800 text-[10px] text-gray-300 font-mono mt-1.5 whitespace-pre-wrap line-clamp-3">
        {data.content}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3.5 h-3.5 bg-blue-500 border-2 border-gray-950 !bottom-[-7px]"
      />
    </div>
  );
};

// 3. Menu Node (Triagem Numérica)
const MenuNodeComponent = ({ data, selected }: any) => {
  const options = data.options || [
    { key: '1', label: 'Vendas' },
    { key: '2', label: 'Suporte' },
    { key: '3', label: 'Financeiro' },
    { key: '4', label: 'Atendente' }
  ];

  return (
    <div className={`px-4 py-3 rounded-2xl bg-gray-900 border-2 shadow-xl min-w-[260px] max-w-[300px] transition-all ${
      selected ? 'border-purple-500 shadow-purple-950/50 scale-105' : 'border-purple-500/40'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3.5 h-3.5 bg-purple-500 border-2 border-gray-950 !top-[-7px]"
      />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
          🔀
        </div>
        <span className="font-bold text-xs text-purple-400 uppercase tracking-wider">Menu Interativo</span>
      </div>
      <p className="text-[11px] text-gray-200 font-semibold mb-2">{data.title}</p>
      
      {/* Options list with outputs */}
      <div className="space-y-1.5 mt-2">
        {options.map((opt: any, index: number) => (
          <div key={index} className="relative flex items-center justify-between bg-gray-950 px-2.5 py-1.5 rounded-xl border border-gray-800 text-[10px]">
            <span className="font-bold font-mono text-purple-400 mr-2">{opt.key}️⃣</span>
            <span className="text-gray-300 truncate font-medium flex-1">{opt.label}</span>
            <Handle
              type="source"
              id={`opt-${opt.key}`}
              position={Position.Right}
              className="w-3 h-3 bg-purple-500 border-2 border-gray-950 !right-[-12px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Transfer Queue Node
const TransferNodeComponent = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-3 rounded-2xl bg-gray-900 border-2 shadow-xl min-w-[240px] transition-all ${
      selected ? 'border-amber-500 shadow-amber-950/50 scale-105' : 'border-amber-500/40'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3.5 h-3.5 bg-amber-500 border-2 border-gray-950 !top-[-7px]"
      />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
          🏢
        </div>
        <span className="font-bold text-xs text-amber-400 uppercase tracking-wider">Transferir Fila</span>
      </div>
      <p className="text-[11px] text-gray-200 font-semibold">{data.title}</p>
      <div className="mt-1.5 bg-amber-950/30 border border-amber-800/40 px-2 py-1 rounded-lg text-[10px] text-amber-300 font-medium">
        Fila: {data.targetQueueName || 'Atendimento Humano'}
      </div>
    </div>
  );
};

// 5. AI Gemini Node
const AINodeComponent = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-3 rounded-2xl bg-gray-900 border-2 shadow-xl min-w-[250px] transition-all ${
      selected ? 'border-pink-500 shadow-pink-950/50 scale-105' : 'border-pink-500/40'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3.5 h-3.5 bg-pink-500 border-2 border-gray-950 !top-[-7px]"
      />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
          ✨
        </div>
        <span className="font-bold text-xs text-pink-400 uppercase tracking-wider">IA Gemini Auto-Reply</span>
      </div>
      <p className="text-[11px] text-gray-200 font-semibold">{data.title || 'Agente Inteligente'}</p>
      <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{data.aiPrompt || 'Responde dúvidas frequentes'}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3.5 h-3.5 bg-pink-500 border-2 border-gray-950 !bottom-[-7px]"
      />
    </div>
  );
};

// 6. Delay Node
const DelayNodeComponent = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-3 rounded-2xl bg-gray-900 border-2 shadow-xl min-w-[200px] transition-all ${
      selected ? 'border-cyan-500 shadow-cyan-950/50 scale-105' : 'border-cyan-500/40'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3.5 h-3.5 bg-cyan-500 border-2 border-gray-950 !top-[-7px]"
      />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
          ⏱️
        </div>
        <span className="font-bold text-xs text-cyan-400 uppercase tracking-wider">Atraso Simulado</span>
      </div>
      <p className="text-[11px] text-gray-200 font-medium">Aguardar {data.delaySeconds || 3} segundos</p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3.5 h-3.5 bg-cyan-500 border-2 border-gray-950 !bottom-[-7px]"
      />
    </div>
  );
};

const nodeTypes = {
  startNode: StartNodeComponent,
  messageNode: MessageNodeComponent,
  menuNode: MenuNodeComponent,
  transferNode: TransferNodeComponent,
  aiNode: AINodeComponent,
  delayNode: DelayNodeComponent
};

// INITIAL FLOW SETUP
const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'startNode',
    position: { x: 250, y: 30 },
    data: {
      title: 'Boas-Vindas Principal',
      content: 'Gatilho ao receber mensagem inicial do cliente no WhatsApp'
    }
  },
  {
    id: 'menu-1',
    type: 'menuNode',
    position: { x: 220, y: 160 },
    data: {
      title: 'Menu de Opções de Triagem',
      content: '🤖 *FHChat - Central de Atendimento*\nPor favor escolha uma opção:',
      options: [
        { key: '1', label: 'Vendas & Novos Clientes' },
        { key: '2', label: 'Suporte Técnico' },
        { key: '3', label: 'Financeiro & PIX' },
        { key: '4', label: 'Falar com Atendente' }
      ]
    }
  },
  {
    id: 'transfer-1',
    type: 'transferNode',
    position: { x: 50, y: 400 },
    data: {
      title: 'Transferir Vendas',
      targetQueueName: 'Vendas & Novos Clientes'
    }
  },
  {
    id: 'transfer-2',
    type: 'transferNode',
    position: { x: 250, y: 400 },
    data: {
      title: 'Transferir Suporte',
      targetQueueName: 'Suporte Técnico'
    }
  },
  {
    id: 'transfer-3',
    type: 'transferNode',
    position: { x: 450, y: 400 },
    data: {
      title: 'Transferir Financeiro',
      targetQueueName: 'Financeiro & PIX'
    }
  },
  {
    id: 'transfer-4',
    type: 'transferNode',
    position: { x: 650, y: 400 },
    data: {
      title: 'Transferir Recepção',
      targetQueueName: 'Recepção / Geral'
    }
  }
];

const initialEdges: Edge[] = [
  {
    id: 'e-start-menu',
    source: 'start-1',
    target: 'menu-1',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 }
  },
  {
    id: 'e-opt-1',
    source: 'menu-1',
    sourceHandle: 'opt-1',
    target: 'transfer-1',
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2 }
  },
  {
    id: 'e-opt-2',
    source: 'menu-1',
    sourceHandle: 'opt-2',
    target: 'transfer-2',
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2 }
  },
  {
    id: 'e-opt-3',
    source: 'menu-1',
    sourceHandle: 'opt-3',
    target: 'transfer-3',
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2 }
  },
  {
    id: 'e-opt-4',
    source: 'menu-1',
    sourceHandle: 'opt-4',
    target: 'transfer-4',
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2 }
  }
];

// Inner Canvas Component
const FlowCanvasInner: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('menu-1');
  const [activeTab, setActiveTab] = useState<'editor' | 'simulator'>('editor');
  const [isBotActive, setIsBotActive] = useState(true);

  // Simulator State
  const [simMessages, setSimMessages] = useState<{ sender: 'bot' | 'user'; text: string; time: string }[]>([
    {
      sender: 'bot',
      text: '🤖 *FHChat - Central de Atendimento*\n\nOlá! Seja bem-vindo ao atendimento automatizado.\nPor favor escolha uma opção digitando o número:\n\n1️⃣ Vendas & Novos Clientes\n2️⃣ Suporte Técnico & Dúvidas\n3️⃣ Financeiro & Segunda Via PIX\n4️⃣ Falar com Atendente Humano',
      time: '12:00'
    }
  ]);
  const [simInput, setSimInput] = useState('');

  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#a855f7', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' }
          },
          eds
        )
      ),
    [setEdges]
  );

  // Handle Drag over canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle Drop new node on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow-type');
      const title = event.dataTransfer.getData('application/reactflow-title');

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const newNodeId = `node-${Date.now()}`;
      let newNodeData: any = { title, content: 'Digite o conteúdo...' };

      if (type === 'menuNode') {
        newNodeData = {
          title: title || 'Novo Menu de Opções',
          content: 'Escolha uma opção:',
          options: [
            { key: '1', label: 'Opção 1' },
            { key: '2', label: 'Opção 2' }
          ]
        };
      } else if (type === 'transferNode') {
        newNodeData = {
          title: title || 'Transferir Fila',
          targetQueueName: 'Suporte Técnico'
        };
      } else if (type === 'aiNode') {
        newNodeData = {
          title: title || 'Atendente IA Gemini',
          aiPrompt: 'Responda cordialmente com base no catálogo de serviços'
        };
      } else if (type === 'delayNode') {
        newNodeData = {
          title: 'Tempo de Espera',
          delaySeconds: 3
        };
      }

      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: newNodeData
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNodeId(newNodeId);
    },
    [screenToFlowPosition, setNodes]
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  const updateSelectedNodeData = (updatedFields: Record<string, any>) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              ...updatedFields
            }
          };
        }
        return n;
      })
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  // Drag start handler for sidebar palette
  const onDragStart = (event: React.DragEvent, nodeType: string, title: string) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.setData('application/reactflow-title', title);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Simulator interactions
  const handleSimSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim()) return;

    const userTxt = simInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSimMessages((prev) => [...prev, { sender: 'user', text: userTxt, time: now }]);
    setSimInput('');

    setTimeout(() => {
      let botResponse = '';
      if (userTxt === '1') {
        botResponse = '✅ *Opção 1 Escolhida*\nSeu atendimento foi direcionado para *Vendas & Novos Clientes*. Um consultor entrará em contato em instantes!';
      } else if (userTxt === '2') {
        botResponse = '✅ *Opção 2 Escolhida*\nSeu atendimento foi direcionado para o *Suporte Técnico*. Por favor descreva seu problema.';
      } else if (userTxt === '3') {
        botResponse = '✅ *Opção 3 Escolhida*\nSeu atendimento foi direcionado para o setor *Financeiro & PIX*. Informe seu CPF ou CNPJ.';
      } else if (userTxt === '4') {
        botResponse = '✅ *Opção 4 Escolhida*\nEncaminhando para a *Recepção Geral*.';
      } else {
        botResponse = '🤖 *FHChat Auto-Reply*\nPor favor, digite um número de 1 a 4 para navegar no menu.';
      }

      setSimMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-950/50">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-gray-100 flex items-center gap-2">
              Construtor Visual de Fluxo (Arrasta e Solta)
            </h2>
            <p className="text-xs text-gray-400">
              Arraste os componentes para a tela, conecte os pontos e crie bots de triagem WhatsApp em tempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isBotActive}
              onChange={(e) => setIsBotActive(e.target.checked)}
              className="rounded bg-gray-900 border-gray-700 text-emerald-500 focus:ring-emerald-500"
            />
            <span className={isBotActive ? 'text-emerald-400 font-semibold' : 'text-gray-500'}>
              {isBotActive ? '● Bot WhatsApp Ativo' : '○ Bot Pausado'}
            </span>
          </label>

          <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'editor' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Canvas Drag & Drop
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'simulator' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Simular Bot
            </button>
          </div>

          <button
            onClick={() => alert('Fluxo salvo com sucesso e implantado na engine WhatsApp Baileys!')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar & Ativar Fluxo
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="flex-1 flex relative overflow-hidden">
          {/* Left Palette / Sidebar for Drag & Drop items */}
          <div className="w-72 bg-gray-900/80 border-r border-gray-800 flex flex-col p-4 space-y-4 z-10 backdrop-blur-md">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                🧩 Componentes (Arrasta e Solta)
              </span>
              <p className="text-[10px] text-gray-500">
                Arraste qualquer bloco abaixo para o canvas para criar a etapa do fluxo:
              </p>
            </div>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {/* Item 1: Start */}
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'startNode', 'Gatilho Inicial')}
                className="p-3 bg-gray-950 hover:bg-emerald-950/20 border border-gray-800 hover:border-emerald-500/50 rounded-2xl cursor-grab active:cursor-grabbing transition-all flex items-center gap-3 group shadow"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  🏁
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-200 group-hover:text-emerald-400">Início do Fluxo</h4>
                  <p className="text-[10px] text-gray-500">Gatilho de mensagem inicial</p>
                </div>
              </div>

              {/* Item 2: Message */}
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'messageNode', 'Mensagem Texto')}
                className="p-3 bg-gray-950 hover:bg-blue-950/20 border border-gray-800 hover:border-blue-500/50 rounded-2xl cursor-grab active:cursor-grabbing transition-all flex items-center gap-3 group shadow"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                  💬
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-200 group-hover:text-blue-400">Mensagem de Texto</h4>
                  <p className="text-[10px] text-gray-500">Enviar resposta automática</p>
                </div>
              </div>

              {/* Item 3: Menu */}
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'menuNode', 'Menu de Triagem')}
                className="p-3 bg-gray-950 hover:bg-purple-950/20 border border-gray-800 hover:border-purple-500/50 rounded-2xl cursor-grab active:cursor-grabbing transition-all flex items-center gap-3 group shadow"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  🔀
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-200 group-hover:text-purple-400">Menu Numérico</h4>
                  <p className="text-[10px] text-gray-500">Triagem por números (1, 2, 3...)</p>
                </div>
              </div>

              {/* Item 4: Transfer Queue */}
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'transferNode', 'Transferir Fila')}
                className="p-3 bg-gray-950 hover:bg-amber-950/20 border border-gray-800 hover:border-amber-500/50 rounded-2xl cursor-grab active:cursor-grabbing transition-all flex items-center gap-3 group shadow"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  🏢
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-200 group-hover:text-amber-400">Mudar Fila / Setor</h4>
                  <p className="text-[10px] text-gray-500">Direciona a atendente humano</p>
                </div>
              </div>

              {/* Item 5: AI Gemini */}
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'aiNode', 'Atendente IA Gemini')}
                className="p-3 bg-gray-950 hover:bg-pink-950/20 border border-gray-800 hover:border-pink-500/50 rounded-2xl cursor-grab active:cursor-grabbing transition-all flex items-center gap-3 group shadow"
              >
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm">
                  ✨
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-200 group-hover:text-pink-400">Inteligência Artificial</h4>
                  <p className="text-[10px] text-gray-500">Resposta com Gemini AI</p>
                </div>
              </div>

              {/* Item 6: Delay */}
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'delayNode', 'Atraso / Temporizador')}
                className="p-3 bg-gray-950 hover:bg-cyan-950/20 border border-gray-800 hover:border-cyan-500/50 rounded-2xl cursor-grab active:cursor-grabbing transition-all flex items-center gap-3 group shadow"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  ⏱️
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-200 group-hover:text-cyan-400">Tempo de Espera</h4>
                  <p className="text-[10px] text-gray-500">Simula digitação / pausa</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800/80 text-[10px] text-gray-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>Dica: Arraste blocos para a tela e ligue as bolinhas coloridas para conectar o fluxo!</span>
            </div>
          </div>

          {/* Interactive ReactFlow Drag & Drop Canvas */}
          <div className="flex-1 h-full bg-gray-950 relative" onDragOver={onDragOver} onDrop={onDrop}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              onPaneClick={() => setSelectedNodeId(null)}
              fitView
              colorMode="dark"
            >
              <Background color="#374151" gap={20} size={1} />
              <Controls className="!bg-gray-900 !border-gray-800 !text-gray-200 !rounded-xl overflow-hidden shadow-xl" />
              <MiniMap
                className="!bg-gray-900/90 !border-gray-800 !rounded-xl overflow-hidden"
                nodeColor="#6b7280"
                maskColor="rgba(0, 0, 0, 0.7)"
              />
            </ReactFlow>
          </div>

          {/* Right Properties Inspector Panel */}
          {selectedNode && (
            <div className="w-80 bg-gray-900/90 border-l border-gray-800 p-5 flex flex-col z-10 backdrop-blur-md overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
                <h3 className="font-bold text-xs text-gray-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  Propriedades do Bloco
                </h3>
                <button
                  onClick={deleteSelectedNode}
                  className="text-rose-400 hover:bg-rose-950/40 p-1.5 rounded-lg border border-rose-900/40 transition-all text-xs flex items-center gap-1 cursor-pointer"
                  title="Excluir Bloco Selecionado"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4 text-xs flex-1">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Título da Etapa</label>
                  <input
                    type="text"
                    value={((selectedNode.data as any)?.title as string) || ''}
                    onChange={(e) => updateSelectedNodeData({ title: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Conditional configuration based on node type */}
                {selectedNode.type === 'messageNode' && (
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">Conteúdo da Mensagem Texto</label>
                    <textarea
                      rows={5}
                      value={((selectedNode.data as any)?.content as string) || ''}
                      onChange={(e) => updateSelectedNodeData({ content: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                )}

                {selectedNode.type === 'menuNode' && (
                  <div className="space-y-3">
                    <label className="block text-gray-400 mb-1 font-medium">Texto do Menu Exibido ao Cliente</label>
                    <textarea
                      rows={4}
                      value={((selectedNode.data as any)?.content as string) || ''}
                      onChange={(e) => updateSelectedNodeData({ content: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-purple-500 font-mono"
                    />

                    <label className="block text-gray-300 font-bold pt-2">Opções Numéricas do Menu:</label>
                    <div className="space-y-2">
                      {(((selectedNode.data as any)?.options as any[]) || []).map((opt: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-950 p-2 rounded-xl border border-gray-800">
                          <span className="font-bold text-purple-400 font-mono w-5 text-center">{opt.key}</span>
                          <input
                            type="text"
                            value={opt.label || ''}
                            onChange={(e) => {
                              const newOpts = [...(((selectedNode.data as any)?.options as any[]) || [])];
                              newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                              updateSelectedNodeData({ options: newOpts });
                            }}
                            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-1.5 text-gray-200 text-xs focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.type === 'transferNode' && (
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">Fila de Atendimento Destino</label>
                    <select
                      value={((selectedNode.data as any)?.targetQueueName as string) || 'Vendas'}
                      onChange={(e) => updateSelectedNodeData({ targetQueueName: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="Vendas & Novos Clientes">Vendas &amp; Novos Clientes</option>
                      <option value="Suporte Técnico">Suporte Técnico</option>
                      <option value="Financeiro & PIX">Financeiro &amp; PIX</option>
                      <option value="Recepção / Geral">Recepção / Geral</option>
                    </select>
                  </div>
                )}

                {selectedNode.type === 'aiNode' && (
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">Prompt de Instruções Gemini AI</label>
                    <textarea
                      rows={5}
                      value={((selectedNode.data as any)?.aiPrompt as string) || ''}
                      onChange={(e) => updateSelectedNodeData({ aiPrompt: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-purple-500 font-mono text-xs"
                      placeholder="Ex: Você é o assistente virtual da FHChat..."
                    />
                  </div>
                )}

                {selectedNode.type === 'delayNode' && (
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">Tempo de Espera (Segundos)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={((selectedNode.data as any)?.delaySeconds as number) || 3}
                      onChange={(e) => updateSelectedNodeData({ delaySeconds: parseInt(e.target.value) || 1 })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Simulator View */
        <div className="flex-1 flex justify-center items-center p-6 bg-gray-950">
          <div className="w-full max-w-md h-[550px] bg-gray-900 border border-gray-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden relative">
            <div className="bg-emerald-950/80 border-b border-emerald-800/40 p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-xs text-emerald-100">Simulador de Bot WhatsApp</h4>
                <p className="text-[10px] text-emerald-300">Testando respostas em tempo real</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950/50">
              {simMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-none shadow'
                        : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSimSend} className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                placeholder="Envie 1, 2, 3 ou 4 para testar..."
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition-all cursor-pointer"
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

export const VisualBotFlowBuilder: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
};
