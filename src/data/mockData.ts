import { Contact, Ticket, Department, Queue, Attendant, WhatsAppConnection, QuickReply } from '../types';

export const initialDepartments: Department[] = [
  { id: 'dept-vendas', name: 'Comercial & Vendas', color: 'emerald', description: 'Atendimento de novos clientes e cotações' },
  { id: 'dept-suporte', name: 'Suporte Técnico', color: 'blue', description: 'Resolução de dúvidas e suporte operacional' },
  { id: 'dept-financeiro', name: 'Financeiro', color: 'amber', description: 'Faturamento, 2ª via de PIX e boletos' },
  { id: 'dept-geral', name: 'Recepção / Geral', color: 'purple', description: 'Atendimento geral e triagem' }
];

export const initialQueues: Queue[] = [
  {
    id: 'queue-1',
    name: '1 - Vendas & Novos Clientes',
    departmentId: 'dept-vendas',
    color: 'emerald',
    botGreeting: 'Olá! Você está na fila de Vendas. Um consultor te atenderá em instantes.',
    workingHoursEnabled: true,
    startTime: '08:00',
    endTime: '18:00',
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    outOfHoursMessage: 'Olá! Nosso setor de Vendas atende de Segunda a Sexta das 08:00 às 18:00. Sua mensagem já está salva em nossa fila e responderemos assim que abrirmos.',
    maxOutOfHoursMessages: 2,
    lunchBreakEnabled: true,
    lunchStartTime: '12:00',
    lunchEndTime: '13:30',
    lunchMessage: 'Estamos em horário de almoço das 12:00 às 13:30. Seu atendimento permanece em nossa fila e será respondido em breve!',
    maxLunchMessages: 1
  },
  {
    id: 'queue-2',
    name: '2 - Suporte Técnico & Relatórios',
    departmentId: 'dept-suporte',
    color: 'blue',
    botGreeting: 'Olá! Você está na fila de Suporte Técnico.',
    workingHoursEnabled: true,
    startTime: '08:00',
    endTime: '20:00',
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    outOfHoursMessage: 'Nosso suporte funciona das 08:00 às 20:00 de Seg a Sáb. Sua solicitação já foi registrada na fila.',
    maxOutOfHoursMessages: 2,
    lunchBreakEnabled: true,
    lunchStartTime: '12:30',
    lunchEndTime: '13:30',
    lunchMessage: 'Equipe de suporte em intervalo de almoço das 12:30 às 13:30. Aguarde na fila.',
    maxLunchMessages: 1
  },
  {
    id: 'queue-3',
    name: '3 - Financeiro & Segunda Via PIX',
    departmentId: 'dept-financeiro',
    color: 'amber',
    botGreeting: 'Olá! Você está na fila do Financeiro.',
    workingHoursEnabled: true,
    startTime: '09:00',
    endTime: '17:00',
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    outOfHoursMessage: 'Setor financeiro fechado no momento. Atendimento de Seg a Sex das 09:00 às 17:00. O atendimento continuará registrado na fila.',
    maxOutOfHoursMessages: 1,
    lunchBreakEnabled: true,
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    lunchMessage: 'Setor financeiro em horário de almoço (12h às 13h). Permanecemos com seu chamado na fila.',
    maxLunchMessages: 1
  },
  {
    id: 'queue-4',
    name: '4 - Outros Assuntos / Recepção',
    departmentId: 'dept-geral',
    color: 'purple',
    botGreeting: 'Olá! Você está na recepção geral.',
    workingHoursEnabled: false,
    outOfHoursMessage: 'Atendimento recepcional fora de expediente.',
    maxOutOfHoursMessages: 1,
    lunchBreakEnabled: false
  }
];

