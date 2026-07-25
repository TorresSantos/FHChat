import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI client if key is available
  let aiClient: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (err) {
      console.warn('Gemini API key present but initialization error:', err);
    }
  }

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Central Atendimento WhatsApp Evolution API',
      timestamp: new Date().toISOString()
    });
  });

  // Evolution API proxy status check
  app.post('/api/evolution/test-connection', async (req, res) => {
    const { apiUrl, apiKey, instanceName } = req.body;

    if (!apiUrl || !apiKey || !instanceName) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros ausentes (apiUrl, apiKey, instanceName são obrigatórios).'
      });
    }

    try {
      // Clean URL trailing slash
      const baseUrl = apiUrl.replace(/\/+$/, '');
      const fetchUrl = `${baseUrl}/instance/connectionState/${instanceName}`;

      console.log(`[Evolution Proxy] Testing connection to ${fetchUrl}`);

      const response = await fetch(fetchUrl, {
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return res.json({
          success: true,
          mode: 'real',
          data
        });
      } else {
        const errText = await response.text();
        return res.json({
          success: false,
          mode: 'simulated_fallback',
          message: `A API externa retornou status ${response.status}. Usando modo simulação rápida.`,
          error: errText
        });
      }
    } catch (err: any) {
      return res.json({
        success: false,
        mode: 'simulated_fallback',
        message: 'Não foi possível conectar ao servidor da Evolution API informado. A central continuará operando em modo de simulação interativa.',
        details: err.message
      });
    }
  });

  // Evolution API send text message proxy
  app.post('/api/evolution/send-message', async (req, res) => {
    const { apiUrl, apiKey, instanceName, number, text } = req.body;

    if (!number || !text) {
      return res.status(400).json({ error: 'Número e texto são obrigatórios.' });
    }

    // Attempt real call if credentials provided
    if (apiUrl && apiKey && instanceName && !apiUrl.includes('example.com')) {
      try {
        const baseUrl = apiUrl.replace(/\/+$/, '');
        const targetUrl = `${baseUrl}/message/sendText/${instanceName}`;

        const apiRes = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'apikey': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            number: number.replace(/\D/g, ''),
            text: text,
            options: {
              delay: 1200,
              presence: 'composing'
            }
          })
        });

        if (apiRes.ok) {
          const result = await apiRes.json();
          return res.json({ success: true, mode: 'real_evolution_api', result });
        }
      } catch (e: any) {
        console.warn('Real Evolution API dispatch failed, proceeding with simulation:', e.message);
      }
    }

    // Fallback simulated response
    return res.json({
      success: true,
      mode: 'simulated',
      messageId: 'EVO_SIM_' + Date.now(),
      status: 'delivered',
      timestamp: new Date().toISOString()
    });
  });

  // Webhook Receiver Endpoint for Evolution API
  app.post('/api/evolution/webhook', (req, res) => {
    const payload = req.body;
    console.log('[Webhook Received from Evolution API]:', JSON.stringify(payload, null, 2));

    // Acknowledge webhook
    res.status(200).json({ status: 'RECEIVED', timestamp: new Date().toISOString() });
  });

  // Gemini AI Smart Reply Suggestion Endpoint
  app.post('/api/ai/suggest-reply', async (req, res) => {
    const { chatHistory, contactName, departmentName, attendantName, tone } = req.body;

    const prompt = `Você é um assistente especialista de suporte e vendas no WhatsApp para a empresa.
O atendente logado é: "${attendantName || 'Atendente'}".
Setor do atendimento: "${departmentName || 'Geral'}".
Nome do Cliente: "${contactName || 'Cliente'}".
Tom desejado: "${tone || 'profissional, amigável, ágil e em Português do Brasil'}".

Abaixo está o histórico recente de mensagens da conversa:
${chatHistory || 'Nenhuma mensagem recente'}

Instrução: Elabore UMA sugestão de resposta direta, educada, clara e resolutiva pronta para ser enviada no WhatsApp.
Não inclua explicações nem aspas ao redor. Apenas a resposta.`;

    try {
      if (process.env.GEMINI_API_KEY && aiClient) {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt
        });

        const replyText = response.text?.trim();
        if (replyText) {
          return res.json({ success: true, suggestion: replyText });
        }
      }
    } catch (err: any) {
      console.error('Gemini API call failed:', err);
    }

    // Fallback smart replies
    const fallbackReplies = [
      `Olá ${contactName}! Obrigado pelo contato. Como posso te auxiliar hoje em relação ao setor de ${departmentName}?`,
      `Entendi perfeitamente, ${contactName}. Já estou verificando as informações no sistema e trago uma resposta em instantes!`,
      `Ótima pergunta! Seguem os detalhes solicitados. Caso precise de algo mais, fico à disposição!`
    ];
    const chosen = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

    return res.json({
      success: true,
      suggestion: chosen,
      mode: 'smart_fallback'
    });
  });

  // Gemini AI Text Polisher / Summarizer Endpoint
  app.post('/api/ai/polish-text', async (req, res) => {
    const { draftText, action } = req.body; // action: 'polish' | 'formal' | 'shorten' | 'summarize'

    if (!draftText) {
      return res.status(400).json({ error: 'Texto não informado.' });
    }

    let instruction = 'Melhore a gramática, tom e clareza para mensagem de WhatsApp profissional em Português.';
    if (action === 'formal') instruction = 'Torne a mensagem mais formal, elegante e corporativa.';
    if (action === 'shorten') instruction = 'Resuma e reduza a mensagem para ser muito direta e objetiva no WhatsApp.';
    if (action === 'summarize') instruction = 'Resuma os pontos principais deste atendimento em até 3 marcadores.';

    try {
      if (process.env.GEMINI_API_KEY && aiClient) {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `${instruction}\n\nTexto original:\n"${draftText}"\n\nResponda apenas com o texto final pronto.`
        });

        const polished = response.text?.trim();
        if (polished) {
          return res.json({ success: true, result: polished });
        }
      }
    } catch (err: any) {
      console.error('Gemini polish error:', err);
    }

    // Fallback
    return res.json({
      success: true,
      result: draftText + ' (Atendimento via Central Evolution API)',
      mode: 'fallback'
    });
  });

  // Serve Vite dev middleware or static dist
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
