import React, { useState } from 'react';
import {
  Phone,
  MoreVertical,
  ArrowRightLeft,
  CheckCircle,
  Sidebar,
  Lock,
  Play,
  Pause,
  Volume2,
  FileText,
  Download,
  Image as ImageIcon,
  Check,
  CheckCheck,
  User,
  Sparkles,
  Clock,
  ShieldCheck,
  Receipt,
  Copy,
  Send,
  UserCheck
} from 'lucide-react';
import { Ticket, Message, Department, Attendant, QuickResponse } from '../../types';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  ticket: Ticket;
  messages: Message[];
  departments: Department[];
  attendants: Attendant[];
  currentAttendant: Attendant;
  quickResponses: QuickResponse[];
  onSendMessage: (text: string, isNote: boolean, type?: 'text' | 'image' | 'audio' | 'document') => void;
  onOpenTransferModal: () => void;
  onOpenCloseModal: () => void;
  onToggleCustomerSidebar: () => void;
  showCustomerSidebar: boolean;
  onToggleWaitingStatus?: (ticketId: string) => void;
  onAcceptTicket?: (ticketId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  ticket,
  messages,
  departments,
  attendants,
  currentAttendant,
  quickResponses,
  onSendMessage,
  onOpenTransferModal,
  onOpenCloseModal,
  onToggleCustomerSidebar,
  showCustomerSidebar,
  onToggleWaitingStatus,
  onAcceptTicket
}) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showProtocolMenu, setShowProtocolMenu] = useState(false);
  const [copiedProtocol, setCopiedProtocol] = useState(false);
  const [sentProtocol, setSentProtocol] = useState(false);

  const dept = departments.find((d) => d.id === ticket.departmentId);
  const assignedAgent = attendants.find((a) => a.id === ticket.assignedAttendantId);

  const protocolNumber =
    ticket.protocol ||
    `PROT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${ticket.id.replace(/\D/g, '') || '101'}`;

  // If ticket is pending, hide conversation until accepted
  if (ticket.status === 'pending') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 text-center space-y-6 relative overflow-y-auto">
        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center shadow-lg border border-amber-500/20 animate-bounce" style={{ animationDuration: '3s' }}>
          <Clock className="w-10 h-10" />
        </div>

        <div className="max-w-md space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Chamado Pendente na Fila
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Atendimento Aguardando Aceite
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            As mensagens deste cliente ficam ocultas até que você aceite o atendimento. Ao clicar no botão abaixo, o chamado será atribuído a você.
          </p>
        </div>

        {/* Customer Summary Box */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-xs space-y-4 text-left">
          <div className="flex items-center space-x-3">
            <img
              src={
                ticket.contact.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
              }
              alt={ticket.contact.name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                {ticket.contact.name}
              </h4>
              <p className="text-xs font-mono text-gray-500">{ticket.contact.phone}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Protocolo:</span>
              <span className="font-mono font-bold text-emerald-500">{protocolNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Fila / Setor:</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {dept ? dept.name : 'Fila Geral'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => onAcceptTicket && onAcceptTicket(ticket.id)}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-2xl flex items-center gap-2.5 shadow-xl shadow-emerald-950/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <UserCheck className="w-5 h-5" />
          <span>Aceitar Atendimento</span>
        </button>
      </div>
    );
  }

  const getProtocolFormattedMessage = () => {
    return `📋 *PROTOCOLO DE ATENDIMENTO*\n\nOlá, *${ticket.contact.name}*!\nO número do seu protocolo de atendimento é:\n\n🎫 *Protocolo:* \`${protocolNumber}\`\n📅 *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n👤 *Atendente:* ${assignedAgent ? assignedAgent.name : 'Equipe de Suporte'}\n🏢 *Setor:* ${dept ? dept.name : 'Atendimento'}\n\nGuardamos este registro com carinho para seu acompanhamento!`;
  };

  const handleSendProtocol = () => {
    onSendMessage(getProtocolFormattedMessage(), false);
    setSentProtocol(true);
    setShowProtocolMenu(false);
    setTimeout(() => setSentProtocol(false), 2500);
  };

  const handleCopyProtocol = () => {
    navigator.clipboard.writeText(getProtocolFormattedMessage());
    setCopiedProtocol(true);
    setShowProtocolMenu(false);
    setTimeout(() => setCopiedProtocol(false), 2500);
  };

  const togglePlayAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000);
    }
  };

  // Convert messages into a clean readable string for Gemini AI context
  const chatHistoryText = messages
    .filter((m) => !m.isInternalNote)
    .slice(-8)
    .map((m) => `${m.sender === 'contact' ? ticket.contact.name : m.senderName || 'Atendente'}: ${m.content}`)
    .join('\n');

  return (
    <div id="chat-window-container" className="flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-gray-950 relative overflow-hidden">
      {/* WhatsApp Background Wallpaper pattern styling */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      {/* Chat Window Header */}
      <div className="h-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-10 shrink-0 shadow-xs">
        {/* Left: Contact Info */}
        <div className="flex items-center space-x-3">
          <img
            src={
              ticket.contact.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
            }
            alt={ticket.contact.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                {ticket.contact.name}
              </h3>
              {dept && (
                <span
                  className="px-2 py-0.5 text-[9px] font-bold text-white rounded"
                  style={{ backgroundColor: dept.color }}
                >
                  {dept.name}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
              {ticket.contact.phone}
              {assignedAgent && (
                <span className="text-gray-400 font-sans text-[11px] ml-1">
                  • Atendido por: <b>{assignedAgent.name}</b>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-2">
          {/* Protocol Button Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProtocolMenu(!showProtocolMenu)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs border ${
                sentProtocol || copiedProtocol
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
              title="Opções de Protocolo de Atendimento (Enviar ao cliente ou copiar)"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {sentProtocol ? 'Enviado! ✓' : copiedProtocol ? 'Copiado! ✓' : 'Protocolo'}
              </span>
            </button>

            {showProtocolMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="px-2 py-1.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="font-bold text-gray-500 dark:text-gray-400 text-[10px] uppercase">
                    Protocolo de Atendimento
                  </span>
                  <span className="font-mono font-bold text-emerald-500 text-[10px]">
                    {protocolNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSendProtocol}
                  className="w-full text-left p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl text-gray-800 dark:text-gray-200 font-semibold flex items-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-500" />
                  <div>
                    <span className="block text-xs">Enviar no WhatsApp</span>
                    <span className="block text-[10px] font-normal text-gray-400">Envia mensagem formatada com protocolo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleCopyProtocol}
                  className="w-full text-left p-2 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-xl text-gray-800 dark:text-gray-200 font-semibold flex items-center gap-2 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-500" />
                  <div>
                    <span className="block text-xs">Copiar Texto do Protocolo</span>
                    <span className="block text-[10px] font-normal text-gray-400">Copia o texto completo para colar</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Em Espera Toggle Button */}
          <button
            onClick={() => onToggleWaitingStatus && onToggleWaitingStatus(ticket.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
              ticket.status === 'waiting'
                ? 'bg-amber-500 hover:bg-amber-400 text-white ring-2 ring-amber-300 animate-pulse'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            }`}
            title={
              ticket.status === 'waiting'
                ? 'Cliente em espera. Clique para retomar atendimento ativo.'
                : 'Colocar cliente em espera (move para a aba Em Espera)'
            }
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {ticket.status === 'waiting' ? 'Em Espera ⏳' : 'Pôr em Espera'}
            </span>
          </button>

          <button
            onClick={onOpenTransferModal}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Transferir para outro setor ou atendente"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Transferir</span>
          </button>

          <button
            onClick={onOpenCloseModal}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Finalizar e resolver chamado"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Finalizar</span>
          </button>

          <button
            onClick={onToggleCustomerSidebar}
            className={`p-2 rounded-xl transition-colors ${
              showCustomerSidebar
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Alternar Detalhes do Cliente"
          >
            <Sidebar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10">
        {/* Waiting Status Banner */}
        {ticket.status === 'waiting' && (
          <div className="max-w-xl mx-auto my-1 bg-amber-500/20 border border-amber-500/40 rounded-2xl p-3 backdrop-blur-xs text-amber-800 dark:text-amber-200 text-xs shadow-md space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-300">
                <Clock className="w-4 h-4 animate-spin text-amber-500" style={{ animationDuration: '4s' }} />
                Atendimento em Espera (Aguardando cliente responder)
              </span>
              <button
                onClick={() => onToggleWaitingStatus && onToggleWaitingStatus(ticket.id)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs"
              >
                Retomar Atendimento
              </button>
            </div>
            <p className="text-[11px] opacity-90 leading-tight">
              Este cliente foi colocado na aba <strong>Em Espera ⏳</strong>. Quando ele mandar uma nova mensagem, o chamado retornará automaticamente para os seus atendimentos ativos.
            </p>
          </div>
        )}

        {/* Ticket Start System Banner */}
        <div className="text-center my-2">
          <span className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xs text-gray-500 dark:text-gray-400 text-[10px] px-3 py-1 rounded-full shadow-xs border border-gray-200/50 dark:border-gray-700/50 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-500" /> Chamado iniciado em {ticket.createdAt.split('T')[0]} • Criptografia WhatsApp via Evolution API
          </span>
        </div>

        {messages.map((m) => {
          const isMe = m.sender === 'attendant';
          const isNote = m.isInternalNote;

          if (isNote) {
            return (
              <div key={m.id} className="max-w-lg mx-auto my-2">
                <div className="bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-xl p-3 shadow-xs text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[11px] text-amber-800 dark:text-amber-300">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" /> Nota Interna por {m.senderName || 'Atendente'}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`max-w-[85%] sm:max-w-md rounded-2xl px-3.5 py-2.5 shadow-xs relative space-y-1 ${
                  isMe
                    ? 'bg-[#d9fdd3] dark:bg-emerald-950 text-gray-900 dark:text-emerald-50 rounded-tr-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-xs'
                }`}
              >
                {/* Sender Label for Attendants */}
                {isMe && m.senderName && (
                  <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 leading-none">
                    {m.senderName}
                  </p>
                )}

                {/* Message Content rendering based on type */}
                {m.type === 'audio' ? (
                  <div className="flex items-center space-x-3 py-1">
                    <button
                      onClick={() => togglePlayAudio(m.id)}
                      className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-transform hover:scale-105"
                    >
                      {playingAudioId === m.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 space-y-1">
                      {/* Audio Waveform visualization */}
                      <div className="flex items-center space-x-0.5 h-6">
                        {[40, 70, 30, 90, 100, 60, 80, 40, 90, 50, 30, 70, 90, 40].map((h, idx) => (
                          <div
                            key={idx}
                            className={`w-1 rounded-full ${
                              playingAudioId === m.id ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                        {m.audioDuration || '0:15'}
                      </span>
                    </div>
                  </div>
                ) : m.type === 'image' ? (
                  <div className="space-y-1">
                    <img
                      src={m.mediaUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=80'}
                      alt="Anexo"
                      onClick={() => setLightboxImage(m.mediaUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80')}
                      className="rounded-lg max-h-48 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                    <p className="text-xs whitespace-pre-wrap">{m.content}</p>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                )}

                {/* Footer Timestamp & Status Ticks */}
                <div className="flex items-center justify-end space-x-1 text-[10px] text-gray-400 dark:text-gray-400">
                  <span>{m.timestamp}</span>
                  {isMe && (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500 ml-0.5" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <img src={lightboxImage} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
        </div>
      )}

      {/* Message Input Component */}
      <MessageInput
        onSendMessage={onSendMessage}
        quickResponses={quickResponses}
        contactName={ticket.contact.name}
        departmentName={dept?.name || 'Geral'}
        attendantName={currentAttendant.name}
        chatHistoryText={chatHistoryText}
      />
    </div>
  );
};
