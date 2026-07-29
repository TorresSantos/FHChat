import { Contact, Ticket, Department, Queue, Attendant, WhatsAppConnection, QuickReply } from '../types';

export const initialDepartments: Department[] = [
  { id: 'dept-vendas', name: 'Comercial & Vendas', color: 'emerald', description: 'Atendimento de novos clientes e cotações' },
  { id: 'dept-suporte', name: 'Suporte Técnico', color: 'blue', description: 'Resolução de dúvidas e suporte operacional' },
  { id: 'dept-financeiro', name: 'Financeiro', color: 'amber', description: 'Faturamento, 2ª via de PIX e boletos' },
  { id: 'dept-geral', name: 'Recepção / Geral', color: 'purple', description: 'Atendimento geral e triagem' }
];

export const initialQueues: Queue[] = [
  { id: 'queue-1', name: '1 - Vendas & Novos Clientes', departmentId: 'dept-vendas', color: 'emerald', botGreeting: 'Olá! Você está na fila de Vendas. Um consultor te atenderá em instantes.' },
  { id: 'queue-2', name: '2 - Suporte Técnico & Relatórios', departmentId: 'dept-suporte', color: 'blue', botGreeting: 'Olá! Você está na fila de Suporte Técnico.' },
  { id: 'queue-3', name: '3 - Financeiro & Segunda Via PIX', departmentId: 'dept-financeiro', color: 'amber', botGreeting: 'Olá! Você está na fila do Financeiro.' },
  { id: 'queue-4', name: '4 - Outros Assuntos / Recepção', departmentId: 'dept-geral', color: 'purple', botGreeting: 'Olá! Você está na recepção geral.' }
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
  }
];

export const initialContacts: Contact[] = [
  { id: 'cont-1', name: 'Marcos Oliveira', phone: '+5511998822331', email: 'marcos@empresa.com.br', tags: ['VIP', 'Cliente'], createdAt: new Date().toISOString() },
  { id: 'cont-2', name: 'Fernanda Lima', phone: '+5521988771122', email: 'fernanda@design.com', tags: ['Novo Contacto'], createdAt: new Date().toISOString() }
];

export const initialTickets: Ticket[] = [];

export const initialQuickReplies: QuickReply[] = [
  { id: 'qr-1', shortcut: '/boasvindas', title: 'Boas-Vindas Padrão', content: 'Olá! Seja bem-vindo ao suporte FHChat. Como posso te ajudar hoje?' },
  { id: 'qr-2', shortcut: '/pix', title: 'Chave PIX da Empresa', content: 'Nossa chave PIX CNPJ é: 12.345.678/0001-90 (FHChat Soluções Digitais).' }
];
