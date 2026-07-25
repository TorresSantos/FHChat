import {
  Attendant,
  Department,
  Contact,
  Ticket,
  Message,
  QuickResponse,
  EvolutionConfig,
  WebhookLog,
  Queue,
  WhatsAppConnection,
  BotFlow
} from '../types';

export const initialBots: BotFlow[] = [
  {
    id: 'bot-1',
    name: 'Bot Triagem Principal & Atribuição de Filas',
    description: 'Fluxo automatizado com menu interativo (1-Vendas, 2-Suporte, 3-Financeiro) e atalho para IA Gemini.',
    isActive: true,
    connectionIds: ['conn-1', 'conn-2'],
    nodes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bot-2',
    name: 'Bot Fora do Expediente (Horário Noturno)',
    description: 'Atende mensagens enviadas fora do horário comercial com respostas automáticas e agendamento.',
    isActive: true,
    connectionIds: ['conn-3'],
    nodes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialQueues: Queue[] = [
  {
    id: 'queue-1',
    name: '1 - Vendas & Novos Clientes',
    description: 'Fila destinada a propostas, orçamentos e novos cadastros.',
    color: '#10B981', // emerald
    optionNumber: 1,
    greetingMessage: 'Você foi direcionado para a fila de Vendas! Em instantes um dos nossos consultores irá te atender.',
    attendantIds: ['att-1', 'att-3'],
    isDefault: true,
    isActive: true
  },
  {
    id: 'queue-2',
    name: '2 - Suporte Técnico & Relatórios',
    description: 'Atendimento para dúvidas operacionais, sistemas e chamados.',
    color: '#3B82F6', // blue
    optionNumber: 2,
    greetingMessage: 'Você está na fila do Suporte Técnico! Por favor informe o número da sua conta ou tela do erro.',
    attendantIds: ['att-2'],
    isDefault: false,
    isActive: true
  },
  {
    id: 'queue-3',
    name: '3 - Financeiro & Segunda Via PIX',
    description: 'Fila para boletos, nota fiscal, reembolso e chave PIX.',
    color: '#F59E0B', // amber
    optionNumber: 3,
    greetingMessage: 'Fila do Financeiro selecionada! Aguarde que nosso setor de cobrança já vai te responder.',
    attendantIds: ['att-4'],
    isDefault: false,
    isActive: true
  },
  {
    id: 'queue-4',
    name: '4 - Outros Assuntos / Recepção',
    description: 'Triagem geral de mensagens e encaminhamento humano.',
    color: '#8B5CF6', // purple
    optionNumber: 4,
    greetingMessage: 'Aguarde um instante na fila Geral enquanto conectamos você ao próximo atendente disponível.',
    attendantIds: ['att-1', 'att-2', 'att-3', 'att-4'],
    isDefault: false,
    isActive: true
  }
];

export const initialConnections: WhatsAppConnection[] = [
  {
    id: 'conn-1',
    name: 'WhatsApp Principal - Comercial',
    phone: '+55 11 99887-6655',
    apiUrl: 'https://api.evolution-api.com',
    apiKey: 'EVOLUTION_SECRET_KEY_9921',
    instanceName: 'central-whatsapp-prod',
    webhookUrl: 'https://meudominio.com/api/evolution/webhook',
    status: 'connected',
    queueIds: ['queue-1', 'queue-2', 'queue-3', 'queue-4'],
    isDefault: true,
    botEnabled: true,
    botId: 'bot-1',
    botGreetingMessage: 'Olá! Seja bem-vindo à nossa Central Digital. Digite o número da opção desejada:\n\n1️⃣ Vendas & Novos Clientes\n2️⃣ Suporte Técnico\n3️⃣ Financeiro & Boletos\n4️⃣ Outros Assuntos',
    transferKeyword: 'voltar',
    outOfHoursMessage: 'Nosso atendimento funciona de Seg a Sex das 08h às 18h. Deixe sua mensagem!',
    lastSyncTime: '2026-07-25T08:10:00Z',
    updatedAt: '2026-07-25T08:10:00Z'
  },
  {
    id: 'conn-2',
    name: 'WhatsApp Suporte 24h & Plantão',
    phone: '+55 11 97700-1122',
    apiUrl: 'https://api.evolution-api.com',
    apiKey: 'EVOLUTION_SECRET_KEY_SUPORTE_30',
    instanceName: 'suporte-24h-inst',
    webhookUrl: 'https://meudominio.com/api/evolution/webhook-suporte',
    status: 'connected',
    queueIds: ['queue-2'],
    isDefault: false,
    botEnabled: true,
    botId: 'bot-1',
    botGreetingMessage: 'Bem-vindo ao Suporte Técnico Prioritário 24/7. Aguarde um instante!',
    transferKeyword: 'menu',
    lastSyncTime: '2026-07-25T08:12:00Z',
    updatedAt: '2026-07-25T08:12:00Z'
  },
  {
    id: 'conn-3',
    name: 'WhatsApp Filial Rio de Janeiro',
    phone: '+55 21 98822-3344',
    apiUrl: 'https://api.evolution-api.com',
    apiKey: 'EVOLUTION_SECRET_KEY_RJ_88',
    instanceName: 'filial-rj-inst',
    webhookUrl: 'https://meudominio.com/api/evolution/webhook-rj',
    status: 'disconnected',
    queueIds: ['queue-1', 'queue-4'],
    isDefault: false,
    botEnabled: true,
    botId: 'bot-2',
    botGreetingMessage: 'Olá! Atendimento Filial RJ. Escolha 1 para Vendas ou 4 para Geral.',
    lastSyncTime: '2026-07-24T18:00:00Z',
    updatedAt: '2026-07-25T07:00:00Z'
  }
];

export const initialDepartments: Department[] = [
  {
    id: 'dept-vendas',
    name: 'Vendas & Comercial',
    description: 'Atendimento a novos clientes, orçamentos e propostas comerciais',
    color: '#10B981', // emerald
    iconName: 'ShoppingBag'
  },
  {
    id: 'dept-suporte',
    name: 'Suporte Técnico',
    description: 'Dúvidas operacionais, bugs e suporte a produtos',
    color: '#3B82F6', // blue
    iconName: 'Headphones'
  },
  {
    id: 'dept-financeiro',
    name: 'Financeiro & Cobrança',
    description: 'Boletos, faturamento, notas fiscais e comprovantes',
    color: '#F59E0B', // amber
    iconName: 'CreditCard'
  },
  {
    id: 'dept-geral',
    name: 'Recepção / Geral',
    description: 'Triagem inicial de clientes e informações gerais',
    color: '#8B5CF6', // purple
    iconName: 'Inbox'
  }
];

export const initialAttendants: Attendant[] = [
  {
    id: 'att-1',
    name: 'Carlos Silva',
    email: 'carlos.silva@empresa.com.br',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    departmentId: 'dept-geral',
    status: 'online',
    activeTicketsCount: 2,
    phone: '+55 11 91111-2222',
    connectionIds: ['conn-1', 'conn-2', 'conn-3'],
    queueIds: ['queue-1', 'queue-2', 'queue-3', 'queue-4']
  },
  {
    id: 'att-2',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@empresa.com.br',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'attendant',
    departmentId: 'dept-suporte',
    status: 'online',
    activeTicketsCount: 3,
    phone: '+55 11 93333-4444',
    connectionIds: ['conn-1', 'conn-2'],
    queueIds: ['queue-2', 'queue-4']
  },
  {
    id: 'att-3',
    name: 'Juliana Santos',
    email: 'juliana.santos@empresa.com.br',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'attendant',
    departmentId: 'dept-vendas',
    status: 'busy',
    activeTicketsCount: 4,
    phone: '+55 11 95555-6666',
    connectionIds: ['conn-1', 'conn-3'],
    queueIds: ['queue-1', 'queue-4']
  },
  {
    id: 'att-4',
    name: 'Lucas Lima',
    email: 'lucas.lima@empresa.com.br',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'attendant',
    departmentId: 'dept-financeiro',
    status: 'online',
    activeTicketsCount: 1,
    phone: '+55 11 97777-8888',
    connectionIds: ['conn-1'],
    queueIds: ['queue-3', 'queue-4']
  }
];

export const initialContacts: Contact[] = [
  {
    id: 'cont-1',
    name: 'Mariana Costa',
    phone: '+55 11 98888-1234',
    jid: '5511988881234@s.whatsapp.net',
    lid: '1092837482930219@lid',
    pushName: 'Mariana Costa ✨',
    email: 'mariana.costa@techcorp.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    tags: ['Cliente VIP', 'Proposta Enviada'],
    notes: 'Interessada no plano empresarial para 15 usuários.',
    createdAt: '2026-06-10T10:00:00Z',
    lastContactedAt: '2026-07-25T07:45:00Z',
    company: 'TechCorp Brasil'
  },
  {
    id: 'cont-2',
    name: 'Roberto Ferreira',
    phone: '+55 21 97777-5678',
    jid: '5521977775678@s.whatsapp.net',
    lid: '2847192039485761@lid',
    pushName: 'Roberto Studio Design',
    email: 'roberto@designstudio.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    tags: ['Suporte', 'Urgente'],
    notes: 'Relatou dificuldade no envio de relatórios em PDF.',
    createdAt: '2026-07-01T14:30:00Z',
    lastContactedAt: '2026-07-25T07:30:00Z',
    company: 'Studio Ferreira Design'
  },
  {
    id: 'cont-3',
    name: 'Camila Ribeiro',
    phone: '+55 31 99999-4321',
    jid: '5531999994321@s.whatsapp.net',
    lid: '3948201928374652@lid',
    pushName: 'Camila R.',
    email: 'camila.ribeiro@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    tags: ['Boleto', 'Aguardando Pagamento'],
    notes: 'Solicitou atualização da data de vencimento da fatura.',
    createdAt: '2026-05-15T09:12:00Z',
    lastContactedAt: '2026-07-25T06:50:00Z'
  },
  {
    id: 'cont-4',
    name: 'Dr. Eduardo Martins',
    phone: '+55 41 96666-8888',
    jid: '5541966668888@s.whatsapp.net',
    lid: '4829103928174620@lid',
    pushName: 'Dr. Eduardo M.',
    email: 'eduardo@clinicaodontologica.com.br',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    tags: ['Novo Lead', 'Interesse Alto'],
    notes: 'Procura integração via Evolution API para agendamento automático.',
    createdAt: '2026-07-25T07:10:00Z',
    lastContactedAt: '2026-07-25T07:15:00Z',
    company: 'Clínica Martins'
  },
  {
    id: 'cont-5',
    name: 'Patrícia Lima',
    phone: '+55 19 98765-4321',
    jid: '5519987654321@s.whatsapp.net',
    lid: '5738291029384756@lid',
    pushName: 'Patricia Lima Express',
    email: 'patricia@logisticaexpress.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    tags: ['Dúvida Geral'],
    notes: 'Entrou em contato pelo WhatsApp para saber o horário de atendimento.',
    createdAt: '2026-07-25T07:40:00Z',
    lastContactedAt: '2026-07-25T07:40:00Z'
  }
];

export const initialTickets: Ticket[] = [
  {
    id: 'tick-1',
    contactId: 'cont-1',
    contact: initialContacts[0],
    assignedAttendantId: 'att-3', // Juliana
    departmentId: 'dept-vendas',
    connectionId: 'conn-1',
    queueId: 'queue-1',
    status: 'in_progress',
    priority: 'high',
    tags: ['VIP', 'Proposta'],
    unreadCount: 1,
    createdAt: '2026-07-25T07:10:00Z',
    updatedAt: '2026-07-25T07:45:00Z',
    lastMessageSnippet: 'Consegue me enviar a proposta em PDF com o desconto falado?',
    lastMessageTimestamp: '07:45'
  },
  {
    id: 'tick-2',
    contactId: 'cont-2',
    contact: initialContacts[1],
    assignedAttendantId: 'att-2', // Ana
    departmentId: 'dept-suporte',
    connectionId: 'conn-2',
    queueId: 'queue-2',
    status: 'in_progress',
    priority: 'urgent',
    tags: ['Urgente', 'Bug'],
    unreadCount: 2,
    createdAt: '2026-07-25T07:00:00Z',
    updatedAt: '2026-07-25T07:30:00Z',
    lastMessageSnippet: 'Ainda estou recebendo o código de erro 500 ao exportar o arquivo.',
    lastMessageTimestamp: '07:30'
  },
  {
    id: 'tick-3',
    contactId: 'cont-3',
    contact: initialContacts[2],
    assignedAttendantId: 'att-4', // Lucas
    departmentId: 'dept-financeiro',
    connectionId: 'conn-1',
    queueId: 'queue-3',
    status: 'in_progress',
    priority: 'medium',
    tags: ['Boleto'],
    unreadCount: 0,
    createdAt: '2026-07-25T06:40:00Z',
    updatedAt: '2026-07-25T06:50:00Z',
    lastMessageSnippet: 'Perfeito, acabei de pagar via código PIX! Muito obrigada.',
    lastMessageTimestamp: '06:50'
  },
  {
    id: 'tick-4',
    contactId: 'cont-4',
    contact: initialContacts[3],
    departmentId: 'dept-vendas',
    connectionId: 'conn-1',
    queueId: 'queue-1',
    status: 'pending', // Aguardando atendimento
    priority: 'high',
    tags: ['Lead'],
    unreadCount: 1,
    createdAt: '2026-07-25T07:15:00Z',
    updatedAt: '2026-07-25T07:15:00Z',
    lastMessageSnippet: 'Olá! Gostaria de saber como funciona o plano de múltiplos atendentes com a Evolution API.',
    lastMessageTimestamp: '07:15'
  },
  {
    id: 'tick-5',
    contactId: 'cont-5',
    contact: initialContacts[4],
    departmentId: 'dept-geral',
    connectionId: 'conn-3',
    queueId: 'queue-4',
    status: 'pending', // Aguardando atendimento
    priority: 'low',
    tags: ['Geral'],
    unreadCount: 1,
    createdAt: '2026-07-25T07:40:00Z',
    updatedAt: '2026-07-25T07:40:00Z',
    lastMessageSnippet: 'Bom dia! Qual o horário de suporte presencial de vocês hoje?',
    lastMessageTimestamp: '07:40'
  }
];

export const initialMessages: Record<string, Message[]> = {
  'tick-1': [
    {
      id: 'm-101',
      ticketId: 'tick-1',
      sender: 'contact',
      type: 'text',
      content: 'Olá Juliana, bom dia! Gostaria de alinhar os valores do plano Pro para a TechCorp.',
      timestamp: '07:10',
      status: 'read'
    },
    {
      id: 'm-102',
      ticketId: 'tick-1',
      sender: 'attendant',
      senderName: 'Juliana Santos',
      type: 'text',
      content: 'Bom dia Mariana! Claro, para 15 licenças conseguimos a condição especial de R$ 49/usuário com suporte prioritário.',
      timestamp: '07:15',
      status: 'read'
    },
    {
      id: 'm-103',
      ticketId: 'tick-1',
      sender: 'attendant',
      senderName: 'Juliana Santos',
      type: 'note',
      content: 'Cliente possui orçamento aprovado pela diretoria. Oferecer treinamento cortesia se fechar até sexta.',
      timestamp: '07:20',
      isInternalNote: true
    },
    {
      id: 'm-104',
      ticketId: 'tick-1',
      sender: 'contact',
      type: 'text',
      content: 'Consegue me enviar a proposta em PDF com o desconto falado?',
      timestamp: '07:45',
      status: 'read'
    }
  ],
  'tick-2': [
    {
      id: 'm-201',
      ticketId: 'tick-2',
      sender: 'contact',
      type: 'text',
      content: 'Socorro, meu sistema travou na hora de emitir o relatório mensal!',
      timestamp: '07:00',
      status: 'read'
    },
    {
      id: 'm-202',
      ticketId: 'tick-2',
      sender: 'attendant',
      senderName: 'Ana Oliveira',
      type: 'text',
      content: 'Olá Roberto! Fique tranquilo, sou a Ana do suporte. Qual o código exato da tela de erro?',
      timestamp: '07:05',
      status: 'read'
    },
    {
      id: 'm-203',
      ticketId: 'tick-2',
      sender: 'contact',
      type: 'audio',
      content: 'Mensagem de áudio recebida (0:18)',
      audioDuration: '0:18',
      mediaUrl: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
      timestamp: '07:18',
      status: 'read'
    },
    {
      id: 'm-204',
      ticketId: 'tick-2',
      sender: 'contact',
      type: 'text',
      content: 'Ainda estou recebendo o código de erro 500 ao exportar o arquivo.',
      timestamp: '07:30',
      status: 'delivered'
    }
  ],
  'tick-3': [
    {
      id: 'm-301',
      ticketId: 'tick-3',
      sender: 'contact',
      type: 'text',
      content: 'Bom dia! Preciso da chave PIX para quitar a fatura #9821.',
      timestamp: '06:40',
      status: 'read'
    },
    {
      id: 'm-302',
      ticketId: 'tick-3',
      sender: 'attendant',
      senderName: 'Lucas Lima',
      type: 'text',
      content: 'Bom dia Camila! Segue nossa chave PIX CNPJ:\n\n🔑 `12.345.678/0001-90`\n\nNome: Central Atendimento LTDA\nBanco: Itaú',
      timestamp: '06:45',
      status: 'read'
    },
    {
      id: 'm-303',
      ticketId: 'tick-3',
      sender: 'contact',
      type: 'text',
      content: 'Perfeito, acabei de pagar via código PIX! Muito obrigada.',
      timestamp: '06:50',
      status: 'read'
    }
  ],
  'tick-4': [
    {
      id: 'm-401',
      ticketId: 'tick-4',
      sender: 'contact',
      type: 'text',
      content: 'Olá! Gostaria de saber como funciona o plano de múltiplos atendentes com a Evolution API.',
      timestamp: '07:15',
      status: 'delivered'
    }
  ],
  'tick-5': [
    {
      id: 'm-501',
      ticketId: 'tick-5',
      sender: 'contact',
      type: 'text',
      content: 'Bom dia! Qual o horário de suporte presencial de vocês hoje?',
      timestamp: '07:40',
      status: 'delivered'
    }
  ]
};

export const initialQuickResponses: QuickResponse[] = [
  {
    id: 'qr-1',
    shortcut: '/boas-vendam',
    title: 'Boas-vindas Vendas',
    content: 'Olá! Seja bem-vindo à nossa central comercial. Meu nome é {{atendente}}. Como posso te ajudar a escolher o melhor plano hoje?',
    category: 'Vendas'
  },
  {
    id: 'qr-2',
    shortcut: '/pix',
    title: 'Dados Pagamento PIX',
    content: 'Aqui estão os dados para pagamento via PIX:\n\n🔑 Chave CNPJ: 12.345.678/0001-90\nFavorecido: Central de Atendimento S.A.\nBanco: Santander',
    category: 'Financeiro'
  },
  {
    id: 'qr-3',
    shortcut: '/suporte-acesso',
    title: 'Instruções de Acesso',
    content: 'Para redefinir sua senha, acesse nosso portal em https://app.empresa.com.br/recuperar e digite seu e-mail cadastrado.',
    category: 'Suporte'
  },
  {
    id: 'qr-4',
    shortcut: '/horario',
    title: 'Horário de Atendimento',
    content: 'Nosso horário de atendimento é de Segunda a Sexta, das 08:00 às 18:00, e aos Sábados das 09:00 às 13:00.',
    category: 'Geral'
  },
  {
    id: 'qr-5',
    shortcut: '/evolution-docs',
    title: 'Documentação Evolution API',
    content: 'Você pode consultar a documentação oficial da Evolution API em https://doc.evolution-api.com para configurar instâncias e webhooks.',
    category: 'Técnico'
  }
];

export const initialEvolutionConfig: EvolutionConfig = {
  apiUrl: 'https://api.evolution-api.com',
  apiKey: 'EVOLUTION_SECRET_KEY_9921',
  instanceName: 'central-whatsapp-prod',
  webhookUrl: 'https://meudominio.com/api/evolution/webhook',
  autoReplyWithAI: true,
  isConnected: true,
  instanceStatus: 'open',
  phoneConnected: '+55 11 99887-6655',
  lastSyncTime: '2026-07-25T07:50:00Z',
  version: '2.1.0'
};

export const initialWebhookLogs: WebhookLog[] = [
  {
    id: 'log-1',
    event: 'MESSAGES_UPSERT',
    timestamp: '2026-07-25T07:45:12Z',
    status: 'success',
    payloadSnippet: '{"from": "5511988881234@s.whatsapp.net", "message": {"conversation": "Consegue me enviar..."}}'
  },
  {
    id: 'log-2',
    event: 'CONNECTION_UPDATE',
    timestamp: '2026-07-25T07:40:00Z',
    status: 'success',
    payloadSnippet: '{"instance": "central-whatsapp-prod", "state": "open", "statusReason": 200}'
  },
  {
    id: 'log-3',
    event: 'SEND_MESSAGE',
    timestamp: '2026-07-25T07:35:20Z',
    status: 'success',
    payloadSnippet: '{"number": "5521977775678", "status": "PENDING"}'
  }
];
