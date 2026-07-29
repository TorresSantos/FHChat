import React, { useRef, useEffect } from 'react';
import { Phone, ArrowRightLeft, CheckCircle2, Lock, Sparkles, User, Tag, Clock, UserPlus, PauseCircle, PlayCircle } from 'lucide-react';
import { Ticket, Message, QuickReply, Queue, Department, Attendant } from '../../types';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  ticket: Ticket;
  messages: Message[];
  onSendMessage: (text: string, isNote?: boolean, attachments?: { name: string; url: string; type: string }[]) => void;
  quickReplies: QuickReply[];
  queues: Queue[];
  departments: Department[];
  attendants: Attendant[];
  onOpenTransferModal: () => void;
  onOpenCloseTicketModal: () => void;
  onReopenTicket?: () => void;
  onAcceptTicket?: (ticketId: string) => void;
  onPutOnHold?: (ticketId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  ticket,
  messages,
  onSendMessage,
  quickReplies,
  queues,
  departments,
  attendants,
  onOpenTransferModal,
  onOpenCloseTicketModal,
  onReopenTicket,
  onAcceptTicket,
  onPutOnHold
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queue = queues.find((q) => q.id === ticket.queueId);
  const department = departments.find((d) => d.id === ticket.departmentId);

  // Auto scroll to bottom on message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // REAL WHATSAPP AVATAR OR INITIALS
  const avatarUrl = ticket.contact.avatar;
  const contactInitials = ticket.contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isPending = ticket.status === 'pending' || !ticket.attendantId;

  // LOCKED SCREEN FOR UNACCEPTED / PENDING TICKETS IN QUEUE
  if (isPending) {
    return (
      <div className="flex-1 flex flex-col bg-gray-950 h-full min-w-0">
        {/* Top Header */}
        <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={ticket.contact.name}
                  className="w-10 h-10 rounded-full object-cover border border-amber-500/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 flex items-center justify-center font-bold text-white text-xs shadow">
                  {contactInitials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-gray-900" />
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-sm text-gray-100 truncate">{ticket.contact.name}</h3>
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <span className="text-amber-400 font-mono font-medium">{ticket.contact.phone}</span>
                <span>•</span>
                <span className="text-gray-300 font-medium">{queue?.name || 'Fila Geral'}</span>
              </div>
            </div>
          </div>

          {onAcceptTicket && (
            <button
              onClick={() => onAcceptTicket(ticket.id)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Aceitar Atendimento</span>
            </button>
          )}
        </div>

        {/* Lock Prompt Body */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-950">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-100 mb-2">Atendimento Pendente na Fila</h3>
          <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
            Este atendimento está aguardando na fila. Para visualizar o histórico de mensagens e conversar com o cliente, você precisa primeiro aceitá-lo.
          </p>
          {onAcceptTicket && (
            <button
              onClick={() => onAcceptTicket(ticket.id)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              Aceitar Atendimento
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 h-full min-w-0">
      {/* Top Header */}
      <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={ticket.contact.name}
                className="w-10 h-10 rounded-full object-cover border border-emerald-500/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center font-bold text-white text-xs shadow">
                {contactInitials}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-gray-900" />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-sm text-gray-100 truncate">{ticket.contact.name}</h3>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="text-emerald-400 font-mono font-medium">{ticket.contact.phone}</span>
              <span>•</span>
              <span className="text-gray-300 font-medium">{queue?.name || 'Fila Geral'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {ticket.status === 'in_progress' && onPutOnHold && (
            <button
              onClick={() => onPutOnHold(ticket.id)}
              className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-medium px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              title="Colocar atendimento em espera aguardando resposta"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Espera</span>
            </button>
          )}

          {ticket.status === 'waiting' && onAcceptTicket && (
            <button
              onClick={() => onAcceptTicket(ticket.id)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
              title="Voltar atendimento para Meus"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Retornar para Meus</span>
            </button>
          )}

          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-700 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Transferir</span>
          </button>

          {ticket.status === 'resolved' ? (
            <button
              onClick={onReopenTicket}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reabrir Atendimento</span>
            </button>
          ) : (
            <button
              onClick={onOpenCloseTicketModal}
              className="flex items-center gap-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Encerrar</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            Início do histórico de conversas deste atendimento.
          </div>
        ) : (
          messages.map((msg) => {
            const isContact = msg.sender === 'contact';
            const isNote = msg.isInternalNote;

            if (isNote) {
              return (
                <div key={msg.id} className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 my-2 text-xs text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-400">
                    <Lock className="w-3.5 h-3.5" />
                    Nota Interna por {msg.senderName || 'Atendente'}
                  </div>
                  <p>{msg.content}</p>
                  <div className="text-[10px] text-amber-500 text-right mt-1">{msg.timestamp}</div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] md:max-w-[65%] ${isContact ? 'mr-auto items-start' : 'ml-auto items-end'}`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs space-y-1.5 shadow ${
                    isContact
                      ? 'bg-gray-900 border border-gray-800 text-gray-100 rounded-tl-xs'
                      : 'bg-emerald-700 text-white rounded-tr-xs'
                  }`}
                >
                  {msg.senderName && !isContact && (
                    <div className="text-[10px] font-bold text-emerald-200 opacity-90">{msg.senderName}</div>
                  )}

                  {/* Render Media Content if present */}
                  {msg.mediaUrl && (
                    <div className="my-1.5">
                      {msg.type === 'image' ? (
                        <img
                          src={msg.mediaUrl}
                          alt="Anexo enviado"
                          className="max-w-xs max-h-60 rounded-xl object-cover border border-black/20"
                        />
                      ) : msg.type === 'audio' ? (
                        <div className="bg-black/20 p-2 rounded-xl flex flex-col gap-1">
                          <audio controls src={msg.mediaUrl} className="w-full h-8 max-w-xs accent-emerald-500" />
                        </div>
                      ) : (
                        <a
                          href={msg.mediaUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 bg-black/20 p-2 rounded-xl hover:bg-black/30 transition-all font-medium underline text-xs"
                        >
                          📄 Download Anexo Documento
                        </a>
                      )}
                    </div>
                  )}

                  {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}

                  <div
                    className={`text-[9px] text-right ${isContact ? 'text-gray-500' : 'text-emerald-200'}`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Component */}
      <MessageInput
        onSendMessage={onSendMessage}
        quickReplies={quickReplies}
        contactName={ticket.contact.name}
        departmentName={department?.name}
      />
    </div>
  );
};
