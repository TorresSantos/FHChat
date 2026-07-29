import React, { useState, useEffect } from 'react';
import { Radio, QrCode, RefreshCw, Smartphone, Shield, Plus, CheckCircle2, AlertCircle, Trash2, Edit3 } from 'lucide-react';
import { WhatsAppConnection, Department, Queue } from '../../types';

interface ConnectionsManagementProps {
  connections: WhatsAppConnection[];
  departments: Department[];
  queues: Queue[];
  onAddConnection: (conn: WhatsAppConnection) => void;
  onUpdateConnection: (conn: WhatsAppConnection) => void;
  onDeleteConnection: (id: string) => void;
}

export const ConnectionsManagement: React.FC<ConnectionsManagementProps> = ({
  connections,
  departments,
  queues,
  onAddConnection,
  onUpdateConnection,
  onDeleteConnection
}) => {
  const [selectedConnection, setSelectedConnection] = useState<WhatsAppConnection | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [baileysLiveStatus, setBaileysLiveStatus] = useState<string>('disconnected');

  // New Connection Form state
  const [isNewConnModalOpen, setIsNewConnModalOpen] = useState(false);
  const [newConnName, setNewConnName] = useState('');
  const [newConnPhone, setNewConnPhone] = useState('');
  const [newConnProvider, setNewConnProvider] = useState<'baileys' | 'evolution'>('baileys');

  const handleOpenQrModal = async (conn: WhatsAppConnection) => {
    setSelectedConnection(conn);
    setQrCodeData(null);
    setIsQrModalOpen(true);

    if (conn.provider === 'baileys') {
      const sessionId = conn.baileysSessionId || conn.instanceName || 'default_baileys';
      setBaileysLiveStatus('connecting');

      try {
        const res = await fetch('/api/baileys/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            phoneNumberForPairing: conn.usePairingCode ? conn.phone : undefined
          })
        });
        const data = await res.json();
        if (data.success && data.state) {
          if (data.state.qrCodeDataUrl) setQrCodeData(data.state.qrCodeDataUrl);
          if (data.state.status) setBaileysLiveStatus(data.state.status);
        }
      } catch (e) {
        console.error('[Baileys] Connect error:', e);
      }
    }
  };

  // Live polling for Baileys QR / Connection Status
  useEffect(() => {
    if (!isQrModalOpen || !selectedConnection || selectedConnection.provider !== 'baileys') {
      return;
    }

    const sessionId = selectedConnection.baileysSessionId || selectedConnection.instanceName || 'default_baileys';

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/baileys/status/${sessionId}`);
        const data = await res.json();
        if (data.success && data.state) {
          setBaileysLiveStatus(data.state.status);
          if (data.state.qrCodeDataUrl) {
            setQrCodeData(data.state.qrCodeDataUrl);
          }
          if (data.state.pairingCode) {
            setSelectedConnection((prev) => (prev ? { ...prev, pairingCode: data.state.pairingCode! } : prev));
          }
          // AUTOMATICALLY SAVE AND CLOSE WHEN CONNECTED!
          if (data.state.status === 'connected') {
            onUpdateConnection({
              ...selectedConnection,
              status: 'connected',
              phone: data.state.phone || selectedConnection.phone,
              updatedAt: new Date().toISOString()
            });
            setIsQrModalOpen(false);
          }
        }
      } catch (e) {
        console.warn('[Baileys Poll] Status check fail:', e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isQrModalOpen, selectedConnection]);

  const handleCreateNewConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnName) return;

    const newConn: WhatsAppConnection = {
      id: 'conn-' + Date.now(),
      name: newConnName,
      phone: newConnPhone || '+559900000000',
      status: 'disconnected',
      provider: newConnProvider,
      baileysSessionId: `baileys_session_${Date.now()}`,
      departmentIds: departments.map((d) => d.id),
      queueIds: queues.map((q) => q.id),
      botActive: true,
      updatedAt: new Date().toISOString()
    };

    onAddConnection(newConn);
    setIsNewConnModalOpen(false);
    setNewConnName('');
    setNewConnPhone('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400" />
              Conexões e Canais WhatsApp
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Gerencie suas linhas do WhatsApp acopladas com o motor Baileys WebSocket real.
            </p>
          </div>

          <button
            onClick={() => setIsNewConnModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Conexão WhatsApp
          </button>
        </div>

        {/* Connection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((conn) => {
            const isConnected = conn.status === 'connected';

            return (
              <div
                key={conn.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-gray-100">{conn.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-emerald-400 font-mono font-medium">{conn.phone}</span>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 uppercase font-semibold">
                          {conn.provider === 'baileys' ? 'Baileys Engine' : 'Evolution API'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 ${
                        isConnected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      {isConnected ? 'Conectado' : 'Aguardando Leitura'}
                    </span>
                  </div>

                  <div className="mt-4 bg-gray-950 p-3 rounded-xl border border-gray-800/80 space-y-2 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Sessão ID:</span>
                      <span className="font-mono text-gray-200">{conn.baileysSessionId || conn.instanceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filas Vinculadas:</span>
                      <span className="text-emerald-400 font-medium">{conn.queueIds?.length || 4} Fila(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bot Triage Auto:</span>
                      <span className={conn.botActive ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                        {conn.botActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                  <button
                    onClick={() => handleOpenQrModal(conn)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium py-2 px-3 rounded-xl transition-all cursor-pointer border border-gray-700"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    {isConnected ? 'Re-escanear QR Code' : 'Scan QR Code'}
                  </button>

                  <button
                    onClick={() => onDeleteConnection(conn.id)}
                    className="p-2 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                    title="Excluir Conexão"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Scan Modal */}
      {isQrModalOpen && selectedConnection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 text-center space-y-4 relative shadow-2xl">
            <h3 className="text-base font-bold text-gray-100 flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              Conectar WhatsApp via QR Code
            </h3>

            <p className="text-xs text-gray-400">
              Abra o WhatsApp no celular &gt; <strong>Aparelhos Conectados</strong> &gt; <strong>Conectar Aparelho</strong>.
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto min-h-[220px] min-w-[220px] flex items-center justify-center">
              {qrCodeData ? (
                <img src={qrCodeData} alt="QR Code WhatsApp" className="w-52 h-52 object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-600 text-xs">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  <span>Gerando QR Code do Baileys...</span>
                </div>
              )}
            </div>

            <div className="text-left bg-gray-950 p-3 rounded-xl border border-gray-800 text-[11px] text-gray-400 space-y-1">
              <p><strong>Motor:</strong> Baileys Engine WebSocket</p>
              <p><strong>Sessão:</strong> {selectedConnection.baileysSessionId || selectedConnection.instanceName}</p>
              <p className="flex items-center gap-1.5">
                <strong>Status Atual:</strong>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                  baileysLiveStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : baileysLiveStatus === 'qrcode'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {baileysLiveStatus === 'connected' ? '● Conectado com Sucesso!' : baileysLiveStatus === 'qrcode' ? 'Aguardando Leitura QR...' : 'Iniciando Baileys...'}
                </span>
              </p>
            </div>

            <p className="text-[11px] text-gray-400 pt-1">
              A conexão é identificada e salva <strong>automaticamente</strong> assim que você faz a leitura no aplicativo do WhatsApp.
            </p>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-xs py-2 rounded-xl transition-all border border-gray-700 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* New Connection Modal */}
      {isNewConnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateNewConnection} className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Adicionar Nova Linha WhatsApp
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Nome da Linha</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: WhatsApp Vendas SP"
                  value={newConnName}
                  onChange={(e) => setNewConnName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Número de Telefone</label>
                <input
                  type="text"
                  placeholder="+5511999998888"
                  value={newConnPhone}
                  onChange={(e) => setNewConnPhone(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Motor da Conexão</label>
                <select
                  value={newConnProvider}
                  onChange={(e) => setNewConnProvider(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="baileys">Baileys WebSocket Engine (Recomendado)</option>
                  <option value="evolution">Evolution API (REST Proxy)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewConnModalOpen(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-xs py-2.5 rounded-xl transition-all border border-gray-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/40 cursor-pointer"
              >
                Criar Conexão
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