export const initialAttendants: Attendant[] = [
  { id: 'att-1', name: 'Henrique Torres', email: 'torres@fhchat.com', role: 'admin', departmentIds: ['dept-vendas', 'dept-suporte', 'dept-financeiro', 'dept-geral'], status: 'online', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'att-2', name: 'Juliana Silva', email: 'juliana@fhchat.com', role: 'supervisor', departmentIds: ['dept-vendas'], status: 'online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'att-3', name: 'Carlos Andrade', email: 'carlos@fhchat.com', role: 'agent', departmentIds: ['dept-suporte'], status: 'busy', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' }
];

export const initialConnections: WhatsAppConnection[] = [
  {
    id: 'conn-baileys-main',
    name: 'Linha Principal WhatsApp (Baileys WS)',
    phone: '+559984355221',
    status: 'connected',
    provider: 'baileys',
    baileysSessionId: 'baileys_session_4',
    departmentIds: ['dept-vendas', 'dept-suporte', 'dept-financeiro', 'dept-geral'],
    queueIds: ['queue-1', 'queue-2', 'queue-3', 'queue-4'],
    isDefault: true,
    botActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'conn-vendas',
    name: 'Linha Secundária - Vendas SP',
    phone: '+5511987654321',
    status: 'connected',
    provider: 'evolution',
    departmentIds: ['dept-vendas'],
    queueIds: ['queue-1'],
    isDefault: false,
    botActive: true,
    updatedAt: new Date().toISOString()
  }
];

