import React, { useState, useEffect, useRef } from 'react';
import {
  Contact,
  Ticket,
  Message,
  Department,
  Queue,
  Attendant,
  WhatsAppConnection,
  QuickReply,
  WebhookLog,
  AuthorizationRequest
} from './types';
import {
  initialDepartments,
  initialQueues,
  initialAttendants,
  initialConnections,
  initialContacts,
  initialTickets,
  initialQuickReplies
} from './data/mockData';

import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import { ChatList, FilterTabType } from './components/chat/ChatList';
import { ChatWindow } from './components/chat/ChatWindow';
import { CustomerSidebar } from './components/chat/CustomerSidebar';
import { ConnectionsManagement } from './components/connections/ConnectionsManagement';
import { ContactsManager } from './components/contacts/ContactsManager';
import { AttendantsManagement } from './components/attendants/AttendantsManagement';
import { QueuesManagement } from './components/queues/QueuesManagement';
import { checkQueueSchedule } from './utils/queueSchedule';
import { QuickRepliesManager } from './components/quickReplies/QuickRepliesManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { EvolutionSettings } from './components/evolution/EvolutionSettings';
import { VisualBotFlowBuilder } from './components/bot/VisualBotFlowBuilder';
import { CalendarManager } from './components/calendar/CalendarManager';
import { AuthScreen } from './components/auth/AuthScreen';

