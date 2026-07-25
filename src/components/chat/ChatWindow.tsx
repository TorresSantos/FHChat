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
  ShieldCheck
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
  showCustomerSidebar
}) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const dept = departments.find((d) => d.id === ticket.departmentId);
  const assignedAgent = attendants.find((a) => a.id === ticket.assignedAttendantId);

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
