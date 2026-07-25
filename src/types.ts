export type Role = 'admin' | 'supervisor' | 'attendant';
export type AttendantStatus = 'online' | 'busy' | 'away' | 'offline';

export interface Attendant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  departmentId: string;
  status: AttendantStatus;
  activeTicketsCount: number;
  phone?: string;
  connectionIds?: string[];
  queueIds?: string[];
}

export interface Department {
  id: string;
  name: string;
  description: string;
  color: string;
  iconName: string;
}

export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'transferred';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  jid?: string;         // WhatsApp JID (ex: 5511988881234@s.whatsapp.net)
  lid?: string;         // WhatsApp LID (ex: 1234567890123456@lid - Novo ID de Privacidade Meta)
  pushName?: string;    // Nome de usuário no WhatsApp (PushName)
  email?: string;
  avatar?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  lastContactedAt: string;
  customFields?: Record<string, string>;
  company?: string;
}

export interface Queue {
  id: string;
  name: string;
  description: string;
  color: string;
  optionNumber: number;
  greetingMessage: string;
  attendantIds: string[];
  isDefault?: boolean;
  isActive: boolean;
}

export interface WhatsAppConnection {
  id: string;
  name: string;
  phone: string;
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  webhookUrl: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'refused';
  qrCodeUrl?: string;
  queueIds: string[];
  isDefault?: boolean;
  botEnabled: boolean;
  botId?: string;
  botGreetingMessage: string;
  transferKeyword?: string;
  outOfHoursMessage?: string;
  lastSyncTime?: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  contactId: string;
  contact: Contact;
  assignedAttendantId?: string;
  departmentId: string;
  connectionId?: string;
  queueId?: string;
  status: TicketStatus;
  priority: Priority;
  tags: string[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  rating?: number;
  lastMessageSnippet?: string;
  lastMessageTimestamp?: string;
}

export type MessageType = 'text' | 'image' | 'audio' | 'document' | 'location' | 'system' | 'note';
export type MessageSender = 'contact' | 'attendant' | 'bot' | 'system';

export interface Message {
  id: string;
  ticketId: string;
  sender: MessageSender;
  senderName?: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  fileSize?: string;
  audioDuration?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  isInternalNote?: boolean;
}

export interface QuickResponse {
  id: string;
  shortcut: string; // e.g. "/boas-vindas"
  title: string;
  content: string;
  category: string;
}

export interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  webhookUrl: string;
  autoReplyWithAI: boolean;
  isConnected: boolean;
  instanceStatus: 'open' | 'connecting' | 'close' | 'refused';
  qrCodeUrl?: string;
  phoneConnected?: string;
  lastSyncTime?: string;
  version?: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  timestamp: string;
  status: 'success' | 'error';
  payloadSnippet: string;
}

export type FlowNodeType =
  | 'start'
  | 'message'
  | 'menu'
  | 'transfer_queue'
  | 'ai_gemini'
  | 'condition_time'
  | 'media';

export interface FlowNodeOption {
  id: string;
  key: string;
  label: string;
  targetNodeId?: string;
  targetQueueId?: string;
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  title: string;
  position: { x: number; y: number };
  content?: string;
  connectionIds?: string[];
  targetQueueId?: string;
  options?: FlowNodeOption[];
  aiPrompt?: string;
  nextNodeId?: string;
}

export interface BotFlow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  connectionIds: string[];
  nodes: FlowNode[];
  createdAt: string;
  updatedAt: string;
}