import { TransferModal } from './components/chat/TransferModal';
import { CloseTicketModal } from './components/chat/CloseTicketModal';
import { NewChatModal } from './components/chat/NewChatModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentAttendant, setCurrentAttendant] = useState<Attendant>(initialAttendants[0]);

  // Main State Collections
  const [activeTab, setActiveTab] = useState('chat');
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [queues, setQueues] = useState<Queue[]>(initialQueues);
  const [attendants, setAttendants] = useState<Attendant[]>(initialAttendants);
  const [connections, setConnections] = useState<WhatsAppConnection[]>(initialConnections);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(initialQuickReplies);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [authorizationRequests, setAuthorizationRequests] = useState<AuthorizationRequest[]>([]);

  // Media Rotation state map (url -> angle)
  const [imageRotations, setImageRotations] = useState<Record<string, number>>({});

  // Selected Chat & Filters
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTabType>('mine');
  const [selectedQueueId, setSelectedQueueId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCloseTicketModalOpen, setIsCloseTicketModalOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Track processed Baileys message IDs to prevent duplicates
  const processedBaileysMsgIdsRef = useRef<Set<string>>(new Set());

  // Periodical Inactivity Timeout Checker (Transbordo por inatividade de X minutos)
  useEffect(() => {
    const inactivityInterval = setInterval(() => {
      setTickets((prevTickets) => {
        const nowMs = Date.now();
        return prevTickets.map((t) => {
          if ((t.status === 'pending' || t.status === 'waiting') && (!t.queueId || t.queueId === '')) {
            const conn = connections.find((c) => c.id === t.connectionId || c.baileysSessionId === t.connectionId) || connections[0];
            const timeoutMin = conn?.inactivityTimeoutMinutes ?? 10;
            const updatedMs = new Date(t.updatedAt || t.createdAt).getTime();
            const elapsedMin = (nowMs - updatedMs) / 60000;

            if (elapsedMin >= timeoutMin) {
              const targetQ = conn?.inactivityQueueId || queues[0]?.id || 'queue-1';
              return {
                ...t,
                queueId: targetQ,
                updatedAt: new Date().toISOString()
              };
            }
          }
          return t;
        });
      });
    }, 15000);

    return () => clearInterval(inactivityInterval);
  }, [connections, queues]);

  // Real-time Baileys incoming message sync effect
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/baileys/all-messages');
        const data = await res.json();
        if (!data.success || !Array.isArray(data.sessions)) return;

        data.sessions.forEach((sess: { sessionId: string; messages: any[] }) => {
          if (!sess.messages) return;

          sess.messages.forEach((msg: {
            id: string;
            fromMe: boolean;
            sender: string;
            senderName: string;
            phone: string;
            text: string;
            timestamp: string;
            avatarUrl?: string | null;
          }) => {
            if (processedBaileysMsgIdsRef.current.has(msg.id)) return;
            processedBaileysMsgIdsRef.current.add(msg.id);

            const cleanPhone = msg.phone.replace(/\D/g, '');
            if (!cleanPhone) return;

            const text = msg.text;
            const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isBotMsg = msg.senderName === 'Bot FHChat';

            // 1. Find or create Contact
            setContacts((prevContacts) => {
              let existing = prevContacts.find((c) => c.phone.replace(/\D/g, '') === cleanPhone);

              if (!existing) {
                const contactName = (!msg.fromMe && msg.senderName)
                  ? msg.senderName
                  : `Cliente ${cleanPhone.slice(-4)}`;

                existing = {
                  id: 'cont-' + cleanPhone,
                  name: contactName,
                  phone: `+${cleanPhone}`,
                  email: `${cleanPhone}@whatsapp.user`,
                  avatar: msg.avatarUrl || undefined,
                  tags: ['WhatsApp', 'Baileys'],
                  createdAt: new Date().toISOString()
                };
                return [...prevContacts, existing];
              } else {
                if (msg.avatarUrl && existing.avatar !== msg.avatarUrl) {
                  return prevContacts.map((c) =>
                    c.id === existing!.id ? { ...c, avatar: msg.avatarUrl || undefined } : c
                  );
                }
                return prevContacts;
              }
            });

            // 2. Find contact instance for ticket binding
            const contactId = 'cont-' + cleanPhone;

            // Determine option digit selection (1, 2, 3, 4)
            let selectedQueueIdFromBot = '';
            let selectedDeptIdFromBot = '';
            let isOptionChosen = false;
            const optionDigit = text.trim();

            if (optionDigit === '1') {
              selectedQueueIdFromBot = 'queue-1';
              selectedDeptIdFromBot = 'dept-vendas';
              isOptionChosen = true;
            } else if (optionDigit === '2') {
              selectedQueueIdFromBot = 'queue-2';
              selectedDeptIdFromBot = 'dept-suporte';
              isOptionChosen = true;
            } else if (optionDigit === '3') {
              selectedQueueIdFromBot = 'queue-3';
              selectedDeptIdFromBot = 'dept-financeiro';
              isOptionChosen = true;
            } else if (optionDigit === '4') {
              selectedQueueIdFromBot = 'queue-4';
              selectedDeptIdFromBot = 'dept-geral';
              isOptionChosen = true;
            }

            const activeConn = connections.find((c) => c.baileysSessionId === sess.sessionId) || connections[0];
            const maxAttempts = activeConn?.maxInvalidAttempts ?? 3;
            const fallbackQ = activeConn?.fallbackQueueId || queues[0]?.id || 'queue-1';

            // 3. Update or create TICKET for this contact
            let targetTicketId = '';

            setTickets((prevTickets) => {
              const existingTicket = prevTickets.find(
                (t) => t.contact.phone.replace(/\D/g, '') === cleanPhone && t.status !== 'resolved'
              );

              if (existingTicket) {
                targetTicketId = existingTicket.id;
                let newQ = existingTicket.queueId;
                let newDept = existingTicket.departmentId;
                let newAttempts = existingTicket.invalidChoiceAttempts || 0;

                if (isOptionChosen) {
                  newQ = selectedQueueIdFromBot;
                  newDept = selectedDeptIdFromBot;
                  newAttempts = 0;
                } else if (!msg.fromMe && (!existingTicket.queueId || existingTicket.queueId === '')) {
                  newAttempts += 1;
                  if (newAttempts >= maxAttempts) {
                    newQ = fallbackQ;
                    newAttempts = 0;
                  }
                }

                return prevTickets.map((t) =>
                  t.id === existingTicket.id
                    ? {
                        ...t,
                        status: t.status === 'waiting' ? 'in_progress' : t.status,
                        contact: {
                          ...t.contact,
                          avatar: msg.avatarUrl || t.contact.avatar
                        },
                        queueId: newQ,
                        departmentId: newDept,
                        invalidChoiceAttempts: newAttempts,
                        lastMessageSnippet: text,
                        lastMessageTimestamp: timeStr,
                        unreadCount: (!msg.fromMe && selectedTicketId !== t.id) ? (t.unreadCount || 0) + 1 : t.unreadCount,
                        updatedAt: new Date().toISOString()
                      }
                    : t
                );
              } else {
                // Create new ticket for this contact!
                targetTicketId = 'tick-' + cleanPhone + '-' + Date.now();
                const newContact: Contact = {
                  id: contactId,
                  name: (!msg.fromMe && msg.senderName) ? msg.senderName : `Cliente ${cleanPhone.slice(-4)}`,
                  phone: `+${cleanPhone}`,
                  avatar: msg.avatarUrl || undefined,
                  tags: ['WhatsApp', 'Baileys'],
                  createdAt: new Date().toISOString()
                };

                const initialQ = isOptionChosen ? selectedQueueIdFromBot : '';
                const initialDept = isOptionChosen ? selectedDeptIdFromBot : '';

                const newTicket: Ticket = {
                  id: targetTicketId,
                  protocol: '2026' + Math.floor(100000 + Math.random() * 900000),
                  contactId: newContact.id,
                  contact: newContact,
                  departmentId: initialDept,
                  queueId: initialQ,
                  invalidChoiceAttempts: (!isOptionChosen && !msg.fromMe) ? 1 : 0,
                  status: 'pending',
                  priority: 'medium',
                  connectionId: sess.sessionId,
                  unreadCount: msg.fromMe ? 0 : 1,
                  lastMessageSnippet: text,
                  lastMessageTimestamp: timeStr,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };

                return [newTicket, ...prevTickets];
              }
            });

            // 4. Append message to target ticket messages store
            setTimeout(() => {
              const activeTId = targetTicketId || ('tick-' + cleanPhone);
              setMessages((prevMsgs) => {
                const currentList = prevMsgs[activeTId] || [];
                if (currentList.some((m) => m.id === msg.id)) return prevMsgs;

                const newMsg: Message = {
                  id: msg.id,
                  ticketId: activeTId,
                  sender: msg.fromMe ? (isBotMsg ? 'bot' : 'attendant') : 'contact',
                  senderName: msg.senderName,
                  type: 'text',
                  content: text,
                  timestamp: timeStr,
                  status: 'delivered'
                };

                return {
                  ...prevMsgs,
                  [activeTId]: [...currentList, newMsg]
                };
              });
            }, 50);
          });
        });
      } catch (err) {
        console.warn('[Baileys Sync] Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedTicketId]);

  // Selected Active Ticket Helper
  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || null;
  const activeMessages = selectedTicketId ? messages[selectedTicketId] || [] : [];

  // Send Message Handler
  const handleSendMessage = async (
    text: string,
    isNote: boolean = false,
    attachments?: { name: string; url: string; type: string }[]
  ) => {
    if (!selectedTicketId || !activeTicket) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let createdMsgs: Message[] = [];

    if (attachments && attachments.length > 0) {
      attachments.forEach((att, idx) => {
        createdMsgs.push({
          id: `msg-out-att-${Date.now()}-${idx}`,
          ticketId: selectedTicketId,
          sender: isNote ? 'system' : 'attendant',
          senderName: currentAttendant.name,
          type: (att.type as any) || 'document',
          content: att.type === 'audio' ? '🎤 Mensagem de Áudio' : att.name,
          mediaUrl: att.url,
          timestamp: timeStr,
          status: 'sent',
          isInternalNote: isNote
        });
      });
    }

    if (text.trim()) {
      createdMsgs.push({
        id: 'msg-out-' + Date.now(),
        ticketId: selectedTicketId,
        sender: isNote ? 'system' : 'attendant',
        senderName: currentAttendant.name,
        type: 'text',
        content: text,
        timestamp: timeStr,
        status: 'sent',
        isInternalNote: isNote
      });
    }

    if (createdMsgs.length === 0) return;

    setMessages((prev) => ({
      ...prev,
      [selectedTicketId]: [...(prev[selectedTicketId] || []), ...createdMsgs]
    }));

    const lastSnippet = text.trim() || attachments?.[0]?.name || 'Anexo enviado';

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? {
              ...t,
              status: t.status === 'waiting' ? 'in_progress' : t.status,
              lastMessageSnippet: isNote ? `[Nota]: ${lastSnippet}` : lastSnippet,
              lastMessageTimestamp: timeStr,
              updatedAt: new Date().toISOString()
            }
          : t
      )
    );

    // If real WhatsApp response (not internal note), send via Baileys API!
    if (!isNote) {
      const activeConn = connections.find((c) => c.provider === 'baileys') || connections[0];
      const sessionId = activeConn?.baileysSessionId || activeConn?.instanceName || 'default_baileys';

      try {
        await fetch('/api/baileys/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            number: activeTicket.contact.phone,
            text: text.trim() || attachments?.[0]?.name || 'Anexo'
          })
        });
      } catch (e) {
        console.error('[Baileys Send] Error sending outbound message:', e);
      }
    }
  };

  // Ticket Actions
  const handleAcceptTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'in_progress', attendantId: currentAttendant.id, updatedAt: new Date().toISOString() }
          : t
      )
    );
    setSelectedTicketId(ticketId);
    setFilterTab('mine');
  };

  const handlePutOnHold = (ticketId?: string) => {
    const targetId = ticketId || selectedTicketId;
    if (!targetId) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTickets((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? { ...t, status: 'waiting', updatedAt: new Date().toISOString() }
          : t
      )
    );

    setMessages((prev) => ({
      ...prev,
      [targetId]: [
        ...(prev[targetId] || []),
        {
          id: 'msg-waiting-' + Date.now(),
          ticketId: targetId,
          sender: 'system',
          senderName: 'Sistema',
          type: 'text',
          content: `Atendimento colocado em espera por ${currentAttendant.name}. Aguardando resposta do cliente.`,
          timestamp: timeStr,
          status: 'delivered',
          isInternalNote: true
        }
      ]
    }));

    setFilterTab('waiting');
  };

  const handleTransferTicket = (queueId?: string, attendantId?: string) => {
    if (!selectedTicketId) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? {
              ...t,
              queueId: queueId || t.queueId,
              attendantId: attendantId || undefined,
              status: attendantId ? 'in_progress' : 'pending',
              updatedAt: new Date().toISOString()
            }
          : t
      )
    );
  };

  const handleCloseTicket = (reason?: string, sendSurvey?: boolean, isProtected?: boolean, password?: string) => {
    if (!selectedTicketId) return;
    const targetId = selectedTicketId;
    const currentTicket = tickets.find((t) => t.id === targetId);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append internal note with closing reason
    if (reason) {
      setMessages((prev) => ({
        ...prev,
        [targetId]: [
          ...(prev[targetId] || []),
          {
            id: 'msg-close-' + Date.now(),
            ticketId: targetId,
            sender: 'system',
            senderName: 'Sistema',
            type: 'text',
            content: `Atendimento encerrado por ${currentAttendant.name}. Resumo: ${reason}${isProtected ? ' [Histórico Protegido]' : ''}`,
            timestamp: timeStr,
            status: 'delivered',
            isInternalNote: true
          }
        ]
      }));
    }

    // Optional NPS survey via Baileys WhatsApp
    if (sendSurvey && currentTicket) {
      const activeConn = connections.find((c) => c.provider === 'baileys') || connections[0];
      const sessionId = activeConn?.baileysSessionId || activeConn?.instanceName || 'default_baileys';
      fetch('/api/baileys/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          number: currentTicket.contact.phone,
          text: '⭐ *Atendimento Encerrado - Pesquisa de Satisfação*\nComo avalia nosso suporte de 1 a 5?\nResponda com uma nota.'
        })
      }).catch((e) => console.error('[Baileys Survey Error]', e));
    }

    // Set ticket status to resolved and record protection parameters
    setTickets((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? {
              ...t,
              status: 'resolved',
              isProtected: isProtected || false,
              protectPassword: password || undefined,
              originalAttendantId: currentAttendant.id,
              originalAttendantName: currentAttendant.name,
              unlockedByAttendants: [currentAttendant.id],
              updatedAt: new Date().toISOString()
            }
          : t
      )
    );

    // Automatically switch filter tab to 'closed' so the closed ticket is listed in "Fechados"
    setFilterTab('closed');
  };

  const handleRequestAuthorization = (ticketId: string, protocol: string, targetAttendantId: string, targetAttendantName: string) => {
    const req: AuthorizationRequest = {
      id: 'req-' + Date.now(),
      ticketId,
      protocol,
      contactName: tickets.find((t) => t.id === ticketId)?.contact.name || 'Cliente',
      requesterAttendantId: currentAttendant.id,
      requesterAttendantName: currentAttendant.name,
      targetAttendantId,
      targetAttendantName,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setAuthorizationRequests((prev) => [...prev, req]);
  };

  const handleApproveAuthorization = (requestId: string) => {
    const req = authorizationRequests.find((r) => r.id === requestId);
    if (!req) return;

    setAuthorizationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );

    setTickets((prev) =>
      prev.map((t) =>
        t.id === req.ticketId
          ? {
              ...t,
              unlockedByAttendants: Array.from(new Set([...(t.unlockedByAttendants || []), req.requesterAttendantId]))
            }
          : t
      )
    );
  };

  const handleRejectAuthorization = (requestId: string) => {
    setAuthorizationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  const handleUnlockWithPassword = (ticketId: string, passwordAttempt: string): boolean => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return false;

    if (target.protectPassword && target.protectPassword === passwordAttempt) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                unlockedByAttendants: Array.from(new Set([...(t.unlockedByAttendants || []), currentAttendant.id]))
              }
            : t
        )
      );
      return true;
    }
    return false;
  };

  const handleReopenTicket = (queueId: string, ticketId?: string) => {
    const targetId = ticketId || selectedTicketId;
    if (!targetId) return;

    const oldTicket = tickets.find((t) => t.id === targetId);
    if (!oldTicket) return;

    // Generate BRAND NEW protocol number
    const newProtocol = '2026' + Math.floor(100000 + Math.random() * 900000);
    const cleanPhone = oldTicket.contact.phone.replace(/\D/g, '');
    const newTicketId = 'tick-' + cleanPhone + '-' + Date.now();

    const targetQueue = queues.find((q) => q.id === queueId);
    const targetDeptId = targetQueue?.departmentId || oldTicket.departmentId || 'dept-vendas';

    const newTicket: Ticket = {
      id: newTicketId,
      protocol: newProtocol,
      contactId: oldTicket.contactId || oldTicket.contact.id,
      contact: oldTicket.contact,
      departmentId: targetDeptId,
      queueId: queueId,
      status: 'in_progress',
      priority: oldTicket.priority || 'medium',
      connectionId: oldTicket.connectionId,
      attendantId: currentAttendant.id,
      lastMessageSnippet: `Atendimento reaberto (Novo Protocolo #${newProtocol})`,
      lastMessageTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const initialNote: Message = {
      id: 'msg-' + Date.now(),
      ticketId: newTicketId,
      sender: 'system',
      senderName: 'Sistema',
      type: 'text',
      content: `Atendimento reaberto por ${currentAttendant.name} na fila ${targetQueue?.name || 'Fila Geral'}. Novo Protocolo #${newProtocol}. (Protocolo Anterior: #${oldTicket.protocol})`,
      timestamp: timeStr,
      status: 'delivered',
      isInternalNote: true
    };

    setTickets((prev) => [newTicket, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newTicketId]: [initialNote]
    }));

    setSelectedTicketId(newTicketId);
    setFilterTab('mine');
  };

  const handleCreateNewChat = (name: string, phone: string, queueId: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const newContact: Contact = {
      id: 'cont-' + cleanPhone,
      name,
      phone: `+${cleanPhone}`,
      tags: ['Manual', 'WhatsApp'],
      createdAt: new Date().toISOString()
    };

    const newTicket: Ticket = {
      id: 'tick-' + cleanPhone + '-' + Date.now(),
      protocol: '2026' + Math.floor(100000 + Math.random() * 900000),
      contactId: newContact.id,
      contact: newContact,
      departmentId: 'dept-vendas',
      queueId,
      attendantId: currentAttendant.id,
      status: 'in_progress',
      priority: 'medium',
      lastMessageSnippet: 'Atendimento iniciado manualmente',
      lastMessageTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setContacts((prev) => [...prev, newContact]);
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen
        attendants={attendants}
        onLogin={(email) => {
          const match = attendants.find((a) => a.email === email) || attendants[0];
          setCurrentAttendant(match);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-gray-100 overflow-hidden font-sans select-none">
      <Header
        currentAttendant={currentAttendant}
        connections={connections}
        onLogout={() => setIsAuthenticated(false)}
        activeTab={activeTab}
        authorizationRequests={authorizationRequests}
        onApproveAuthorization={handleApproveAuthorization}
        onRejectAuthorization={handleRejectAuthorization}
      />

      <div className="flex-1 flex overflow-hidden">
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingTicketsCount={tickets.filter((t) => t.status === 'pending').length}
        />

        <main className="flex-1 flex overflow-hidden relative">
          {activeTab === 'chat' && (
            <div className="flex-1 flex w-full h-full overflow-hidden">
              <ChatList
                tickets={tickets}
                selectedTicketId={selectedTicketId}
                onSelectTicket={(id) => {
                  setSelectedTicketId(id);
                  setTickets((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t))
                  );
                }}
                queues={queues}
                departments={departments}
                attendants={attendants}
                currentAttendant={currentAttendant}
                filterTab={filterTab}
                setFilterTab={setFilterTab}
                selectedQueueId={selectedQueueId}
                setSelectedQueueId={setSelectedQueueId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onAcceptTicket={handleAcceptTicket}
                onReopenTicket={handleReopenTicket}
              />

              {activeTicket ? (
                <>
                  <ChatWindow
                    ticket={activeTicket}
                    messages={activeMessages}
                    onSendMessage={handleSendMessage}
                    quickReplies={quickReplies}
                    queues={queues}
                    departments={departments}
                    attendants={attendants}
                    currentAttendant={currentAttendant}
                    allTicketsForContact={tickets.filter((t) => t.contact.id === activeTicket.contact.id)}
                    allMessagesStore={messages}
                    onRequestAuthorization={handleRequestAuthorization}
                    onUnlockWithPassword={handleUnlockWithPassword}
                    onOpenTransferModal={() => setIsTransferModalOpen(true)}
                    onOpenCloseTicketModal={() => setIsCloseTicketModalOpen(true)}
                    onReopenTicket={(queueId) => handleReopenTicket(queueId, activeTicket.id)}
                    onAcceptTicket={handleAcceptTicket}
                    onPutOnHold={handlePutOnHold}
                    imageRotations={imageRotations}
                    onRotationChange={(url, angle) =>
                      setImageRotations((prev) => ({ ...prev, [url]: angle }))
                    }
                  />
                  <CustomerSidebar
                    ticket={activeTicket}
                    messages={activeMessages}
                    imageRotations={imageRotations}
                    onRotationChange={(url, angle) =>
                      setImageRotations((prev) => ({ ...prev, [url]: angle }))
                    }
                    onUpdateContact={(updated) => {
                      setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                      setTickets((prev) =>
                        prev.map((t) => (t.contact.id === updated.id ? { ...t, contact: updated } : t))
                      );
                    }}
                  />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-950 p-8 text-center text-gray-500">
                  <div className="w-16 h-16 rounded-3xl bg-gray-900 border border-gray-800 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
                    💬
                  </div>
                  <h3 className="font-bold text-base text-gray-200 mb-1">Central de Atendimento WhatsApp</h3>
                  <p className="text-xs max-w-sm text-gray-400 mb-4">
                    Selecione um atendimento na lista à esquerda ou inicie um novo chat.
                  </p>
                  <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/40 cursor-pointer"
                  >
                    + Novo Atendimento WhatsApp
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <ConnectionsManagement
              connections={connections}
              departments={departments}
              queues={queues}
              tickets={tickets}
              onAddConnection={(c) => setConnections((prev) => [...prev, c])}
              onUpdateConnection={(c) => setConnections((prev) => prev.map((item) => (item.id === c.id ? c : item)))}
              onDeleteConnection={(id) => setConnections((prev) => prev.filter((item) => item.id !== id))}
              onMigrateTickets={(sourceId, targetId) =>
                setTickets((prev) =>
                  prev.map((t) => (t.connectionId === sourceId ? { ...t, connectionId: targetId } : t))
                )
              }
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsManager
              contacts={contacts}
              onAddContact={(c) => setContacts((prev) => [...prev, c])}
              onUpdateContact={(updated) => {
                setContacts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                setTickets((prev) =>
                  prev.map((t) => (t.contact.id === updated.id ? { ...t, contact: updated } : t))
                );
              }}
              onDeleteContact={(id) => setContacts((prev) => prev.filter((item) => item.id !== id))}
              onStartChatWithContact={(c) => handleCreateNewChat(c.name, c.phone, queues[0]?.id || 'queue-1')}
            />
          )}

          {activeTab === 'attendants' && (
            <AttendantsManagement
              attendants={attendants}
              departments={departments}
              queues={queues}
              connections={connections}
              onAddAttendant={(a) => setAttendants((prev) => [...prev, a])}
              onUpdateAttendant={(a) => setAttendants((prev) => prev.map((item) => (item.id === a.id ? a : item)))}
              onDeleteAttendant={(id) => setAttendants((prev) => prev.filter((item) => item.id !== id))}
            />
          )}

          {activeTab === 'queues' && (
            <QueuesManagement
              queues={queues}
              departments={departments}
              onAddQueue={(q) => setQueues((prev) => [...prev, q])}
              onUpdateQueue={(updated) => setQueues((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))}
              onDeleteQueue={(id) => setQueues((prev) => prev.filter((item) => item.id !== id))}
            />
          )}

          {activeTab === 'quickReplies' && (
            <QuickRepliesManager
              quickReplies={quickReplies}
              onAddQuickReply={(qr) => setQuickReplies((prev) => [...prev, qr])}
              onDeleteQuickReply={(id) => setQuickReplies((prev) => prev.filter((item) => item.id !== id))}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsManager
              tickets={tickets}
              queues={queues}
              attendants={attendants}
              connections={connections}
              departments={departments}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              tickets={tickets}
              attendants={attendants}
              queues={queues}
              connections={connections}
            />
          )}
          {activeTab === 'evolution' && <EvolutionSettings />}
          {activeTab === 'bot' && <VisualBotFlowBuilder />}
          {activeTab === 'calendar' && <CalendarManager contacts={contacts} attendants={attendants} />}
        </main>
      </div>

      {/* Modals */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        queues={queues}
        departments={departments}
        attendants={attendants}
        onTransfer={handleTransferTicket}
      />

      <CloseTicketModal
        isOpen={isCloseTicketModalOpen}
        onClose={() => setIsCloseTicketModalOpen(false)}
        onConfirmClose={handleCloseTicket}
      />

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        queues={queues}
        connections={connections}
        onCreateChat={handleCreateNewChat}
      />
    </div>
  );
}
