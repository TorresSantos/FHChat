import * as BaileysModule from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const makeWASocket = typeof BaileysModule.makeWASocket === 'function'
  ? BaileysModule.makeWASocket
  : (typeof (BaileysModule.default as any)?.makeWASocket === 'function'
    ? (BaileysModule.default as any).makeWASocket
    : (typeof (BaileysModule.default as any)?.default === 'function'
      ? (BaileysModule.default as any).default
      : (typeof BaileysModule.default === 'function' ? BaileysModule.default : BaileysModule)));
const useMultiFileAuthState = BaileysModule.useMultiFileAuthState || (BaileysModule.default as any)?.useMultiFileAuthState;
const DisconnectReason = BaileysModule.DisconnectReason || (BaileysModule.default as any)?.DisconnectReason;
const fetchLatestBaileysVersion = BaileysModule.fetchLatestBaileysVersion || (BaileysModule.default as any)?.fetchLatestBaileysVersion;
const delay = BaileysModule.delay || (BaileysModule.default as any)?.delay;
const Browsers = BaileysModule.Browsers || (BaileysModule.default as any)?.Browsers;

const toDataURL = QRCode.toDataURL || (QRCode as any).default?.toDataURL;

export interface BaileysMessage {
  id: string;
  fromMe: boolean;
  sender: string;
  senderName: string;
  phone: string;
  text: string;
  timestamp: string;
  avatarUrl?: string | null;
}

export interface BaileysSessionState {
  sessionId: string;
  status: 'disconnected' | 'connecting' | 'qrcode' | 'connected';
  qrCodeDataUrl: string | null;
  pairingCode: string | null;
  phone: string | null;
  userJid: string | null;
  userName: string | null;
  lastError: string | null;
  updatedAt: string;
}

class BaileysManager {
  private sockets: Map<string, any> = new Map();
  private states: Map<string, BaileysSessionState> = new Map();
  private messageLogs: Map<string, BaileysMessage[]> = new Map();
  private botSessions: Map<string, { lastSeen: number; queueOption?: number }> = new Map();
  private avatarCache: Map<string, string> = new Map();
  private listeners: Set<(sessionId: string, msg: BaileysMessage) => void> = new Set();

  private getAuthDir(sessionId: string): string {
    const authDir = path.join(process.cwd(), 'baileys_auth', sessionId);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    return authDir;
  }

  public getSessionState(sessionId: string): BaileysSessionState {
    return (
      this.states.get(sessionId) || {
        sessionId,
        status: 'disconnected',
        qrCodeDataUrl: null,
        pairingCode: null,
        phone: null,
        userJid: null,
        userName: null,
        lastError: null,
        updatedAt: new Date().toISOString()
      }
    );
  }

  public getMessages(sessionId: string): BaileysMessage[] {
    return this.messageLogs.get(sessionId) || [];
  }

  public async fetchProfilePicture(sock: any, jid: string): Promise<string | null> {
    if (!sock || !jid) return null;
    if (this.avatarCache.has(jid)) {
      return this.avatarCache.get(jid)!;
    }
    try {
      const url = await sock.profilePictureUrl(jid, 'image');
      if (url) {
        this.avatarCache.set(jid, url);
        return url;
      }
    } catch (e1) {
      try {
        const urlPrev = await sock.profilePictureUrl(jid, 'preview');
        if (urlPrev) {
          this.avatarCache.set(jid, urlPrev);
          return urlPrev;
        }
      } catch (e2) {
        // Restricted or no profile picture
      }
    }
    return null;
  }

  public async initSession(sessionId: string, options?: { phoneNumberForPairing?: string }) {
    console.log(`[Baileys Engine] Initializing session: ${sessionId}`);

    if (this.sockets.has(sessionId)) {
      const existingState = this.states.get(sessionId);
      if (existingState?.status === 'connected') {
        console.log(`[Baileys Engine] Session ${sessionId} already connected.`);
        return existingState;
      }
    }

    const state: BaileysSessionState = {
      sessionId,
      status: 'connecting',
      qrCodeDataUrl: null,
      pairingCode: null,
      phone: null,
      userJid: null,
      userName: null,
      lastError: null,
      updatedAt: new Date().toISOString()
    };
    this.states.set(sessionId, state);

    try {
      const authDir = this.getAuthDir(sessionId);
      const { state: authState, saveCreds } = await useMultiFileAuthState(authDir);
      
      const { version } = await Promise.race([
        fetchLatestBaileysVersion ? fetchLatestBaileysVersion() : Promise.reject(new Error('No fetch function')),
        new Promise<{ version: [number, number, number]; isLatest: boolean }>((_, reject) =>
          setTimeout(() => reject(new Error('Version fetch timeout')), 2000)
        )
      ]).catch(() => ({ version: [2, 3000, 1035194821] as [number, number, number], isLatest: true }));

      const logger = pino({ level: 'silent' });

      const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: authState,
        browser: Browsers ? Browsers.ubuntu('Chrome') : ['FHChat Central', 'Chrome', '120.0.0.0'],
        generateHighQualityLinkPreview: true,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000
      });

