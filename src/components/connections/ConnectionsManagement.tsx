import React, { useState } from 'react';
import {
  Smartphone,
  Plus,
  QrCode,
  RefreshCw,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bot,
  Layers,
  Link,
  Phone,
  Key,
  Globe,
  Settings2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Check,
  Zap,
  Radio,
  Copy,
  Terminal,
  Cpu
} from 'lucide-react';
import { WhatsAppConnection, Queue, BotFlow } from '../../types';

interface ConnectionsManagementProps {
  connections: WhatsAppConnection[];
  queues: Queue[];
  bots?: BotFlow[];
  onAddConnection: (conn: Omit<WhatsAppConnection, 'id' | 'updatedAt'>) => void;
  onUpdateConnection: (conn: WhatsAppConnection) => void;
  onDeleteConnection: (id: string) => void;
  onTestConnection: (conn: WhatsAppConnection) => Promise<boolean>;
}

export const ConnectionsManagement: React.FC<ConnectionsManagementProps> = ({
  connections,
  queues,
  bots = [],
  onAddConnection,
  onUpdateConnection,
  onDeleteConnection,
  onTestConnection
}) => {
  const [selectedConnection, setSelectedConnection] = useState<WhatsAppConnection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    provider: 'evolution' as 'evolution' | 'baileys',
    apiUrl: 'https://api.evolution-api.com',
    apiKey: '',
    instanceName: '',
    webhookUrl: 'https://meudominio.com/api/evolution/webhook',
    baileysSessionId: '',
    usePairingCode: false,
    pairingCode: '',
    baileysVersion: '@whiskeysockets/baileys v6.7.8',
    browserName: 'Chrome / macOS',
    status: 'connected' as WhatsAppConnection['status'],
    queueIds: [] as string[],
    botEnabled: true,
    botId: '',
    botGreetingMessage: 'Olá! Seja bem-vindo à nossa Central Digital. Digite o número da opção desejada:\n\n1️⃣ Vendas & Novos Clientes\n2️⃣ Suporte Técnico\n3️⃣ Financeiro & Boletos\n4️⃣ Outros Assuntos',
    completionMessage: 'Agradecemos o seu contato! Seu atendimento foi finalizado com sucesso. Se precisar de mais alguma coisa, estamos à disposição. Tenha um ótimo dia! 😊',
    transferKeyword: 'voltar',
    outOfHoursMessage: 'Nosso horário de atendimento é de segunda a sexta das 08h às 18h.'
  });

  const handleOpenAddModal = () => {
    setSelectedConnection(null);
    setFormData({
      name: '',
      phone: '',
      provider: 'evolution',
      apiUrl: 'https://api.evolution-api.com',
      apiKey: 'EVOLUTION_SECRET_KEY_' + Math.floor(1000 + Math.random() * 9000),
      instanceName: 'whatsapp-inst-' + (connections.length + 1),
      webhookUrl: 'https://meudominio.com/api/evolution/webhook',
      baileysSessionId: 'baileys_session_' + (connections.length + 1),
      usePairingCode: false,
      pairingCode: Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      baileysVersion: '@whiskeysockets/baileys v6.7.8',
      browserName: 'Chrome / macOS',
      status: 'connected',
      queueIds: queues.map((q) => q.id),
      botEnabled: true,
      botId: bots.length > 0 ? bots[0].id : '',
      botGreetingMessage: 'Olá! Seja bem-vindo ao nosso atendimento via WhatsApp.\nPor favor, escolha uma opção abaixo para ser direcionado:\n' +
        queues.map((q) => `${q.optionNumber}️⃣ ${q.name}`).join('\n'),
      completionMessage: 'Agradecemos o seu contato! Atendimento finalizado com sucesso. Se precisar de algo mais, estamos à disposição. 😊',
      transferKeyword: 'voltar',
      outOfHoursMessage: 'Nosso atendimento funciona de segunda a sexta, das 08:00 às 18:00.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (conn: WhatsAppConnection) => {
    setSelectedConnection(conn);
    setFormData({
      name: conn.name,
      phone: conn.phone,
      provider: conn.provider || 'evolution',
      apiUrl: conn.apiUrl,
      apiKey: conn.apiKey,
      instanceName: conn.instanceName,
      webhookUrl: conn.webhookUrl,
      baileysSessionId: conn.baileysSessionId || conn.instanceName,
      usePairingCode: !!conn.usePairingCode,
      pairingCode: conn.pairingCode || Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      baileysVersion: conn.baileysVersion || '@whiskeysockets/baileys v6.7.8',
      browserName: conn.browserName || 'Chrome / macOS',
      status: conn.status,
      queueIds: [...conn.queueIds],
      botEnabled: conn.botEnabled,
      botId: conn.botId || (bots.length > 0 ? bots[0].id : ''),
      botGreetingMessage: conn.botGreetingMessage,
      completionMessage: conn.completionMessage || 'Agradecemos o seu contato! Atendimento finalizado com sucesso.',
      transferKeyword: conn.transferKeyword || 'voltar',
      outOfHoursMessage: conn.outOfHoursMessage || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (selectedConnection) {
      onUpdateConnection({
        ...selectedConnection,
        name: formData.name,
        phone: formData.phone,
        provider: formData.provider,
        apiUrl: formData.apiUrl,
        apiKey: formData.apiKey,
        instanceName: formData.instanceName || formData.baileysSessionId,
        webhookUrl: formData.webhookUrl,
        baileysSessionId: formData.baileysSessionId,
        usePairingCode: formData.usePairingCode,
        pairingCode: formData.pairingCode,
        baileysVersion: formData.baileysVersion,
        browserName: formData.browserName,
        status: formData.status,
        queueIds: formData.queueIds,
        botEnabled: formData.botEnabled,
        botId: formData.botId || undefined,
        botGreetingMessage: formData.botGreetingMessage,
        completionMessage: formData.completionMessage,
        transferKeyword: formData.transferKeyword,
        outOfHoursMessage: formData.outOfHoursMessage,
        updatedAt: new Date().toISOString()
      });
    } else {
      onAddConnection({
        name: formData.name,
        phone: formData.phone || '+55 11 9' + Math.floor(10000000 + Math.random() * 90000000),
        provider: formData.provider,
        apiUrl: formData.apiUrl,
        apiKey: formData.apiKey,
        instanceName: formData.instanceName || formData.baileysSessionId || 'baileys_inst_1',
        webhookUrl: formData.webhookUrl,
        baileysSessionId: formData.baileysSessionId || 'baileys_sess_' + Date.now(),
        usePairingCode: formData.usePairingCode,
        pairingCode: formData.pairingCode || Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
        baileysVersion: formData.baileysVersion,
        browserName: formData.browserName,
        status: formData.status,
        queueIds: formData.queueIds,
        isDefault: connections.length === 0,
        botEnabled: formData.botEnabled,
        botId: formData.botId || undefined,
        botGreetingMessage: formData.botGreetingMessage,
        completionMessage: formData.completionMessage,
        transferKeyword: formData.transferKeyword,
        outOfHoursMessage: formData.outOfHoursMessage,
        lastSyncTime: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
  };

  const handleToggleQueueSelection = (queueId: string) => {
    setFormData((prev) => {
      const exists = prev.queueIds.includes(queueId);
      if (exists) {
        return { ...prev, queueIds: prev.queueIds.filter((id) => id !== queueId) };
      } else {
        return { ...prev, queueIds: [...prev.queueIds, queueId] };
      }
    });
  };

  const handleTest = async (conn: WhatsAppConnection) => {
    setTestingId(conn.id);
    setTestResult(null);
    try {
      const isOk = await onTestConnection(conn);
      setTestResult({
        id: conn.id,
        success: isOk,
        message: isOk
          ? 'Conexão simulada/real verificada com sucesso! Instância online.'
          : 'Instância offline ou chave incorreta.'
      });
    } catch {
      setTestResult({
        id: conn.id,
        success: false,
        message: 'Erro ao conectar com a Evolution API.'
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleGenerateQr = (conn: WhatsAppConnection) => {
    setSelectedConnection(conn);
    // Simulated QR code svg/image URL
    const randomSeed = Math.floor(Math.random() * 100000);
    setQrCodeData(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EvolutionAPI_Instance_${conn.instanceName}_${randomSeed}`);
    setIsQrModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      {/* Top Banner & Header */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Múltiplas Conexões WhatsApp
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Evolution API & <Zap className="w-3 h-3 text-purple-400" /> Baileys Engine
                  </span>
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Conecte múltiplos números de WhatsApp via Evolution API ou motor leve Baileys (WhiskeySockets).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenAddModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Conexão WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Total de Conexões</p>
              <p className="text-2xl font-bold text-white mt-1">{connections.length}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-xl text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Instâncias Online</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {connections.filter((c) => c.status === 'connected').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Filas Mapeadas</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{queues.length}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Bots Ativos</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {connections.filter((c) => c.botEnabled).length}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Connections List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Instâncias & Números Conectados ({connections.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {connections.map((conn) => {
              const assignedQueues = queues.filter((q) => conn.queueIds.includes(q.id));
              const isTesting = testingId === conn.id;

              return (
                <div
                  key={conn.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden group"
                >
                  {/* Top Bar inside card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-gray-800 border border-gray-700/60 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base">{conn.name}</h3>
                          {conn.isDefault && (
                            <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              Conexão Padrão
                            </span>
                          )}
                          {conn.provider === 'baileys' ? (
                            <span className="text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                              <Zap className="w-3 h-3 text-purple-400" /> Baileys Engine
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                              <Globe className="w-3 h-3 text-emerald-400" /> Evolution API
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-emerald-400 mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {conn.phone || 'Sem número associado'}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {conn.status === 'connected' ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Conectado</span>
                        </span>
                      ) : conn.status === 'connecting' ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Conectando</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Desconectado</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="bg-gray-950/60 rounded-xl p-3 border border-gray-800/80 space-y-2 text-xs">
                    {conn.provider === 'baileys' ? (
                      <div className="grid grid-cols-2 gap-2 text-gray-400">
                        <div>
                          <span className="text-[10px] text-purple-400 block uppercase font-medium">Sessão Baileys (WS)</span>
                          <span className="font-mono text-gray-200 truncate block">{conn.baileysSessionId || conn.instanceName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase">Modo de Conexão</span>
                          <span className="font-sans text-gray-300 text-[11px] truncate block">
                            {conn.usePairingCode ? 'Código Pareamento (8 dig.)' : 'Scan QR Code'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase">Versão Pacote</span>
                          <span className="font-mono text-gray-300 text-[10px] truncate block">{conn.baileysVersion || '@whiskeysockets/baileys'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase">Endpoint WS / Webhook</span>
                          <span className="font-mono text-gray-300 text-[10px] truncate block" title={conn.apiUrl}>
                            {conn.apiUrl}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-gray-400">
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase">Instância Evolution</span>
                          <span className="font-mono text-gray-200 truncate block">{conn.instanceName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase">API Endpoint</span>
                          <span className="font-mono text-gray-200 truncate block" title={conn.apiUrl}>
                            {conn.apiUrl}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Queues Attached */}
                    <div className="pt-2 border-t border-gray-800/60">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                        <span>Filas de Atendimento Vinculadas:</span>
                        <span className="text-emerald-400">{assignedQueues.length} fila(s)</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {assignedQueues.length > 0 ? (
                          assignedQueues.map((q) => (
                            <span
                              key={q.id}
                              className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-lg border font-medium"
                              style={{
                                backgroundColor: `${q.color}15`,
                                borderColor: `${q.color}40`,
                                color: q.color
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: q.color }} />
                              {q.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-gray-500 italic">Nenhuma fila vinculada</span>
                        )}
                      </div>
                    </div>

                    {/* Bot Auto-Reply Banner */}
                    <div className="pt-2 border-t border-gray-800/60 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Bot className={`w-4 h-4 ${conn.botEnabled && conn.botId ? 'text-purple-400' : 'text-gray-600'}`} />
                          <span className="font-medium">Bot Vinculado:</span>
                          {(() => {
                            const linkedBot = bots.find((b) => b.id === conn.botId);
                            if (conn.botEnabled && linkedBot) {
                              return (
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                  <span>{linkedBot.name}</span>
                                </span>
                              );
                            }
                            if (conn.botEnabled) {
                              return (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                  <span>Bot Menu Padrão</span>
                                </span>
                              );
                            }
                            return <span className="text-gray-500 italic">Sem bot vinculado</span>;
                          })()}
                        </div>

                        <span className="text-gray-500 text-[10px]">
                          {conn.botEnabled ? 'Ativo' : 'Desativado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Message if Tested */}
                  {testResult && testResult.id === conn.id && (
                    <div
                      className={`text-xs p-2.5 rounded-xl border flex items-center space-x-2 ${
                        testResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}
                    >
                      {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                      <span>{testResult.message}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-800">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleGenerateQr(conn)}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded-lg border border-gray-700 transition-all flex items-center space-x-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                        <span>QR Code</span>
                      </button>

                      <button
                        onClick={() => handleTest(conn)}
                        disabled={isTesting}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded-lg border border-gray-700 transition-all flex items-center space-x-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(conn)}
                        className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Editar Conexão"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover a conexão "${conn.name}"?`)) {
                            onDeleteConnection(conn.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                        title="Excluir Conexão"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add / Edit Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedConnection ? 'Editar Conexão Evolution API' : 'Nova Conexão WhatsApp'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Configure os parâmetros da instância e associe as filas de atendimento.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-5">
              {/* Provider Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                  Selecione o Motor de Conexão WhatsApp (API Provider) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        provider: 'evolution',
                        apiUrl: formData.apiUrl.includes('baileys') || formData.apiUrl === '' ? 'https://api.evolution-api.com' : formData.apiUrl
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      formData.provider === 'evolution'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Globe className={`w-4 h-4 ${formData.provider === 'evolution' ? 'text-emerald-400' : 'text-gray-500'}`} />
                      <span className="font-bold text-xs text-white">Evolution API (REST)</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      API REST com Webhooks, multi-instância e gerenciador completo de WhatsApp Web.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        provider: 'baileys',
                        apiUrl: formData.apiUrl.includes('evolution-api') || formData.apiUrl === '' ? 'wss://baileys.meudominio.com' : formData.apiUrl
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      formData.provider === 'baileys'
                        ? 'bg-purple-500/10 border-purple-500 text-white shadow-md shadow-purple-950/40'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Zap className={`w-4 h-4 ${formData.provider === 'baileys' ? 'text-purple-400' : 'text-gray-500'}`} />
                      <span className="font-bold text-xs text-white">Baileys Engine (WS)</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Motor leve WebSocket (@whiskeysockets/baileys) de conexão direta sem intermediários.
                    </p>
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Nome Identificador da Linha *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: WhatsApp Vendas Principal"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Número do WhatsApp (Formatado)
                  </label>
                  <input
                    type="text"
                    placeholder="+55 11 99999-8888"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* API Connection details - Conditional */}
              {formData.provider === 'baileys' ? (
                <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-800/40 space-y-3">
                  <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>Configurações Baileys Engine (@whiskeysockets/baileys)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Nome da Sessão Baileys (Session ID) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="baileys_session_vendas"
                        value={formData.baileysSessionId}
                        onChange={(e) => setFormData({ ...formData, baileysSessionId: e.target.value, instanceName: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Endpoint WebSocket / Server URL
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.apiUrl}
                        onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                        placeholder="wss://baileys.meudominio.com"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Versão do Pacote Baileys
                      </label>
                      <input
                        type="text"
                        value={formData.baileysVersion}
                        onChange={(e) => setFormData({ ...formData, baileysVersion: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        User-Agent / Navegador Simulado
                      </label>
                      <input
                        type="text"
                        value={formData.browserName}
                        onChange={(e) => setFormData({ ...formData, browserName: e.target.value })}
                        placeholder="Chrome / macOS"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Pairing Code vs QR Code */}
                  <div className="pt-2 border-t border-purple-900/40">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.usePairingCode}
                        onChange={(e) => setFormData({ ...formData, usePairingCode: e.target.checked })}
                        className="rounded bg-gray-900 border-gray-700 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs font-semibold text-purple-200">
                        Usar Código de Pareamento de 8 Dígitos (Pairing Code) ao invés de QR Code
                      </span>
                    </label>
                    <p className="text-[10px] text-gray-400 ml-6 mt-0.5">
                      Permite parear inserindo um código numérico diretamente no aplicativo do WhatsApp.
                    </p>

                    {formData.usePairingCode && (
                      <div className="mt-2 ml-6">
                        <label className="block text-[11px] font-medium text-purple-300 mb-1">
                          Código de Pareamento Pré-definido
                        </label>
                        <input
                          type="text"
                          value={formData.pairingCode}
                          onChange={(e) => setFormData({ ...formData, pairingCode: e.target.value })}
                          className="w-48 bg-gray-900 border border-purple-500/50 rounded-xl px-3 py-1.5 text-xs text-purple-300 font-mono font-bold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 space-y-3">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Globe className="w-4 h-4" />
                    <span>Credenciais Evolution API</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1">API URL Endpoint</label>
                      <input
                        type="text"
                        required
                        value={formData.apiUrl}
                        onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1">Nome da Instância *</label>
                      <input
                        type="text"
                        required
                        placeholder="minha-instancia-vendas"
                        value={formData.instanceName}
                        onChange={(e) => setFormData({ ...formData, instanceName: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">Chave da API (API Key)</label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Bind Queues */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1 flex items-center justify-between">
                  <span>Atrelar Filas de Atendimento a esta Conexão</span>
                  <span className="text-[11px] text-emerald-400 font-normal">
                    {formData.queueIds.length} fila(s) selecionada(s)
                  </span>
                </label>
                <p className="text-[11px] text-gray-400 mb-2">
                  As mensagens recebidas por esse número WhatsApp poderão ser roteadas para as filas marcadas:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {queues.map((q) => {
                    const isSelected = formData.queueIds.includes(q.id);
                    return (
                      <button
                        type="button"
                        key={q.id}
                        onClick={() => handleToggleQueueSelection(q.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                            : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: q.color }} />
                          <span className="truncate">{q.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bot Auto Menu Settings */}
              <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-white uppercase">Vincular Bot de Atendimento</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.botEnabled}
                      onChange={(e) => setFormData({ ...formData, botEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {formData.botEnabled && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                        Selecione o Bot Responsável por esta Conexão WhatsApp *
                      </label>
                      <select
                        value={formData.botId}
                        onChange={(e) => setFormData({ ...formData, botId: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                      >
                        <option value="">Sem Bot (Apenas Atendimento Humano Direto)</option>
                        {bots.map((b) => (
                          <option key={b.id} value={b.id}>
                            🤖 {b.name} ({b.isActive ? 'Status: Ativo' : 'Status: Inativo'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.botId ? (
                      (() => {
                        const selectedBot = bots.find((b) => b.id === formData.botId);
                        return (
                          <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-purple-200">{selectedBot?.name || 'Bot Selecionado'}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  selectedBot?.isActive
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-gray-800 text-gray-400'
                                }`}
                              >
                                {selectedBot?.isActive ? 'Bot Ativo' : 'Bot Inativo'}
                              </span>
                            </div>
                            {selectedBot?.description && (
                              <p className="text-[11px] text-purple-300/80">{selectedBot.description}</p>
                            )}
                            <p className="text-[10px] text-emerald-400/90 font-medium pt-1 flex items-center gap-1">
                              ✓ As mensagens de atendimento, menus e roteamento de filas são definidos diretamente pelo fluxo deste Bot.
                            </p>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="space-y-1 pt-1">
                        <label className="block text-[11px] font-medium text-gray-400">
                          Mensagem Inicial de Boas-Vindas (Sem Bot Fluxo)
                        </label>
                        <textarea
                          rows={3}
                          value={formData.botGreetingMessage}
                          onChange={(e) => setFormData({ ...formData, botGreetingMessage: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                        />
                        <p className="text-[10px] text-gray-500">
                          Esta mensagem de boas-vindas será apresentada automaticamente ao receber novos contatos nesta conexão.
                        </p>
                      </div>
                    )}

                    {/* Mensagem de Finalização Automática */}
                    <div className="space-y-1 pt-2 border-t border-purple-900/40">
                      <label className="block text-[11px] font-semibold text-emerald-400 flex items-center justify-between">
                        <span>Mensagem de Finalização Automática de Atendimento</span>
                        <span className="text-[10px] text-gray-500 font-normal">(Enviada ao encerrar o ticket)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.completionMessage}
                        onChange={(e) => setFormData({ ...formData, completionMessage: e.target.value })}
                        placeholder="Ex: Agradecemos seu contato! Seu atendimento foi finalizado com sucesso. Tenha um ótimo dia!"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                      />
                      <p className="text-[10px] text-gray-400">
                        Esta mensagem de despedida será enviada automaticamente pelo WhatsApp ao cliente assim que um atendente concluir e finalizar o ticket.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/30"
                >
                  {selectedConnection ? 'Salvar Alterações' : 'Criar Conexão WhatsApp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code / Pairing Code Modal */}
      {isQrModalOpen && selectedConnection && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {selectedConnection.provider === 'baileys' && selectedConnection.usePairingCode ? (
                  <>
                    <Key className="w-4 h-4 text-purple-400" />
                    <span>Código de Pareamento Baileys</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Conectar WhatsApp Web</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-gray-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            {selectedConnection.provider === 'baileys' && selectedConnection.usePairingCode ? (
              /* Pairing Code Mode for Baileys */
              <div className="space-y-4">
                <p className="text-xs text-gray-300">
                  Insira o código numérico no WhatsApp do seu celular:
                </p>

                <div className="bg-purple-950/60 border-2 border-purple-500/50 rounded-2xl p-4 shadow-inner">
                  <span className="text-2xl md:text-3xl font-mono font-extrabold text-purple-200 tracking-wider select-all block">
                    {selectedConnection.pairingCode || '8492-7103'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedConnection.pairingCode || '8492-7103');
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código de Pareamento'}</span>
                </button>

                <div className="text-left bg-gray-950 p-3 rounded-xl border border-gray-800 text-[11px] text-gray-400 space-y-1">
                  <p className="font-semibold text-purple-300">Instruções no Celular:</p>
                  <p>1. Abra o WhatsApp &gt; Menu/Configurações</p>
                  <p>2. Clique em <strong>Aparelhos Conectados</strong></p>
                  <p>3. Clique em <strong>Conectar com número de telefone</strong></p>
                  <p>4. Digite o código de 8 dígitos acima.</p>
                </div>
              </div>
            ) : (
              /* QR Code Mode */
              <div className="space-y-4">
                <p className="text-xs text-gray-300">
                  Abra o WhatsApp no celular &gt; <strong>Aparelhos Conectados</strong> &gt; <strong>Conectar um Aparelho</strong> e aponte para a imagem:
                </p>

                <div className="bg-white p-4 rounded-2xl inline-block border-4 border-emerald-500/30 shadow-inner">
                  {qrCodeData ? (
                    <img
                      src={qrCodeData}
                      alt={selectedConnection.provider === 'baileys' ? 'QR Code Baileys WS' : 'QR Code Evolution API'}
                      className="w-48 h-48 mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-xs">
                      Gerando QR Code...
                    </div>
                  )}
                </div>

                <div className="text-left bg-gray-950 p-3 rounded-xl border border-gray-800 text-[11px] text-gray-400 space-y-1">
                  <p><strong>Motor:</strong> {selectedConnection.provider === 'baileys' ? 'Baileys Engine (WS)' : 'Evolution API (REST)'}</p>
                  <p><strong>Sessão/Instância:</strong> {selectedConnection.instanceName || selectedConnection.baileysSessionId}</p>
                  <p><strong>Status atual:</strong> <span className="text-amber-400">Aguardando Leitura QR</span></p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                // Simulate connected
                onUpdateConnection({
                  ...selectedConnection,
                  status: 'connected',
                  updatedAt: new Date().toISOString()
                });
                setIsQrModalOpen(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/40"
            >
              Simular Conexão Concluída
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
