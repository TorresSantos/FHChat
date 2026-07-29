export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  pushName?: string;
  jid?: string;
  lid?: string;
  avatar?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  protocol: string;
  contactId: string;
  contact: Contact;
  departmentId: string;
  queueId?: string;
  attendantId?: string;
  status: 'pending' | 'in_progress' | 'waiting' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  connectionId?: string;
  unreadCount?: number;
  lastMessageSnippet?: string;
  lastMessageTimestamp?: string;
  outOfHoursCount?: number;
  lunchCount?: number;
  invalidChoiceAttempts?: number;
  // Proteção de Senha/Cadeado por Protocolo
  isProtected?: boolean;
  protectPassword?: string;
  originalAttendantId?: string;
  originalAttendantName?: string;
  unlockedByAttendants?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  ticketId: string;
  sender: 'contact' | 'attendant' | 'system' | 'bot';
  senderName?: string;
  type: 'text' | 'image' | 'audio' | 'document' | 'video' | 'quick_reply';
  content: string;
  mediaUrl?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isInternalNote?: boolean;
}

export interface Department {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Queue {
  id: string;
  name: string;
  departmentId: string;
  color: string;
  description?: string;
  botGreeting?: string;
  // Horário de Funcionamento
  workingHoursEnabled?: boolean;
  startTime?: string; // ex: "08:00"
  endTime?: string; // ex: "18:00"
  workingDays?: string[]; // ex: ['mon', 'tue', 'wed', 'thu', 'fri']
  outOfHoursMessage?: string;
  maxOutOfHoursMessages?: number; // Limite de vezes que manda a mensagem de fora de horário se o cliente insistir (ex: 1, 2, 3...)
  // Horário de Almoço
  lunchBreakEnabled?: boolean;
  lunchStartTime?: string; // ex: "12:00"
  lunchEndTime?: string; // ex: "13:30"
  lunchMessage?: string;
  maxLunchMessages?: number;
}

export interface Attendant {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'supervisor' | 'agent';
  departmentIds: string[];
  queueIds?: string[];
  connectionIds?: string[];
  avatar?: string;
  status: 'online' | 'busy' | 'offline';
  maxConcurrentChats?: number;
}

export interface WhatsAppConnection {
  id: string;
  name: string;
  companyName?: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'qrcode' | 'connecting';
  provider: 'baileys' | 'evolution';
  baileysSessionId?: string;
  instanceName?: string;
  qrCodeUrl?: string;
  pairingCode?: string;
  usePairingCode?: boolean;
  departmentIds: string[];
  queueIds: string[];
  isDefault?: boolean;
  botActive?: boolean;
  // Regras de Transbordo de Fila e Inatividade
  maxInvalidAttempts?: number;
  fallbackQueueId?: string;
  inactivityTimeoutMinutes?: number;
  inactivityQueueId?: string;
  updatedAt: string;
}

export interface AuthorizationRequest {
  id: string;
  ticketId: string;
  protocol: string;
  contactName: string;
  requesterAttendantId: string;
  requesterAttendantName: string;
  targetAttendantId: string;
  targetAttendantName?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  contactName: string;
  contactPhone: string;
  attendantId?: string;
  attendantName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  sendWhatsAppReminder?: boolean;
  createdAt: string;
}

export interface QuickReply {
  id: string;
  shortcut: string;
  title: string;
  content: string;
  category?: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  timestamp: string;
  status: 'success' | 'failed';
  payloadSnippet: string;
}
