import React, { useState } from 'react';
import { Users, Search, Plus, Edit3, Trash2, Phone, Mail, Tag } from 'lucide-react';
import { Contact } from '../../types';

interface ContactsManagerProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onStartChatWithContact: (contact: Contact) => void;
}

export const ContactsManager: React.FC<ContactsManagerProps> = ({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onStartChatWithContact
}) => {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newContact: Contact = {
      id: 'cont-' + Date.now(),
      name,
      phone,
      email,
      tags: ['Novo Contato', 'WhatsApp'],
      createdAt: new Date().toISOString()
    };

    onAddContact(newContact);
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Gestão de Contatos &amp; Clientes
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Base de contatos sincronizada em tempo real com o WhatsApp.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Contato
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Contacts Table/Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((c) => {
            const avatarUrl = c.avatar;
            const initials = c.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={c.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col justify-between hover:border-gray-700 transition-all space-y-3"
              >
                <div className="flex items-start gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={c.name}
                      className="w-12 h-12 rounded-full object-cover border border-emerald-500/50 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-gray-100 truncate">{c.name}</h3>
                    <p className="text-xs text-emerald-400 font-mono font-medium">{c.phone}</p>
                    {c.email && <p className="text-[11px] text-gray-400 truncate">{c.email}</p>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(c.tags || ['WhatsApp']).map((t, idx) => (
                    <span key={idx} className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-md border border-gray-700">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                  <button
                    onClick={() => onStartChatWithContact(c)}
                    className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium py-1.5 rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    Iniciar Chat
                  </button>
                  <button
                    onClick={() => onDeleteContact(c.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Novo Contato
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Mendes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Telefone WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="+5511999887766"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Email (Opcional)</label>
                <input
                  type="email"
                  placeholder="carlos@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl transition-all border border-gray-700 cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/40 cursor-pointer text-xs"
              >
                Salvar Contato
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
