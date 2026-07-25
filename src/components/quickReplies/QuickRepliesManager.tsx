import React, { useState } from 'react';
import { Zap, Plus, Trash2, Edit, Sparkles, X, Copy } from 'lucide-react';
import { QuickResponse } from '../../types';

interface QuickRepliesManagerProps {
  quickResponses: QuickResponse[];
  onAddQuickResponse: (qr: Omit<QuickResponse, 'id'>) => void;
  onDeleteQuickResponse: (id: string) => void;
}

export const QuickRepliesManager: React.FC<QuickRepliesManagerProps> = ({
  quickResponses,
  onAddQuickResponse,
  onDeleteQuickResponse
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [shortcut, setShortcut] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Geral');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcut || !title || !content) return;

    let formattedShortcut = shortcut.trim();
    if (!formattedShortcut.startsWith('/')) {
      formattedShortcut = '/' + formattedShortcut;
    }

    onAddQuickResponse({
      shortcut: formattedShortcut,
      title,
      content,
      category
    });

    setShortcut('');
    setTitle('');
    setContent('');
    setShowAddModal(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full text-gray-900 dark:text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <Zap className="w-7 h-7 text-amber-500" /> Respostas Rápidas & Atalhos
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cadastre modelos de texto e atalhos com a barra <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono">/</code> para agilizar o atendimento dos operadores.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Criar Novo Atalho
        </button>
      </div>

      {/* Grid of Quick Responses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickResponses.map((qr) => (
          <div
            key={qr.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-xs space-y-3 relative hover:border-amber-500 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  {qr.shortcut}
                </span>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 font-semibold">
                  {qr.category}
                </span>
              </div>

              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                {qr.title}
              </h4>

              <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 whitespace-pre-wrap leading-relaxed">
                {qr.content}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400">
              <span>Dynamic: <code>&#123;&#123;atendente&#123;&#123;</code></span>
              <button
                onClick={() => onDeleteQuickResponse(qr.id)}
                className="text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Novo Atalho de Resposta
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Atalho (Começando com /):</label>
                <input
                  type="text"
                  required
                  placeholder="ex: /pix ou /horario"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs font-mono mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Título de Identificação:</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Chave PIX da Empresa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Categoria:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs mt-1"
                >
                  <option value="Vendas">Vendas</option>
                  <option value="Suporte">Suporte</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold">Texto do Modelo:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Use {{atendente}} ou {{cliente}} para substituir dinamicamente..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs mt-1 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Salvar Atalho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
