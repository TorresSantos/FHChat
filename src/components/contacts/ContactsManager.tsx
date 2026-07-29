import React, { useState } from 'react';
import { Users, Search, Plus, Edit3, Trash2, Phone, Mail, Tag, MessageSquare, X, Shield, FileText, List, Grid, Calendar, Sparkles } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Add Contact State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Edit Contact State
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.pushName && c.pushName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const rawPhoneDigits = phone.replace(/\D/g, '');
    const newContact: Contact = {
      id: 'cont-' + Date.now(),
      name,
      pushName: name + ' (WhatsApp)',
      phone,
      email,
      jid: rawPhoneDigits ? `${rawPhoneDigits}@s.whatsapp.net` : `${Date.now()}@s.whatsapp.net`,
      lid: `${Math.floor(Math.random() * 900000000000) + 100000000000}@lid`,
      tags: ['Novo Contato', 'WhatsApp'],
      createdAt: new Date().toISOString()
    };

    onAddContact(newContact);
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setEditName(contact.name);
    setEditPhone(contact.phone);
    setEditEmail(contact.email || '');
    setEditTags((contact.tags || []).join(', '));
    setEditNotes(contact.notes || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact || !editName || !editPhone) return;

    const updatedTags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updated: Contact = {
      ...editingContact,
      name: editName,
      phone: editPhone,
      email: editEmail,
      tags: updatedTags,
      notes: editNotes
    };

    onUpdateContact(updated);
    setIsEditModalOpen(false);
    setEditingContact(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Gestão de Contatos &amp; Clientes
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Base de contatos sincronizada em tempo real. Visualize em lista elegante ou grade.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="bg-gray-950 border border-gray-800 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Lista
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Grade
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Contato
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar cliente por nome, nome do WhatsApp, telefone ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>

        {/* LIST VIEW FORMAT */}
        {viewMode === 'list' ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-950 border-b border-gray-800 text-[11px] uppercase font-bold text-gray-400">
                  <tr>
                    <th className="py-3.5 px-4">Cliente / Nome</th>
                    <th className="py-3.5 px-4">WhatsApp / PushName</th>
                    <th className="py-3.5 px-4">Telefone &amp; E-mail</th>
                    <th className="py-3.5 px-4">Identificadores (JID/LID)</th>
                    <th className="py-3.5 px-4">Etiquetas / Tags</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 italic">
                        Nenhum contato encontrado para a busca informada.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((c) => {
                      const avatarUrl = c.avatar;
                      const initials = c.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      const defaultJid = c.jid || `${c.phone.replace(/\D/g, '')}@s.whatsapp.net`;
                      const defaultLid = c.lid || '1029384756123@lid';

                      return (
                        <tr key={c.id} className="hover:bg-gray-800/50 transition-colors">
                          {/* Name + Avatar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={c.name}
                                  className="w-9 h-9 rounded-full object-cover border border-emerald-500/50 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
                                  {initials}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-gray-100">{c.name}</div>
                                {c.notes && <p className="text-[10px] text-gray-400 truncate max-w-xs">{c.notes}</p>}
                              </div>
                            </div>
                          </td>

                          {/* WhatsApp PushName */}
                          <td className="py-3 px-4">
                            <div className="text-gray-300 font-medium">{c.pushName || c.name}</div>
                            <span className="text-[10px] text-emerald-400/90 font-semibold">WhatsApp Ativo</span>
                          </td>

                          {/* Phone & Email */}
                          <td className="py-3 px-4">
                            <div className="font-mono text-emerald-400 font-semibold">{c.phone}</div>
                            {c.email && <div className="text-[11px] text-gray-400 truncate max-w-[180px]">{c.email}</div>}
                          </td>

                          {/* JID / LID */}
                          <td className="py-3 px-4 font-mono text-[10px] text-gray-400 space-y-0.5">
                            <div className="truncate max-w-[150px]" title={defaultJid}>
                              <span className="text-gray-500">JID:</span> {defaultJid}
                            </div>
                            <div className="truncate max-w-[150px]" title={defaultLid}>
                              <span className="text-gray-500">LID:</span> {defaultLid}
                            </div>
                          </td>

                          {/* Tags */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(c.tags || ['WhatsApp']).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gray-950 text-gray-300 text-[10px] px-2 py-0.5 rounded-md border border-gray-800 font-medium"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => onStartChatWithContact(c)}
                                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Atender
                              </button>
                              <button
                                onClick={() => handleOpenEdit(c)}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-1.5 rounded-xl border border-gray-700 transition-all cursor-pointer flex items-center gap-1"
                                title="Editar Contato"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                              </button>
                              <button
                                onClick={() => onDeleteContact(c.id)}
                                className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                                title="Excluir Contato"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW FORMAT */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((c) => {
              const avatarUrl = c.avatar;
              const initials = c.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              const defaultJid = c.jid || `${c.phone.replace(/\D/g, '')}@s.whatsapp.net`;
              const defaultLid = c.lid || '1029384756123@lid';

              return (
                <div
                  key={c.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col justify-between hover:border-gray-700 transition-all space-y-3 shadow-lg"
                >
                  <div className="space-y-3">
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
                        <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                          <span className="text-emerald-400/90 font-semibold">WhatsApp:</span> {c.pushName || c.name}
                        </p>
                        <p className="text-xs text-emerald-400 font-mono font-medium mt-0.5">{c.phone}</p>
                        {c.email && <p className="text-[11px] text-gray-400 truncate mt-0.5">{c.email}</p>}
                      </div>
                    </div>

                    <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800/80 space-y-1 text-[10px] text-gray-400 font-mono">
                      <div className="flex justify-between truncate">
                        <span className="text-gray-500">JID:</span>
                        <span className="text-gray-300 truncate max-w-[170px]" title={defaultJid}>{defaultJid}</span>
                      </div>
                      <div className="flex justify-between truncate">
                        <span className="text-gray-500">LID:</span>
                        <span className="text-gray-300 truncate max-w-[170px]" title={defaultLid}>{defaultLid}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(c.tags || ['WhatsApp']).map((t, idx) => (
                        <span key={idx} className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-md border border-gray-700 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                    <button
                      onClick={() => onStartChatWithContact(c)}
                      className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium py-1.5 rounded-xl border border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Atender
                    </button>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-700 transition-all cursor-pointer flex items-center gap-1"
                      title="Editar Contato"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      Editar
                    </button>
                    <button
                      onClick={() => onDeleteContact(c.id)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                      title="Excluir Contato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Cadastrar Novo Contato
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Email</label>
                <input
                  type="email"
                  placeholder="carlos@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-800">
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
                Cadastrar Contato
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Contact Modal */}
      {isEditModalOpen && editingContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                Editar Contato &amp; Dados
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500">Nome no WhatsApp / PushName (Não editável)</label>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">{editingContact.pushName || editingContact.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800 text-[11px]">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500">JID do Cliente (Não editável)</label>
                    <p className="text-gray-300 font-mono text-[10px] truncate">
                      {editingContact.jid || `${editingContact.phone.replace(/\D/g, '')}@s.whatsapp.net`}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500">LID do Cliente (Não editável)</label>
                    <p className="text-gray-300 font-mono text-[10px] truncate">
                      {editingContact.lid || '1029384756123@lid'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Nome de Exibição do Cliente</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Telefone / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">E-mail</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="cliente@empresa.com"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="VIP, Suporte, Vendas"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Observações Internas</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Anotações privadas sobre o histórico do cliente..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl transition-all border border-gray-700 cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/40 cursor-pointer text-xs"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
