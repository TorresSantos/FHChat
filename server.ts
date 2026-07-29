import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { baileysManager } from './server/baileys.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- BAILEYS ENGINE API ROUTES ---
  app.post('/api/baileys/connect', async (req, res) => {
    const { sessionId, phoneNumberForPairing } = req.body;
    const sessionName = sessionId || 'default_baileys';

    try {
      const state = await baileysManager.initSession(sessionName, { phoneNumberForPairing });
      return res.json({ success: true, state });
    } catch (err: any) {
      console.error('[Baileys Endpoint] Connect error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/baileys/status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const state = baileysManager.getSessionState(sessionId);
    return res.json({ success: true, state });
  });

  app.post('/api/baileys/send-message', async (req, res) => {
    const { sessionId, number, text } = req.body;
    const sessionName = sessionId || 'default_baileys';

    if (!number || !text) {
      return res.status(400).json({ success: false, message: 'Número e texto são obrigatórios.' });
    }

    try {
      const result = await baileysManager.sendMessage(sessionName, number, text);
      return res.json({ success: true, result });
    } catch (err: any) {
      console.error('[Baileys Endpoint] Send message error:', err.message);
      return res.status(500).json({
        success: false,
        message: err.message || 'Erro ao enviar mensagem via Baileys'
      });
    }
  });

  app.post('/api/baileys/disconnect', async (req, res) => {
    const { sessionId } = req.body;
    const sessionName = sessionId || 'default_baileys';

    try {
      await baileysManager.logoutSession(sessionName);
      return res.json({ success: true, message: `Sessão ${sessionName} desconectada.` });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/baileys/all-messages', (req, res) => {
    const all = baileysManager.getAllMessages();
    return res.json({ success: true, sessions: all });
  });

  // Evolution API Proxy
  app.post('/api/evolution/send-message', async (req, res) => {
    const { apiUrl, apiKey, instanceName, number, text } = req.body;
    if (!apiUrl || !apiKey || !instanceName || !number || !text) {
      return res.status(400).json({ success: false, message: 'Parâmetros incompletos.' });
    }

    try {
      const cleanUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const endpoint = `${cleanUrl}/message/sendText/${instanceName}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey
        },
        body: JSON.stringify({
          number: number.replace(/\D/g, ''),
          text: text
        })
      });

      const data = await response.json();
      return res.json({ success: response.ok, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Gemini AI suggestion
  app.post('/api/ai/suggest-reply', async (req, res) => {
    const { chatHistory, contactName, departmentName, attendantName, tone } = req.body;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          success: true,
          suggestion: `Olá ${contactName || ''}! Como posso te ajudar hoje com o seu atendimento?`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é um assistente de atendimento no WhatsApp para a empresa.
Atendente: ${attendantName || 'Atendente'}
Cliente: ${contactName || 'Cliente'}
Setor: ${departmentName || 'Atendimento'}
Tom desejado: ${tone || 'Profissional e cordial'}

Histórico recente:
${JSON.stringify(chatHistory || [], null, 2)}

Por favor, elabore uma sugestão de resposta direta, educada, clara e pronta para ser enviada pelo WhatsApp. Responda APENAS com o texto da mensagem.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const reply = response.text?.trim() || 'Olá! Como posso te ajudar hoje?';
      return res.json({ success: true, suggestion: reply });
    } catch (err: any) {
      return res.json({
        success: true,
        suggestion: `Olá ${contactName || ''}! Como posso te auxiliar neste momento?`
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FHChat Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
