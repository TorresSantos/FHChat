import React, { useState } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Zap,
  Sparkles,
  Lock,
  X,
  Check,
  FileText,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { QuickResponse } from '../../types';

interface MessageInputProps {
  onSendMessage: (text: string, isNote: boolean, type?: 'text' | 'image' | 'audio' | 'document') => void;
  quickResponses: QuickResponse[];
  contactName: string;
  departmentName: string;
  attendantName: string;
  chatHistoryText: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  quickResponses,
  contactName,
  departmentName,
  attendantName,
  chatHistoryText
}) => {
  const [text, setText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const sampleEmojis = ['👍', '😊', '🙏', '✅', '👋', '⭐', '❤️', '📁', '📊', '🤝'];

  const handleSend = () => {
    if (!text.trim() && !isRecordingAudio) return;

    if (isRecordingAudio) {
      onSendMessage(`Áudio gravado pelo atendente (${audioTimer}s)`, isInternalNote, 'audio');
      setIsRecordingAudio(false);
      setAudioTimer(0);
      return;
    }

    onSendMessage(text, isInternalNote, 'text');
    setText('');
    setShowQuickReplies(false);
  };

  const handleSelectQuickReply = (qr: QuickResponse) => {
    // Replace placeholders
    let content = qr.content;
    content = content.replace(/\{\{atendente\}\}/g, attendantName);
    content = content.replace(/\{\{cliente\}\}/g, contactName);

    setText(content);
    setShowQuickReplies(false);
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    setAiSuggestion(null);

    try {
      const res = await fetch('/api/ai/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName,
          departmentName,
          attendantName,
          chatHistory: chatHistoryText
        })
      });

      const data = await res.json();
      if (data.success && data.suggestion) {
        setAiSuggestion(data.suggestion);
      } else {
        setAiSuggestion(`Olá ${contactName}! Obrigado por aguardar. Como posso te auxiliar com ${departmentName}?`);
      }
    } catch (err) {
      setAiSuggestion(`Olá ${contactName}! Como posso te ajudar com seu atendimento?`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setText(aiSuggestion);
      setAiSuggestion(null);
    }
  };

  const startAudioSimulation = () => {
    setIsRecordingAudio(true);
    setAudioTimer(1);
    const interval = setInterval(() => {
      setAudioTimer((prev) => prev + 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
    }, 30000);
  };

  return (
    <div className="relative p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 space-y-2">
      {/* AI Suggestion Box */}
      {aiSuggestion && (
        <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" /> Sugestão de Resposta IA (Gemini):
            </span>
            <button
              onClick={() => setAiSuggestion(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-gray-700 dark:text-gray-200 italic">"{aiSuggestion}"</p>

          <div className="flex justify-end space-x-2">
            <button
              onClick={applyAiSuggestion}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" /> Usar esta Resposta
            </button>
          </div>
        </div>
      )}

      {/* Internal Note Banner Warning */}
      {isInternalNote && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 text-xs">
          <span className="flex items-center gap-1.5 font-semibold">
            <Lock className="w-3.5 h-3.5 text-amber-600" /> Nota Interna (Visível apenas para a equipe do sistema)
          </span>
          <button
            onClick={() => setIsInternalNote(false)}
            className="text-amber-800 hover:text-amber-950 font-bold underline"
          >
            Cancelar Nota
          </button>
        </div>
      )}

      {/* Input Action Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {/* Quick Replies Toggle */}
          <button
            type="button"
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs font-medium"
            title="Respostas Rápidas (/atalhos)"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Respostas Rápidas</span>
          </button>

          {/* Internal Note Toggle */}
          <button
            type="button"
            onClick={() => setIsInternalNote(!isInternalNote)}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
              isInternalNote
                ? 'bg-amber-500 text-white'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Adicionar Nota Interna"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nota Interna</span>
          </button>

          {/* Gemini AI Assist Button */}
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={isGeneratingAI}
            className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 transition-colors flex items-center gap-1 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
            title="Gerar sugestão inteligente com IA Gemini"
          >
            {isGeneratingAI ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span className="hidden sm:inline">Assistente IA</span>
          </button>
        </div>

        {/* Emojis & Attachments */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Smile className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSendMessage('Imagem de produto/documento anexada', isInternalNote, 'image')}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Anexar Imagem ou Arquivo"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Popovers */}
      {showQuickReplies && (
        <div className="absolute bottom-16 left-3 w-80 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 z-50">
          <div className="flex justify-between items-center px-2 py-1 border-b border-gray-100 dark:border-gray-700 mb-1">
            <span className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Atalhos de Resposta
            </span>
            <button onClick={() => setShowQuickReplies(false)} className="text-gray-400">
              <X className="w-3 h-3" />
            </button>
          </div>
          {quickResponses.map((qr) => (
            <button
              key={qr.id}
              onClick={() => handleSelectQuickReply(qr)}
              className="w-full text-left p-2 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg text-xs space-y-0.5"
            >
              <div className="flex justify-between font-semibold text-emerald-700 dark:text-emerald-400">
                <span>{qr.title}</span>
                <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-600 dark:text-gray-300">
                  {qr.shortcut}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-300 line-clamp-1 text-[11px]">{qr.content}</p>
            </button>
          ))}
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-16 right-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-xl flex gap-2 z-50">
          {sampleEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Text / Audio Bar */}
      <div className="flex items-center space-x-2">
        {isRecordingAudio ? (
          <div className="flex-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 animate-pulse">
            <span className="flex items-center gap-2 font-semibold">
              <Mic className="w-4 h-4 text-rose-600 animate-bounce" /> Gravando áudio... {audioTimer}s
            </span>
            <button
              type="button"
              onClick={() => setIsRecordingAudio(false)}
              className="text-rose-600 underline font-semibold"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isInternalNote
                ? 'Escreva uma nota interna visível para a equipe...'
                : 'Digite sua mensagem para o cliente (Pressione Enter para enviar)...'
            }
            className={`flex-1 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 border focus:outline-none focus:ring-2 resize-none transition-colors ${
              isInternalNote
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 focus:ring-amber-500'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-emerald-500'
            }`}
          />
        )}

        {/* Audio Mic vs Send Button */}
        {!text.trim() && !isRecordingAudio ? (
          <button
            type="button"
            onClick={startAudioSimulation}
            className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-xl transition-colors shrink-0"
            title="Gravar Mensagem de Áudio"
          >
            <Mic className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            className={`p-3 text-white rounded-xl shadow-md transition-all shrink-0 ${
              isInternalNote
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
