import React, { useState } from 'react';
import { User, Phone, Mail, Tag, FileText, Calendar, Edit3, Save } from 'lucide-react';
import { Contact, Ticket } from '../../types';

interface CustomerSidebarProps {
  ticket: Ticket;
  onUpdateContact: (contact: Contact) => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ ticket, onUpdateContact }) => {
  const contact = ticket.contact;
  const [notes, setNotes] = useState(contact.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const handleSaveNotes = () => {
    onUpdateContact({
      ...contact,
      notes
    });
    setIsEditingNotes(false);
  };

  const avatarUrl = contact.avatar;
  const contactInitials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full shrink-0 hidden xl:flex overflow-y-auto p-4 space-y-6">
      {/* Contact Profile Header */}
      <div className="text-center space-y-3 pb-4 border-b border-gray-800">
        <div className="relative inline-block">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={contact.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-xl mx-auto"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center font-bold text-white text-xl shadow-xl mx-auto">
              {contactInitials}
            </div>
          )}
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900" />
        </div>

        <div>
          <h3 className="font-bold text-base text-gray-100">{contact.name}</h3>
          <p className="text-xs font-mono text-emerald-400 mt-0.5">{contact.phone}</p>
        </div>
      </div>

      {/* Ticket Details */}
      <div className="space-y-3 bg-gray-950 p-3.5 rounded-2xl border border-gray-800 text-xs">
        <div className="font-bold text-gray-300 mb-1">Informações do Atendimento</div>
        <div className="flex justify-between text-gray-400">
          <span>Protocolo:</span>
          <span className="font-mono text-gray-200">{ticket.protocol}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Status:</span>
          <span className="text-emerald-400 font-semibold uppercase text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
            {ticket.status}
          </span>
        </div>
      </div>

      {/* Contact Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          Tags do Cliente
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(contact.tags || ['WhatsApp', 'Baileys']).map((t, idx) => (
            <span key={idx} className="bg-gray-800 text-gray-300 text-[10px] font-medium px-2.5 py-1 rounded-lg border border-gray-700">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Customer Notes */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between text-xs font-bold text-gray-300">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Observações Internas
          </div>
          <button
            onClick={() => (isEditingNotes ? handleSaveNotes() : setIsEditingNotes(true))}
            className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 cursor-pointer"
          >
            {isEditingNotes ? <Save className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
            {isEditingNotes ? 'Salvar' : 'Editar'}
          </button>
        </div>

        {isEditingNotes ? (
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
            placeholder="Digite anotações privadas sobre este cliente..."
          />
        ) : (
          <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-xs text-gray-400 min-h-[80px]">
            {contact.notes || 'Nenhuma observação registrada.'}
          </div>
        )}
      </div>
    </div>
  );
};