export const initialContacts: Contact[] = [
  {
    id: 'cont-1',
    name: 'Marcos Oliveira',
    pushName: 'Marcos WhatsApp Business',
    phone: '+5511998822331',
    email: 'marcos@empresa.com.br',
    jid: '5511998822331@s.whatsapp.net',
    lid: '109823471823901@lid',
    tags: ['VIP', 'Cliente'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'cont-2',
    name: 'Fernanda Lima',
    pushName: 'Fer Lima Design',
    phone: '+5521988771122',
    email: 'fernanda@design.com',
    jid: '5521988771122@s.whatsapp.net',
    lid: '284719283748291@lid',
    tags: ['Novo Contato'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'cont-3',
    name: 'Roberto Souza',
    pushName: 'Roberto TI Tech',
    phone: '+5531991234567',
    email: 'roberto@techsol.com',
    jid: '5531991234567@s.whatsapp.net',
    lid: '394810293847561@lid',
    tags: ['Suporte', 'Pessoa Jurídica'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'cont-4',
    name: 'Camila Santos',
    pushName: 'Camila Financeiro',
    phone: '+5541988112233',
    email: 'camila@curitiba.com',
    jid: '5541988112233@s.whatsapp.net',
    lid: '485920193847562@lid',
    tags: ['Financeiro'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'cont-5',
    name: 'Lucas Martins',
    pushName: 'Lucas M.',
    phone: '+5519997766554',
    email: 'lucas@gmail.com',
    jid: '5519997766554@s.whatsapp.net',
    lid: '596031204958673@lid',
    tags: ['Lead Inbound'],
    createdAt: new Date().toISOString()
  }
];

export const initialTickets: Ticket[] = [
  {
    id: 'tick-101',
    protocol: '20260729-0101',
    contactId: 'cont-1',
    contact: initialContacts[0],
    departmentId: 'dept-vendas',
    queueId: 'queue-1',
    attendantId: 'att-1',
    status: 'in_progress',
    priority: 'high',
    connectionId: 'conn-baileys-main',
    unreadCount: 0,
    lastMessageSnippet: 'Gostaria de solicitar uma proposta comercial para 10 licenças.',
    lastMessageTimestamp: '09:15',
    createdAt: '2026-07-29T09:15:00.000Z',
    updatedAt: '2026-07-29T09:20:00.000Z'
  },
  {
    id: 'tick-102',
    protocol: '20260729-0102',
    contactId: 'cont-2',
    contact: initialContacts[1],
    departmentId: 'dept-vendas',
    queueId: 'queue-1',
    attendantId: 'att-2',
    status: 'resolved',
    priority: 'medium',
    connectionId: 'conn-vendas',
    unreadCount: 0,
    lastMessageSnippet: 'Obrigado! O orçamento foi aprovado com sucesso.',
    lastMessageTimestamp: '10:30',
    createdAt: '2026-07-29T10:00:00.000Z',
    updatedAt: '2026-07-29T10:30:00.000Z'
  },
  {
    id: 'tick-103',
    protocol: '20260729-0103',
    contactId: 'cont-3',
    contact: initialContacts[2],
    departmentId: 'dept-suporte',
    queueId: 'queue-2',
    attendantId: 'att-3',
    status: 'in_progress',
    priority: 'urgent',
    connectionId: 'conn-baileys-main',
    unreadCount: 1,
    lastMessageSnippet: 'Preciso de ajuda com a sincronização de contatos no WhatsApp.',
    lastMessageTimestamp: '11:45',
    createdAt: '2026-07-29T11:30:00.000Z',
    updatedAt: '2026-07-29T11:45:00.000Z'
  },
  {
    id: 'tick-104',
    protocol: '20260729-0104',
    contactId: 'cont-4',
    contact: initialContacts[3],
    departmentId: 'dept-financeiro',
    queueId: 'queue-3',
    attendantId: 'att-1',
    status: 'resolved',
    priority: 'medium',
    connectionId: 'conn-baileys-main',
    unreadCount: 0,
    lastMessageSnippet: 'Comprovante PIX recebido. Nota fiscal emitida.',
    lastMessageTimestamp: '14:20',
    createdAt: '2026-07-29T14:00:00.000Z',
    updatedAt: '2026-07-29T14:20:00.000Z'
  },
  {
    id: 'tick-105',
    protocol: '20260729-0105',
    contactId: 'cont-5',
    contact: initialContacts[4],
    departmentId: 'dept-geral',
    queueId: 'queue-4',
    attendantId: 'att-2',
    status: 'pending',
    priority: 'low',
    connectionId: 'conn-vendas',
    unreadCount: 2,
    lastMessageSnippet: 'Olá, qual o horário de funcionamento de vocês?',
    lastMessageTimestamp: '15:10',
    createdAt: '2026-07-29T15:10:00.000Z',
    updatedAt: '2026-07-29T15:10:00.000Z'
  },
  {
    id: 'tick-106',
    protocol: '20260728-0098',
    contactId: 'cont-1',
    contact: initialContacts[0],
    departmentId: 'dept-vendas',
    queueId: 'queue-1',
    attendantId: 'att-1',
    status: 'resolved',
    priority: 'medium',
    connectionId: 'conn-baileys-main',
    unreadCount: 0,
    lastMessageSnippet: 'Tudo certo, aguardo o envio do contrato amanhã.',
    lastMessageTimestamp: '16:40',
    createdAt: '2026-07-28T16:00:00.000Z',
    updatedAt: '2026-07-28T16:40:00.000Z'
  },
  {
    id: 'tick-107',
    protocol: '20260728-0099',
    contactId: 'cont-2',
    contact: initialContacts[1],
    departmentId: 'dept-suporte',
    queueId: 'queue-2',
    attendantId: 'att-2',
    status: 'resolved',
    priority: 'high',
    connectionId: 'conn-baileys-main',
    unreadCount: 0,
    lastMessageSnippet: 'Ajuste de porta concluído com sucesso.',
    lastMessageTimestamp: '17:15',
    createdAt: '2026-07-28T16:30:00.000Z',
    updatedAt: '2026-07-28T17:15:00.000Z'
  }
];

export const initialQuickReplies: QuickReply[] = [
  { id: 'qr-1', shortcut: '/boasvindas', title: 'Boas-Vindas Padrão', content: 'Olá! Seja bem-vindo ao suporte FHChat. Como posso te ajudar hoje?' },
  { id: 'qr-2', shortcut: '/pix', title: 'Chave PIX da Empresa', content: 'Nossa chave PIX CNPJ é: 12.345.678/0001-90 (FHChat Soluções Digitais).' }
];
