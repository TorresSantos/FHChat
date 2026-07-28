import React, { useState } from 'react';
import { Users, Search, Phone, Mail, Building, Plus, Tag, MessageSquare, ExternalLink, Download, Edit3, ShieldCheck } from 'lucide-react';
import { Contact } from '../../types';
import { EditContactModal } from './EditContactModal';

interface ContactsManagerProps {
  contacts: Contact[];
  onStartChatWithContact: (contact: Contact) => void;
  onOpenNewChatModal: () => void;
  onUpdateContact?: (updated: Contact) => void;
}

export const ContactsManager: React.FC<ContactsManagerProps> = ({
  contacts,
  onStartChatWithContact,
  onOpenNewChatModal,
  onUpdateContact
}) => {
  const [search, setSearch] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.cpfCnpj && c.cpfCnpj.toLowerCase().includes(search.toLowerCase())) ||
    (c.pushName && c.pushName.toLowerCase().includes(search.toLowerCase())) ||
    (c.jid && c.jid.toLowerCase().includes(search.toLowerCase())) ||
    (c.lid && c.lid.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full text-gray-900 dark:text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" /> Base de Contatos / CRM WhatsApp
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Lista completa de contatos sincronizados com suporte total a JID, LID Meta e PushName (nome de usuário do WhatsApp).
          </p>
        </div>

        <button
          onClick={onOpenNewChatModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Novo Contato / Conversa
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone, JID, LID ou nome de usuário WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3.5">Cliente & User WhatsApp</th>
                <th className="p-3.5">Documento (CPF / CNPJ)</th>
                <th className="p-3.5">Telefone & JID</th>
                <th className="p-3.5">LID (Meta Privacy)</th>
                <th className="p-3.5">Empresa / Etiquetas</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredContacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="p-3.5 font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                    <img
                      src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={c.name}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold">{c.name}</p>
                      {c.pushName ? (
                        <span className="text-[10px] text-purple-400 font-medium block">
                          Original WA: <span className="text-gray-300 font-semibold">{c.pushName}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-normal block">{c.email || 'Sem e-mail'}</span>
                      )}
                    </div>
                  </td>

                  {/* CPF / CNPJ Column */}
                  <td className="p-3.5">
                    {c.cpfCnpj ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        {c.cpfCnpj}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[11px] italic">Não informado</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{c.phone}</p>
                    <p className="text-[10px] font-mono text-gray-400 truncate max-w-[170px]" title={c.jid || `${c.phone.replace(/\D/g, '')}@s.whatsapp.net`}>
                      JID: {c.jid || `${c.phone.replace(/\D/g, '')}@s.whatsapp.net`}
                    </p>
                  </td>
                  <td className="p-3.5">
                    {c.lid ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20" title={c.lid}>
                        {c.lid}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[10px] italic">Não gerado</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <p className="text-gray-400 text-[11px] mb-1">{c.company || 'Pessoa Física'}</p>
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <span key={t} className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => setEditingContact(c)}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                      title="Editar dados do cliente"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" /> Editar
                    </button>
                    <button
                      onClick={() => onStartChatWithContact(c)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Falar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Contact Modal */}
      {editingContact && (
        <EditContactModal
          contact={editingContact}
          onSave={(updated) => {
            if (onUpdateContact) {
              onUpdateContact(updated);
            }
            setEditingContact(null);
          }}
          onClose={() => setEditingContact(null)}
        />
      )}
    </div>
  );
};
