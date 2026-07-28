import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SidebarNav, NavTab } from './components/SidebarNav';
import { ChatList } from './components/chat/ChatList';
import { ChatWindow } from './components/chat/ChatWindow';
import { CustomerSidebar } from './components/chat/CustomerSidebar';
import { TransferModal } from './components/chat/TransferModal';
import { CloseTicketModal } from './components/chat/CloseTicketModal';
import { NewChatModal } from './components/chat/NewChatModal';
import { AuthScreen } from './components/auth/AuthScreen';

import { EvolutionSettings } from './components/evolution/EvolutionSettings';
import { AttendantsManagement } from './components/attendants/AttendantsManagement';
import { QuickRepliesManager } from './components/quickReplies/QuickRepliesManager';
import { ContactsManager } from './components/contacts/ContactsManager';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { ConnectionsManagement } from './components/connections/ConnectionsManagement';
import { QueuesManagement } from './components/queues/QueuesManagement';

import {
  initialDepartments,
  initialAttendants,
  initialContacts,
  initialTickets,
  initialMessages,
  initialQuickResponses,
  initialEvolutionConfig,
  initialWebhookLogs,
  initialQueues,
  initialConnections,
  initialBots
} from './data/mockData';

import {
  Ticket,
  Message,
  Attendant,
  Department,
  Contact,
  QuickResponse,
  EvolutionConfig,
  WebhookLog,
  Priority,
  Role,
  AttendantStatus,
  Queue,
  WhatsAppConnection,
  BotFlow,
  ScheduledMessage,
  TicketReminder
} from './types';

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<NavTab>('chats');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('tick-1');
  const [showCustomerSidebar, setShowCustomerSidebar] = useState<boolean>(true);

  // Modals
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);

  // Main Data States
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [attendants, setAttendants] = useState<Attendant[]>(initialAttendants);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages);
  const [quickResponses, setQuickResponses] = useState<QuickResponse[]>(initialQuickResponses);
  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>(initialEvolutionConfig);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>(initialWebhookLogs);
  const [queues, setQueues] = useState<Queue[]>(initialQueues);
  const [connections, setConnections] = useState<WhatsAppConnection[]>(initialConnections);
  const [bots, setBots] = useState<BotFlow[]>(initialBots);

  // Connection Handlers
  const handleAddConnection = (conn: Omit<WhatsAppConnection, 'id' | 'updatedAt'>) => {
    const created: WhatsAppConnection = {
      ...conn,
      id: 'conn-' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    setConnections((prev) => [...prev, created]);
  };

  const handleUpdateConnection = (conn: WhatsAppConnection) => {
    setConnections((prev) => prev.map((c) => (c.id === conn.id ? conn : c)));
  };

  const handleDeleteConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleTestConnection = async (conn: WhatsAppConnection): Promise<boolean> => {
    try {
      const res = await fetch('/api/evolution/status?instance=' + encodeURIComponent(conn.instanceName));
      if (res.ok) {
        return true;
      }
    } catch {
      // ignore
    }
    return true; // Simulation success
  };

  // Queue Handlers
  const handleAddQueue = (q: Omit<Queue, 'id'>) => {
    const created: Queue = {
      ...q,
      id: 'queue-' + Date.now()
    };
    setQueues((prev) => [...prev, created]);
  };

  const handleUpdateQueue = (q: Queue) => {
    setQueues((prev) => prev.map((item) => (item.id === q.id ? q : item)));
  };

  const handleDeleteQueue = (id: string) => {
    setQueues((prev) => prev.filter((item) => item.id !== id));
  };

  // Scheduled Messages State (Feature #5)
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([
    {
      id: 'sched-1',
      ticketId: 'tick-1',
      content: 'Olá! Passando para confirmar se deu tudo certo com o seu pedido?',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ]);

  // Reminders / Follow-up State (Feature #5)
  const [reminders, setReminders] = useState<TicketReminder[]>([
    {
      id: 'rem-1',
      ticketId: 'tick-1',
      title: 'Ligar para confirmar o envio da proposta assinada',
      remindAt: new Date(Date.now() + 14400000).toISOString(),
      isCompleted: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const handleAddScheduledMessage = (newSched: ScheduledMessage) => {
    setScheduledMessages((prev) => [...prev, newSched]);
  };

  const handleCancelScheduledMessage = (schedId: string) => {
    setScheduledMessages((prev) =>
      prev.map((s) => (s.id === schedId ? { ...s, status: 'cancelled' } : s))
    );
  };

  const handleAddReminder = (newRem: TicketReminder) => {
    setReminders((prev) => [...prev, newRem]);
  };

  const handleToggleReminder = (remId: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === remId ? { ...r, isCompleted: !r.isCompleted } : r))
    );
  };

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Current Logged-in Attendant
  const [currentAttendant, setCurrentAttendant] = useState<Attendant>(initialAttendants[0]);

  // Restrict tabs for common attendants ('attendant')
  useEffect(() => {
    if (currentAttendant.role === 'attendant') {
      if (['connections', 'queues', 'evolution', 'attendants'].includes(activeTab)) {
        setActiveTab('chats');
      }
    }
  }, [currentAttendant.role, activeTab]);

  const handleLoginSuccess = (attendant: Attendant) => {
    setCurrentAttendant(attendant);
    setIsAuthenticated(true);
  };

  const handleRegisterUser = (newAttendantData: Omit<Attendant, 'id' | 'activeTicketsCount'>) => {
    const createdAttendant: Attendant = {
      ...newAttendantData,
      id: 'att-' + Date.now(),
      activeTicketsCount: 0
    };
    setAttendants((prev) => [createdAttendant, ...prev]);
    setCurrentAttendant(createdAttendant);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Selected Ticket Helper
  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || null;
  const activeMessages = selectedTicketId ? messages[selectedTicketId] || [] : [];

  // Total unread messages across tickets
  const unreadTotal = tickets.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
  const pendingTicketsCount = tickets.filter((t) => t.status === 'pending').length;

  // Handlers
  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    // Clear unread count for clicked ticket
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, unreadCount: 0 } : t))
    );
  };

  const handleSendMessage = async (
    text: string,
    isNote: boolean = false,
    type: 'text' | 'image' | 'audio' | 'document' = 'text'
  ) => {
    if (!selectedTicketId || !activeTicket) return;

    const newMsgId = 'msg-' + Date.now();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: newMsgId,
      ticketId: selectedTicketId,
      sender: 'attendant',
      senderName: currentAttendant.name,
      type: type,
      content: text,
      timestamp: currentTime,
      status: 'sent',
      isInternalNote: isNote,
      audioDuration: type === 'audio' ? '0:12' : undefined
    };

    // Update messages state
    setMessages((prev) => ({
      ...prev,
      [selectedTicketId]: [...(prev[selectedTicketId] || []), newMsg]
    }));

    // Update ticket snippet & status
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? {
              ...t,
              status: t.status === 'pending' ? 'in_progress' : t.status,
              assignedAttendantId: t.assignedAttendantId || currentAttendant.id,
              lastMessageSnippet: isNote ? `[Nota Interna] ${text}` : text,
              lastMessageTimestamp: currentTime,
              updatedAt: new Date().toISOString()
            }
          : t
      )
    );

    // Dispatch via Evolution API Proxy Endpoint in background
    if (!isNote) {
      try {
        fetch('/api/evolution/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiUrl: evolutionConfig.apiUrl,
            apiKey: evolutionConfig.apiKey,
            instanceName: evolutionConfig.instanceName,
            number: activeTicket.contact.phone,
            text: text
          })
        });
      } catch (e) {
        console.warn('API send fail:', e);
      }

      // Simulate customer auto-reply after 3 seconds for realistic demonstration
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const autoReplies = [
          'Perfeito! Muito obrigado pela atenção e pelo excelente atendimento.',
          'Entendido! Vou verificar e qualquer dúvida retorno por aqui.',
          'Ótimo! Obrigado pelas orientações.',
          'Anotado! Gostei muito da agilidade de vocês no WhatsApp.'
        ];
        const replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];

        const incomingMsg: Message = {
          id: 'msg-in-' + Date.now(),
          ticketId: selectedTicketId,
          sender: 'contact',
          type: 'text',
          content: replyText,
          timestamp: replyTime,
          status: 'delivered'
        };

        setMessages((prevMsgs) => ({
          ...prevMsgs,
          [selectedTicketId]: [...(prevMsgs[selectedTicketId] || []), incomingMsg]
        }));

        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            t.id === selectedTicketId
              ? {
                  ...t,
                  lastMessageSnippet: replyText,
                  lastMessageTimestamp: replyTime,
                  updatedAt: new Date().toISOString()
                }
              : t
          )
        );

        // Add webhook log simulation
        setWebhookLogs((prevLogs) => [
          {
            id: 'log-' + Date.now(),
            event: 'MESSAGES_UPSERT',
            timestamp: new Date().toISOString(),
            status: 'success',
            payloadSnippet: `{"from": "${activeTicket.contact.phone}", "message": "${replyText}"}`
          },
          ...prevLogs
        ]);
      }, 3500);
    }
  };

  const handleConfirmTransfer = (
    ticketId: string,
    departmentId: string,
    attendantId?: string,
    note?: string
  ) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              departmentId,
              assignedAttendantId: attendantId || undefined,
              status: attendantId ? 'in_progress' : 'pending',
              updatedAt: new Date().toISOString()
            }
          : t
      )
    );

    if (note) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const transferNoteMsg: Message = {
        id: 'msg-tr-' + Date.now(),
        ticketId,
        sender: 'system',
        type: 'note',
        content: `Transfereção de setor: ${note}`,
        timestamp: time,
        isInternalNote: true,
        senderName: currentAttendant.name
      };

      setMessages((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), transferNoteMsg]
      }));
    }
  };

  const handleConfirmClose = (ticketId: string, rating?: number, summary?: string) => {
    const targetTicket = tickets.find((t) => t.id === ticketId);

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'resolved',
              closedAt: new Date().toISOString(),
              rating
            }
          : t
      )
    );

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgs: Message[] = [];

    // 1. Send automatic completion farewell message if connection has it configured
    if (targetTicket) {
      const conn =
        connections.find((c) => c.id === targetTicket.connectionId) ||
        connections.find((c) => c.isDefault) ||
        connections[0];

      if (conn && conn.completionMessage) {
        newMsgs.push({
          id: 'msg-completion-' + Date.now(),
          ticketId,
          sender: 'bot',
          type: 'text',
          content: conn.completionMessage,
          timestamp: time,
          status: 'sent',
          senderName: 'Sistema WhatsApp Auto'
        });
      }
    }

    // 2. Internal summary note
    if (summary) {
      newMsgs.push({
        id: 'msg-cl-' + Date.now(),
        ticketId,
        sender: 'system',
        type: 'note',
        content: `Atendimento Finalizado. Resumo: ${summary}`,
        timestamp: time,
        isInternalNote: true,
        senderName: currentAttendant.name
      });
    }

    if (newMsgs.length > 0) {
      setMessages((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), ...newMsgs]
      }));
    }
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === updatedContact.id ? updatedContact : c))
    );
    setTickets((prev) =>
      prev.map((t) =>
        t.contactId === updatedContact.id ? { ...t, contact: updatedContact } : t
      )
    );
  };

  const handleCreateNewChat = (
    name: string,
    phone: string,
    departmentId: string,
    initialMessageText?: string,
    connectionId?: string
  ) => {
    // Check if contact already exists by phone
    const existingContact = contacts.find((c) => c.phone === phone);
    const contactToUse: Contact = existingContact || {
      id: 'cont-' + Date.now(),
      name,
      phone,
      tags: ['Novo Lead'],
      createdAt: new Date().toISOString(),
      lastContactedAt: new Date().toISOString()
    };

    const newTicketId = 'tick-' + Date.now();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTicket: Ticket = {
      id: newTicketId,
      contactId: contactToUse.id,
      contact: contactToUse,
      departmentId,
      connectionId: connectionId || connections[0]?.id,
      assignedAttendantId: currentAttendant.id,
      status: 'in_progress',
      priority: 'medium',
      tags: ['Atendimento'],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageSnippet: initialMessageText || 'Atendimento iniciado',
      lastMessageTimestamp: time
    };

    if (!existingContact) {
      setContacts((prev) => [contactToUse, ...prev]);
    }
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicketId);

    if (initialMessageText) {
      const firstMsg: Message = {
        id: 'msg-first-' + Date.now(),
        ticketId: newTicketId,
        sender: 'attendant',
        senderName: currentAttendant.name,
        type: 'text',
        content: initialMessageText,
        timestamp: time,
        status: 'sent'
      };
      setMessages((prev) => ({ ...prev, [newTicketId]: [firstMsg] }));
    } else {
      setMessages((prev) => ({ ...prev, [newTicketId]: [] }));
    }

    setSelectedTicketId(newTicketId);
    setActiveTab('chats');
  };

  const handleStartChatWithContact = (contact: Contact) => {
    // Check if open ticket exists
    const existing = tickets.find((t) => t.contactId === contact.id && t.status !== 'resolved');
    if (existing) {
      setSelectedTicketId(existing.id);
    } else {
      handleCreateNewChat(contact.name, contact.phone, departments[0]?.id || 'dept-vendas');
    }
    setActiveTab('chats');
  };

  const handleUpdatePriority = (ticketId: string, priority: Priority) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, priority } : t))
    );
  };

  const handleAddTag = (ticketId: string, tag: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId && !t.tags.includes(tag)
          ? { ...t, tags: [...t.tags, tag] }
          : t
      )
    );
  };

  const handleRemoveTag = (ticketId: string, tag: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, tags: t.tags.filter((item) => item !== tag) } : t
      )
    );
  };

  const handleAddAttendant = (newAtt: Omit<Attendant, 'id' | 'activeTicketsCount'>) => {
    const created: Attendant = {
      ...newAtt,
      id: 'att-' + Date.now(),
      activeTicketsCount: 0
    };
    setAttendants((prev) => [...prev, created]);
  };

  const handleUpdateAttendant = (updated: Attendant) => {
    setAttendants((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    // If updating current logged-in attendant, sync
    if (updated.id === currentAttendant.id) {
      setCurrentAttendant(updated);
    }
  };

  const handleDeleteAttendant = (id: string) => {
    setAttendants((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddQuickResponse = (qr: Omit<QuickResponse, 'id'>) => {
    const created: QuickResponse = {
      ...qr,
      id: 'qr-' + Date.now()
    };
    setQuickResponses((prev) => [...prev, created]);
  };

  const handleDeleteQuickResponse = (id: string) => {
    setQuickResponses((prev) => prev.filter((q) => q.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen
        attendants={attendants}
        departments={departments}
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans antialiased">
      {/* Top Header */}
      <Header
        currentAttendant={currentAttendant}
        attendants={attendants}
        onSelectAttendant={setCurrentAttendant}
        onUpdateAttendantStatus={(status) => {
          setCurrentAttendant((prev) => ({ ...prev, status }));
          setAttendants((prev) =>
            prev.map((a) => (a.id === currentAttendant.id ? { ...a, status } : a))
          );
        }}
        evolutionConfig={evolutionConfig}
        onNavigateToEvolution={() => setActiveTab('evolution')}
        unreadTotal={unreadTotal}
        onLogout={handleLogout}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <SidebarNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadCount={unreadTotal}
          pendingTicketsCount={pendingTicketsCount}
          onNewChat={() => setShowNewChatModal(true)}
          userRole={currentAttendant.role}
        />

        {/* View tab router */}
        {activeTab === 'chats' && (
          <main className="flex-1 flex overflow-hidden">
            {/* List of active tickets */}
            <ChatList
              tickets={tickets}
              departments={departments}
              attendants={attendants}
              queues={queues}
              connections={connections}
              currentAttendant={currentAttendant}
              selectedTicketId={selectedTicketId}
              onSelectTicket={handleSelectTicket}
            />

            {/* Main Active Chat Area */}
            {activeTicket ? (
              <ChatWindow
                ticket={activeTicket}
                messages={activeMessages}
                departments={departments}
                attendants={attendants}
                currentAttendant={currentAttendant}
                quickResponses={quickResponses}
                onSendMessage={handleSendMessage}
                onOpenTransferModal={() => setShowTransferModal(true)}
                onOpenCloseModal={() => setShowCloseModal(true)}
                onToggleCustomerSidebar={() => setShowCustomerSidebar(!showCustomerSidebar)}
                showCustomerSidebar={showCustomerSidebar}
              />
            ) : (
              <div className="flex-1 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                  Nenhuma conversa selecionada
                </h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  Selecione um chamado da lista ao lado para iniciar o atendimento ou crie um novo chamado via WhatsApp.
                </p>
              </div>
            )}

            {/* Right Customer Detail Drawer */}
            {activeTicket && showCustomerSidebar && (
              <CustomerSidebar
                ticket={activeTicket}
                allTickets={tickets}
                departments={departments}
                attendants={attendants}
                scheduledMessages={scheduledMessages}
                reminders={reminders}
                onUpdatePriority={handleUpdatePriority}
                onOpenTransferModal={() => setShowTransferModal(true)}
                onOpenCloseModal={() => setShowCloseModal(true)}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                onCloseSidebar={() => setShowCustomerSidebar(false)}
                onUpdateContact={handleUpdateContact}
                onAddScheduledMessage={handleAddScheduledMessage}
                onCancelScheduledMessage={handleCancelScheduledMessage}
                onAddReminder={handleAddReminder}
                onToggleReminder={handleToggleReminder}
              />
            )}
          </main>
        )}

        {activeTab === 'connections' && (
          <main className="flex-1 overflow-y-auto">
            <ConnectionsManagement
              connections={connections}
              queues={queues}
              bots={bots}
              onAddConnection={handleAddConnection}
              onUpdateConnection={handleUpdateConnection}
              onDeleteConnection={handleDeleteConnection}
              onTestConnection={handleTestConnection}
            />
          </main>
        )}

        {activeTab === 'queues' && (
          <main className="flex-1 overflow-y-auto">
            <QueuesManagement
              queues={queues}
              attendants={attendants}
              connections={connections}
              onAddQueue={handleAddQueue}
              onUpdateQueue={handleUpdateQueue}
              onDeleteQueue={handleDeleteQueue}
            />
          </main>
        )}

        {activeTab === 'contacts' && (
          <main className="flex-1 overflow-y-auto">
            <ContactsManager
              contacts={contacts}
              onStartChatWithContact={handleStartChatWithContact}
              onOpenNewChatModal={() => setShowNewChatModal(true)}
              onUpdateContact={handleUpdateContact}
            />
          </main>
        )}

        {activeTab === 'quick_replies' && (
          <main className="flex-1 overflow-y-auto">
            <QuickRepliesManager
              quickResponses={quickResponses}
              onAddQuickResponse={handleAddQuickResponse}
              onDeleteQuickResponse={handleDeleteQuickResponse}
            />
          </main>
        )}

        {activeTab === 'analytics' && (
          <main className="flex-1 overflow-y-auto">
            <AnalyticsDashboard
              tickets={tickets}
              attendants={attendants}
              departments={departments}
              connections={connections}
              queues={queues}
              currentAttendant={currentAttendant}
              onSelectTicket={handleSelectTicket}
              onNavigateToChats={() => setActiveTab('chats')}
            />
          </main>
        )}

        {activeTab === 'evolution' && (
          <main className="flex-1 overflow-y-auto">
            <EvolutionSettings
              config={evolutionConfig}
              logs={webhookLogs}
              onUpdateConfig={(newCfg) => setEvolutionConfig((prev) => ({ ...prev, ...newCfg }))}
            />
          </main>
        )}

        {activeTab === 'attendants' && (
          <main className="flex-1 overflow-y-auto">
            <AttendantsManagement
              attendants={attendants}
              departments={departments}
              connections={connections}
              queues={queues}
              onAddAttendant={handleAddAttendant}
              onUpdateAttendant={handleUpdateAttendant}
              onDeleteAttendant={handleDeleteAttendant}
            />
          </main>
        )}
      </div>

      {/* Modals */}
      {showTransferModal && activeTicket && (
        <TransferModal
          ticket={activeTicket}
          departments={departments}
          attendants={attendants}
          onConfirmTransfer={handleConfirmTransfer}
          onClose={() => setShowTransferModal(false)}
        />
      )}

      {showCloseModal && activeTicket && (
        <CloseTicketModal
          ticket={activeTicket}
          onConfirmClose={handleConfirmClose}
          onClose={() => setShowCloseModal(false)}
        />
      )}

      {showNewChatModal && (
        <NewChatModal
          contacts={contacts}
          departments={departments}
          onCreateChat={handleCreateNewChat}
          onClose={() => setShowNewChatModal(false)}
        />
      )}
    </div>
  );
}
