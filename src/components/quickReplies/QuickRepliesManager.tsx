import React, { useState } from 'react';
import { Zap, Plus, Trash2, Edit3 } from 'lucide-react';
import { QuickReply } from '../../types';

interface QuickRepliesManagerProps {
  quickReplies: QuickReply[];
  onAddQuickReply: (qr: QuickReply) => void;
  onDeleteQuickReply: (id: string) => void;
}

export const QuickRepliesManager: React.FC<QuickRepliesManagerProps> = ({ quickReplies, onAddQuickReply, onDeleteQuickReply }) => {
  const [shortcut, setShortcut] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcut || !content) return;

    onAddQuickReply({
      id: 'qr-' + Date.now(),
      shortcut: shortcut.startsWith('/') ? shortcut : '/' + shortcut,
      title: title || shortcut,
      content
    });

    setIsModalOpen(false);
    setShortcut('');
    setTitle('');
    setContent('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Respostas Rápidas &amp; Atalhos
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Atalhos de texto iniciados por / para agilizar as respostas dos atendentes no chat.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-900/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Resposta Rápida
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickReplies.map((qr) => (
            <div key={qr.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  {qr.shortcut}
                </span>
                <button onClick={() => onDeleteQuickReply(qr.id)} className="text-gray-500 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-sm text-gray-200">{qr.title}</h3>
              <p className="text-xs text-gray-400 bg-gray-950 p-3 rounded-xl border border-gray-800 whitespace-pre-wrap">
                {qr.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              Nova Resposta Rápida
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Atalho (Ex: /pix ou /boasvindas)</label>
                <input
                  type="text"
                  required
                  placeholder="/pix"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Título Explicativo</label>
                <input
                  type="text"
                  placeholder="Chave PIX da Empresa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Conteúdo da Mensagem</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Olá! Nossa chave PIX é..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl transition-all border border-gray-700 cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-md shadow-amber-900/40 cursor-pointer text-xs"
              >
                Salvar Atalho
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
