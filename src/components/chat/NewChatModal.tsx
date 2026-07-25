import React, { useState } from 'react';
import { PlusCircle, X, Phone, User, Building, MessageSquare, Tag } from 'lucide-react';
import { Department, Contact } from '../../types';

interface NewChatModalProps {
  contacts: Contact[];
  departments: Department[];
  onCreateChat: (name: string, phone: string, departmentId: string, initialMessage?: string) => void;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  contacts,
  departments,
  onCreateChat,
  onClose
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string>('new');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-vendas');
  const [initialMessage, setInitialMessage] = useState('');

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    if (contactId !== 'new') {
      const c = contacts.find((item) => item.id === contactId);
      if (c) {
        setName(c.name);
        setPhone(c.phone);
      }
    } else {
      setName('');
      setPhone('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onCreateChat(name.trim(), phone.trim(), departmentId, initialMessage);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Iniciar Novo Atendimento WhatsApp
              </h3>
              <p className="text-xs text-gray-500">
                Envie uma mensagem direta via Evolution API para qualquer número.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Choose existing contact or new */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Selecionar Contato Existente ou Novo:
            </label>
            <select
              value={selectedContactId}
              onChange={(e) => handleSelectContact(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="new">-- Cadastrar Novo Contato --</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nome do Cliente:
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Lucas Gabriel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* WhatsApp Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Número de WhatsApp (Com DDD):
            </label>
            <input
              type="text"
              required
              placeholder="Ex: +55 11 99999-8888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Setor / Departamento Inicial:
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Message */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Primeira Mensagem a ser enviada (Opcional):
            </label>
            <textarea
              rows={2}
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Ex: Olá! Seja bem-vindo à nossa central de atendimento. Como posso te ajudar?"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30"
            >
              Abrir Conversa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