      this.sockets.set(sessionId, sock);

      sock.ev.on('creds.update', saveCreds);

      // Request Pairing Code if requested
      if (options?.phoneNumberForPairing && !sock.authState.creds.registered) {
        setTimeout(async () => {
          try {
            const cleanPhone = options.phoneNumberForPairing!.replace(/\D/g, '');
            if (cleanPhone) {
              const code = await sock.requestPairingCode(cleanPhone);
              state.pairingCode = code;
              state.updatedAt = new Date().toISOString();
              console.log(`[Baileys Engine] Generated Pairing Code for ${sessionId}: ${code}`);
            }
          } catch (pErr: any) {
            console.error(`[Baileys Engine] Pairing code request error:`, pErr.message);
          }
        }, 3000);
      }

      // Connection updates
      sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log(`[Baileys Engine] QR Code updated for ${sessionId}`);
          try {
            const qrDataUrl = await toDataURL(qr, { margin: 2, scale: 6 });
            state.status = 'qrcode';
            state.qrCodeDataUrl = qrDataUrl;
            state.updatedAt = new Date().toISOString();
          } catch (qrErr) {
            console.error('[Baileys Engine] QR conversion error:', qrErr);
          }
        }

        if (connection === 'connecting') {
          if (!state.qrCodeDataUrl) {
            state.status = 'connecting';
          }
          state.updatedAt = new Date().toISOString();
        }

        if (connection === 'open') {
          console.log(`[Baileys Engine] Connection OPEN for ${sessionId}!`);
          state.status = 'connected';
          state.qrCodeDataUrl = null;
          state.pairingCode = null;
          state.lastError = null;

          const userJid = sock.user?.id || '';
          const phoneNum = userJid.split(':')[0] || userJid.split('@')[0];

          state.userJid = userJid;
          state.phone = phoneNum ? `+${phoneNum}` : null;
          state.userName = sock.user?.name || 'WhatsApp Line';
          state.updatedAt = new Date().toISOString();
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason?.loggedOut;

          console.log(`[Baileys Engine] Connection closed on ${sessionId}. StatusCode: ${statusCode}. Reconnect: ${shouldReconnect}`);

          if (statusCode === DisconnectReason?.loggedOut) {
            state.status = 'disconnected';
            state.qrCodeDataUrl = null;
            state.pairingCode = null;
            state.lastError = 'Sessão desconectada do celular.';
            state.updatedAt = new Date().toISOString();

            try {
              fs.rmSync(authDir, { recursive: true, force: true });
            } catch (e) {
              console.warn('[Baileys Engine] Auth dir remove error:', e);
            }
            this.sockets.delete(sessionId);
          } else if (shouldReconnect) {
            state.status = 'connecting';
            state.updatedAt = new Date().toISOString();
            await delay(3000);
            this.initSession(sessionId, options);
          } else {
            state.status = 'disconnected';
            state.updatedAt = new Date().toISOString();
            this.sockets.delete(sessionId);
          }
        }
      });

      // Handle incoming messages
      sock.ev.on('messages.upsert', async (m: any) => {
        if (m.type !== 'notify') return;

        for (const msg of m.messages) {
          if (!msg.message) continue;

          const remoteJid = msg.key.remoteJid;
          if (!remoteJid || remoteJid.includes('@g.us')) continue; // skip group chats

          const fromMe = !!msg.key.fromMe;
          const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            '[Mídia / Anexo do WhatsApp]';

          const phone = remoteJid.split('@')[0].replace(/\D/g, '');
          const senderName = msg.pushName || `Cliente ${phone.slice(-4)}`;

          // Fetch real WhatsApp Profile Picture
          const avatarUrl = await this.fetchProfilePicture(sock, remoteJid);

          const messageObj: BaileysMessage = {
            id: msg.key.id || 'msg_' + Date.now(),
            fromMe,
            sender: remoteJid,
            senderName,
            phone: `+${phone}`,
            text,
            timestamp: new Date().toISOString(),
            avatarUrl
          };

          if (!this.messageLogs.has(sessionId)) {
            this.messageLogs.set(sessionId, []);
          }
          const logs = this.messageLogs.get(sessionId)!;
          logs.push(messageObj);
          if (logs.length > 300) logs.shift();

          console.log(`[Baileys Engine] Message on ${sessionId} from ${senderName} (+${phone}): "${text}" (Avatar: ${avatarUrl ? 'SI' : 'NO'})`);

          // Bot auto reply triage logic
          if (!fromMe && text) {
            const now = Date.now();
            const session = this.botSessions.get(phone) || { lastSeen: 0 };
            const cleanText = text.trim();

            let botReplyText: string | null = null;
            let selectedOption: number | null = null;

            if (cleanText === '1') {
              selectedOption = 1;
              botReplyText = '🟢 *FHChat Auto-Atendimento*\n\nVocê foi direcionado para a fila de *1 - Vendas & Novos Clientes*! Em instantes um dos nossos consultores irá te atender.';
            } else if (cleanText === '2') {
              selectedOption = 2;
              botReplyText = '🔵 *FHChat Auto-Atendimento*\n\nVocê está na fila de *2 - Suporte Técnico & Relatórios*! Por favor informe o número do contrato ou detalhes da dúvida.';
            } else if (cleanText === '3') {
              selectedOption = 3;
              botReplyText = '🟠 *FHChat Auto-Atendimento*\n\nVocê está na fila do *3 - Financeiro & Segunda Via PIX*! Em breve nosso setor de cobrança irá te auxiliar.';
            } else if (cleanText === '4') {
              selectedOption = 4;
              botReplyText = '🟣 *FHChat Auto-Atendimento*\n\nVocê está na fila de *4 - Outros Assuntos / Recepção*! Aguarde que já iremos te atender.';
            } else if (cleanText.toLowerCase() === 'menu' || cleanText.toLowerCase() === 'voltar' || now - session.lastSeen > 300000) {
              botReplyText = `🤖 *FHChat - Central de Atendimento*\n\nOlá *${senderName}*! Seja bem-vindo ao nosso atendimento.\nPor favor, escolha uma opção enviando apenas o número correspondente:\n\n1️⃣ Vendas & Novos Clientes\n2️⃣ Suporte Técnico & Relatórios\n3️⃣ Financeiro & Segunda Via PIX\n4️⃣ Outros Assuntos / Recepção\n\n_Digite a qualquer momento *menu* para ver este menu novamente._`;
            }

            if (selectedOption) {
              session.queueOption = selectedOption;
            }
            session.lastSeen = now;
            this.botSessions.set(phone, session);

            if (botReplyText) {
              setTimeout(async () => {
                try {
                  await sock.sendMessage(remoteJid, { text: botReplyText! });
                  const botMsg: BaileysMessage = {
                    id: 'bot_' + Date.now(),
                    fromMe: true,
                    sender: remoteJid,
                    senderName: 'Bot FHChat',
                    phone: `+${phone}`,
                    text: botReplyText!,
                    timestamp: new Date().toISOString(),
                    avatarUrl
                  };
                  logs.push(botMsg);
                } catch (bErr) {
                  console.error('[Baileys Engine] Failed to send bot reply:', bErr);
                }
              }, 1000);
            }
          }
        }
      });

      return state;
    } catch (err: any) {
      console.error(`[Baileys Engine] Failed to init session ${sessionId}:`, err);
      state.status = 'disconnected';
      state.lastError = err.message || 'Erro de inicialização do Baileys';
      state.updatedAt = new Date().toISOString();
      return state;
    }
  }

  public async sendMessage(sessionId: string, phoneOrJid: string, text: string) {
    const sock = this.sockets.get(sessionId);
    const state = this.states.get(sessionId);

    if (!sock || state?.status !== 'connected') {
      throw new Error(`Sessão Baileys "${sessionId}" não está conectada.`);
    }

    const cleanNumber = phoneOrJid.replace(/\D/g, '');
    const jid = phoneOrJid.includes('@') ? phoneOrJid : `${cleanNumber}@s.whatsapp.net`;

    console.log(`[Baileys Engine] Sending message via ${sessionId} to ${jid}: "${text}"`);

    const result = await sock.sendMessage(jid, { text });

    const avatarUrl = await this.fetchProfilePicture(sock, jid);

    const outgoingMsg: BaileysMessage = {
      id: result.key.id || 'out_' + Date.now(),
      fromMe: true,
      sender: jid,
      senderName: state.userName || 'Atendente',
      phone: `+${cleanNumber}`,
      text,
      timestamp: new Date().toISOString(),
      avatarUrl
    };

    if (!this.messageLogs.has(sessionId)) {
      this.messageLogs.set(sessionId, []);
    }
    this.messageLogs.get(sessionId)!.push(outgoingMsg);

    return result;
  }

  public async logoutSession(sessionId: string) {
    const sock = this.sockets.get(sessionId);
    if (sock) {
      try {
        await sock.logout();
      } catch (e) {
        console.warn(`[Baileys Engine] Logout error for ${sessionId}:`, e);
      }
      this.sockets.delete(sessionId);
    }

    const authDir = this.getAuthDir(sessionId);
    try {
      fs.rmSync(authDir, { recursive: true, force: true });
    } catch (e) {
      console.warn(`[Baileys Engine] Error deleting auth dir for ${sessionId}:`, e);
    }

    this.states.set(sessionId, {
      sessionId,
      status: 'disconnected',
      qrCodeDataUrl: null,
      pairingCode: null,
      phone: null,
      userJid: null,
      userName: null,
      lastError: 'Sessão encerrada.',
      updatedAt: new Date().toISOString()
    });
  }

  public getAllMessages(): { sessionId: string; messages: BaileysMessage[] }[] {
    const result: { sessionId: string; messages: BaileysMessage[] }[] = [];
    this.messageLogs.forEach((msgs, sessionId) => {
      result.push({ sessionId, messages: msgs });
    });
    return result;
  }
}

export const baileysManager = new BaileysManager();
