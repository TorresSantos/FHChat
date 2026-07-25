import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Send,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  ExternalLink,
  PhoneCall,
  Loader2,
  Sparkles,
  Server
} from 'lucide-react';
import { EvolutionConfig, WebhookLog } from '../../types';

interface EvolutionSettingsProps {
  config: EvolutionConfig;
  logs: WebhookLog[];
  onUpdateConfig: (newConfig: Partial<EvolutionConfig>) => void;
}

export const EvolutionSettings: React.FC<EvolutionSettingsProps> = ({
  config,
  logs,
  onUpdateConfig
}) => {
  const [apiUrl, setApiUrl] = useState(config.apiUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [instanceName, setInstanceName] = useState(config.instanceName);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const [testPhone, setTestPhone] = useState('+55 11 98888-1234');
  const [testMessage, setTestMessage] = useState('Teste de disparo via Evolution API + Central Multiatendimento!');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const [simulatedQrCode, setSimulatedQrCode] = useState<string>(
    'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=EvolutionAPIWhatsAppConnect'
  );
  const [pairingCode, setPairingCode] = useState<string>('9821-4401');

  const handleTestConnection = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/evolution/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiUrl, apiKey, instanceName })
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: 'Conexão realizada com sucesso com o servidor da Evolution API!'
        });
        onUpdateConfig({
          apiUrl,
          apiKey,
          instanceName,
          isConnected: true,
          instanceStatus: 'open',
          lastSyncTime: new Date().toISOString()
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Servidor indisponível ou credenciais inválidas.',
          details: data.error
        });
        onUpdateConfig({
          apiUrl,
          apiKey,
          instanceName,
          isConnected: false,
          instanceStatus: 'close'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Erro na requisição. A central operará no modo de simulação interativa.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/evolution/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl,
          apiKey,
          instanceName,
          number: testPhone,
          text: testMessage
        })
      });

      const data = await res.json();
      if (data.success) {
        setSendResult(`Mensagem disparada com sucesso! ID: ${data.messageId || 'EVO_SIM_OK'}`);
      } else {
        setSendResult('Erro no envio da mensagem.');
      }
    } catch (err) {
      setSendResult('Erro de conexão ao enviar.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleRefreshQrCode = () => {
    setSimulatedQrCode(
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=EvolutionAPIConnect_${Date.now()}`
    );
    const newPairing = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setPairingCode(newPairing);
  };

  return (
    <div id="evolution-settings-page" className="p-6 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full text-gray-900 dark:text-white">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <Sliders className="w-7 h-7 text-emerald-600" /> Conexão Evolution API
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Gerencie sua instância do WhatsApp, tokens de autenticação, Webhooks e ative o motor de inteligência artificial.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              config.isConnected
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            {config.isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Instância Online (OPEN)
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" /> Instância Desconectada
              </>
            )}
          </span>
        </div>
      </div>

      {/* Grid: Credentials Form & QR Code Pairing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Form Column */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" /> Credenciais do Servidor Evolution
            </h3>
            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 font-mono">
              API v2 / v1
            </span>
          </div>

          <form onSubmit={handleTestConnection} className="space-y-4">
            {/* API URL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Evolution API Server URL:
              </label>
              <input
                type="url"
                required
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://sua-api.evolution-api.com"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* API Key */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Global / Instance API Key (Apikey):
              </label>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Sua chave secreta da Evolution API"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Instance Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Nome da Instância (Instance Name):
              </label>
              <input
                type="text"
                required
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="ex: central-whatsapp-prod"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Test result message */}
            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs space-y-1 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  {testResult.message}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <a
                href="https://doc.evolution-api.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Ver Documentação Oficial
              </a>

              <button
                type="submit"
                disabled={isTesting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 flex items-center gap-2 transition-all"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Testando Conexão...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Testar & Salvar Conexão
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* QR Code / Pairing Column */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs text-center space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" /> Leitor de QR Code WhatsApp
            </h3>
            <button
              onClick={handleRefreshQrCode}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
              title="Atualizar QR Code"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* QR Code Graphic Container */}
          <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 p-4 rounded-xl inline-block relative group">
            <img
              src={simulatedQrCode}
              alt="QR Code Evolution API"
              className="w-44 h-44 mx-auto rounded-lg shadow-xs"
            />
            <p className="text-[10px] text-gray-400 mt-2 font-mono">
              Instância: {instanceName}
            </p>
          </div>

          {/* Pairing Code Alternative */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl space-y-1">
            <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
              Ou conecte via Código de Pareamento:
            </p>
            <p className="text-lg font-mono font-extrabold tracking-widest text-emerald-700 dark:text-emerald-400">
              {pairingCode}
            </p>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Abra o WhatsApp em seu smartphone &gt; <b>Aparelhos Conectados</b> &gt; <b>Conectar um aparelho</b> e aponte para a câmera.
          </p>
        </div>
      </div>

      {/* Test WhatsApp Message Dispatcher */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <Send className="w-4 h-4 text-emerald-600" /> Disparador de Teste de Mensagem Direct via API
        </h3>

        <form onSubmit={handleSendTestMessage} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Número Destinatário (WhatsApp):
            </label>
            <input
              type="text"
              required
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Mensagem de Teste:
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                required
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={isSendingTest}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shrink-0 shadow-md flex items-center gap-1.5"
              >
                {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Disparar Agora
              </button>
            </div>
          </div>
        </form>

        {sendResult && (
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            {sendResult}
          </p>
        )}
      </div>

      {/* Webhook Logs Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" /> Logs do Webhook de Recebimento (`/api/evolution/webhook`)
          </h3>
          <span className="text-xs text-gray-400">Notificações em tempo real</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-2.5 rounded-l-lg">Evento</th>
                <th className="p-2.5">Horário</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 rounded-r-lg">Payload / Dados do Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">{log.event}</td>
                  <td className="p-2.5 text-gray-400">{log.timestamp.split('T')[1]?.replace('Z', '') || log.timestamp}</td>
                  <td className="p-2.5">
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      200 OK
                    </span>
                  </td>
                  <td className="p-2.5 truncate max-w-xs text-gray-500">{log.payloadSnippet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
