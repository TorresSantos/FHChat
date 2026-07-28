import React, { useState } from 'react';
import { PlusCircle, X, Phone, User, MessageSquare, Search, Smartphone, Layers, CheckCircle2, UserPlus } from 'lucide-react';
import { Department, Contact, WhatsAppConnection } from '../../types';

interface NewChatModalProps {
  contacts: Contact[];
  departments: Department[];
  connections: WhatsAppConnection[];
  onCreateChat: (
    name: string,
    phone: string,
    departmentId: string,
    initialMessage?: string,
    connectionId?: string
  ) => void;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  contacts,
  departments,
  connections,
  onCreateChat,
  onClose
}) => {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  
  // Existing contact search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // New contact fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Ticket config fields
  const [connectionId, setConnectionId] = useState<string>(
    connections.find((c) => c.isDefault)?.id || connections[0]?.id || 'conn-1'
  );
  const [departmentId, setDepartmentId] = useState<string>(
    departments[0]?.id || 'dept-vendas'
  );
  const [initialMessage, setInitialMessage] = useState('');

  // Filter contacts dynamically based on search query
  const filteredContacts = searchQuery.trim()
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          (c.cpfCnpj && c.cpfCnpj.includes(searchQuery))
      ).slice(0, 8)
    : contacts.slice(0, 5); // Show top 5 recent contacts when empty

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalName = '';
    let finalPhone = '';

    if (mode === 'existing') {
      if (!selectedContact) return;
      finalName = selectedContact.name;
      finalPhone = selectedContact.phone;
    } else {
      if (!name.trim() || !phone.trim()) return;
      finalName = name.trim();
      finalPhone = phone.trim();
    }

    onCreateChat(
      finalName,
      finalPhone,
      departmentId,
      initialMessage.trim() || undefined,
      connectionId
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl border border-emerald-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Iniciar Novo Atendimento
              </h3>
              <p className="text-xs text-gray-500">
                Envie mensagens ativas via WhatsApp API oficial / Evolution API.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Mode: Existing Contact vs New Contact */}
        <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'existing'
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Buscar Existente
          </button>
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'new'
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Novo Contato
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'existing' ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-emerald-500" />
                Pesquisar Contato (Nome ou Telefone):
              </label>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Digite para pesquisar entre os contatos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>

              {/* Matched Contacts List */}
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredContacts.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2 text-center">
                    Nenhum contato encontrado para "{searchQuery}".
                  </p>
                ) : (
                  filteredContacts.map((c) => {
                    const isSelected = selectedContact?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedContact(c)}
                        className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold'
                            : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60 hover:border-emerald-400/50 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          {c.avatar ? (
                            <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                              {c.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="leading-tight">{c.name}</p>
                            <span className="text-[10px] text-gray-400">{c.phone}</span>
                          </div>
                        </div>

                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Número WhatsApp (DDD + Número):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5511999998888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Connection / Number Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              Conexão / Número de WhatsApp de Saída:
            </label>
            <select
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.name} ({conn.phone || 'Instância Ativa'}) - {conn.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Department / Queue Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              Fila / Setor de Destino:
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
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
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              Primeira Mensagem a Enviar (Opcional):
            </label>
            <textarea
              rows={2}
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Ex: Olá! Seja bem-vindo ao nosso suporte. Como posso te ajudar hoje?"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mode === 'existing' && !selectedContact}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Abrir Conversa no WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

