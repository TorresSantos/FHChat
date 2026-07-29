import React, { useState, useRef } from 'react';
import { Send, Paperclip, Zap, Sparkles, Smile, Lock, Mic, Square, Trash2, X, FileText, Image as ImageIcon, Volume2 } from 'lucide-react';
import { QuickReply } from '../../types';

interface MessageInputProps {
  onSendMessage: (text: string, isNote?: boolean, attachments?: { name: string; url: string; type: string }[]) => void;
  quickReplies: QuickReply[];
  onOpenQuickReplies?: () => void;
  contactName?: string;
  departmentName?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  quickReplies,
  contactName,
  departmentName
}) => {
  const [text, setText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  
  // Attachments State
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; url: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && attachedFiles.length === 0) return;

    onSendMessage(text, isInternalNote, attachedFiles);
    setText('');
    setAttachedFiles([]);
    setIsInternalNote(false);
  };

  // Handle File Attachment Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            url,
            type: file.type.startsWith('image/')
              ? 'image'
              : file.type.startsWith('audio/')
              ? 'audio'
              : file.type.startsWith('video/')
              ? 'video'
              : 'document'
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Voice Recording Controls
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Não foi possível acessar o microfone para gravar áudio. Por favor, verifique a permissão do seu navegador.');
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const finishAndSendAudio = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);

      onSendMessage(`🎤 *Mensagem de Áudio* (${recordingSeconds}s)`, isInternalNote, [
        {
          name: `Audio_Voz_${Date.now()}.webm`,
          url: audioUrl,
          type: 'audio'
        }
      ]);

      setIsRecording(false);
      setRecordingSeconds(0);
      audioChunksRef.current = [];
    };

    mediaRecorderRef.current.stop();
    clearInterval(timerIntervalRef.current);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleGenerateAiReply = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contactName || 'Cliente',
          departmentName: departmentName || 'Atendimento'
        })
      });
      const data = await res.json();
      if (data.suggestion) {
        setText(data.suggestion);
      }
    } catch (e) {
      console.warn('AI reply fail:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-3 bg-gray-900 border-t border-gray-800 shrink-0 space-y-2">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
      />

      {/* Quick Replies Popup Menu */}
      {showQuickMenu && (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-2 mb-2 max-h-48 overflow-y-auto divide-y divide-gray-800 text-xs shadow-xl">
          <div className="font-semibold text-gray-400 p-1 text-[10px] uppercase">Respostas Rápidas</div>
          {quickReplies.map((qr) => (
            <button
              key={qr.id}
              onClick={() => {
                setText(qr.content);
                setShowQuickMenu(false);
              }}
              className="w-full text-left p-2 hover:bg-gray-800 rounded-lg text-gray-200 transition-all flex items-center justify-between"
            >
              <span className="font-semibold text-emerald-400">{qr.shortcut}</span>
              <span className="text-gray-400 truncate max-w-xs">{qr.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Attached Files Preview Bar */}
      {attachedFiles.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {attachedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-gray-200 shrink-0"
            >
              {file.type === 'image' ? (
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              ) : file.type === 'audio' ? (
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="truncate max-w-[120px] font-medium">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="text-gray-500 hover:text-rose-400 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mode Switch & AI Suggestion Bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsInternalNote(false)}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              !isInternalNote ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 bg-gray-800'
            }`}
          >
            Resposta WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setIsInternalNote(true)}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
              isInternalNote ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 bg-gray-800'
            }`}
          >
            <Lock className="w-3 h-3" />
            Nota Interna
          </button>
        </div>

        <button
          type="button"
          onClick={handleGenerateAiReply}
          disabled={isAiLoading}
          className="flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer text-[11px]"
        >
          <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isAiLoading ? 'animate-spin' : ''}`} />
          {isAiLoading ? 'IA Gerando...' : 'IA Sugerir Resposta'}
        </button>
      </div>

      {/* Recording Mode UI vs Standard Message Input */}
      {isRecording ? (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold text-xs text-rose-300 font-mono">
              Gravando Áudio {formatSeconds(recordingSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-900/30 rounded-xl transition-all cursor-pointer"
              title="Cancelar Gravação"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={finishAndSendAudio}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Enviar Áudio
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl p-2.5 flex items-center gap-2 focus-within:border-emerald-500 transition-all">
            {/* Quick Reply Button */}
            <button
              type="button"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              title="Respostas Rápidas"
              className="p-1 text-gray-400 hover:text-emerald-400 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
            </button>

            {/* File Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Anexar Arquivo ou Imagem"
              className="p-1 text-gray-400 hover:text-blue-400 transition-all cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={startRecording}
              title="Gravar Áudio de Voz"
              className="p-1 text-gray-400 hover:text-purple-400 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>

            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isInternalNote ? 'Escreva uma nota interna visível apenas para a equipe...' : 'Digite sua mensagem para o cliente...'}
              className="flex-1 bg-transparent border-none text-xs text-gray-100 placeholder-gray-500 focus:outline-none resize-none max-h-24"
            />
          </div>

          <button
            type="submit"
            className={`p-3 rounded-2xl text-white transition-all shadow-lg cursor-pointer ${
              isInternalNote
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};

