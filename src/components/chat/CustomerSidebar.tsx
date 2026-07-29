import React, { useState } from 'react';
import { User, Phone, Mail, Tag, FileText, Calendar, Edit3, Save, X, Settings, Image as ImageIcon, Volume2, Video, Paperclip, Download, ExternalLink } from 'lucide-react';
import { Contact, Ticket, Message } from '../../types';
import { WaveformAudioPlayer } from '../media/WaveformAudioPlayer';
import { ImageViewerModal } from '../media/ImageViewerModal';
import { ExportTicketModal } from './ExportTicketModal';

interface CustomerSidebarProps {
  ticket: Ticket;
  messages?: Message[];
  onUpdateContact: (contact: Contact) => void;
  imageRotations?: Record<string, number>;
  onRotationChange?: (url: string, angle: number) => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  ticket,
  messages = [],
  onUpdateContact,
  imageRotations = {},
  onRotationChange
}) => {
  const contact = ticket.contact;
  const [notes, setNotes] = useState(contact.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Active Tab for Exchanged Media
  const [mediaTab, setMediaTab] = useState<'images' | 'audios' | 'videos' | 'docs'>('images');

  // Lightbox Image State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Edit Contact Modal State
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [editName, setEditName] = useState(contact.name);
  const [editPhone, setEditPhone] = useState(contact.phone);
  const [editEmail, setEditEmail] = useState(contact.email || '');
  const [editTags, setEditTags] = useState((contact.tags || []).join(', '));

  // Extract all media messages
  const mediaMessages = messages.filter((m) => m.mediaUrl);
  const images = mediaMessages.filter((m) => m.type === 'image');
  const audios = mediaMessages.filter((m) => m.type === 'audio');
  const videos = mediaMessages.filter((m) => m.type === 'video');
  const docs = mediaMessages.filter((m) => m.type === 'document' || !['image', 'audio', 'video'].includes(m.type || ''));

  const handleSaveNotes = () => {
    onUpdateContact({
      ...contact,
      notes
    });
    setIsEditingNotes(false);
  };

  const handleOpenEditContact = () => {
    setEditName(contact.name);
    setEditPhone(contact.phone);
    setEditEmail(contact.email || '');
    setEditTags((contact.tags || []).join(', '));
    setIsEditContactModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onUpdateContact({
      ...contact,
      name: editName,
      phone: editPhone,
      email: editEmail,
      tags: updatedTags
    });
    setIsEditContactModalOpen(false);
  };

  const avatarUrl = contact.avatar;
  const contactInitials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full shrink-0 hidden xl:flex overflow-y-auto p-4 space-y-5">
      {/* Contact Profile Header */}
      <div className="text-center space-y-3 pb-4 border-b border-gray-800 relative">
        <div className="absolute right-0 top-0 flex items-center gap-1.5">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="text-xs bg-gray-800 hover:bg-emerald-950/60 text-emerald-400 border border-gray-700 hover:border-emerald-500/50 px-2 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer font-medium"
            title="Exportar Histórico do Atendimento"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            onClick={handleOpenEditContact}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer font-medium"
            title="Editar Dados do Contato"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar
          </button>
        </div>

        <div className="relative inline-block pt-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={contact.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-xl mx-auto"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center font-bold text-white text-lg shadow-xl mx-auto">
              {contactInitials}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-gray-900" />
        </div>

        <div>
          <h3 className="font-bold text-sm text-gray-100">{contact.name}</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            <span className="text-emerald-400/90 font-semibold">WhatsApp:</span> {contact.pushName || contact.name}
          </p>
          <p className="text-xs font-mono text-emerald-400 mt-0.5">{contact.phone}</p>
          {contact.email && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{contact.email}</p>}
        </div>
      </div>

      {/* Technical WhatsApp Identifiers (Read-Only) */}
      <div className="space-y-1.5 bg-gray-950 p-3 rounded-2xl border border-gray-800 text-[11px]">
        <div className="font-bold text-gray-300 mb-0.5 flex items-center justify-between">
          <span>Identificação WhatsApp</span>
          <span className="text-[9px] text-gray-500 font-mono">(Oficial)</span>
        </div>
        <div className="flex justify-between items-center text-gray-400">
          <span>JID:</span>
          <span className="font-mono text-gray-300 text-[10px] truncate max-w-[170px]" title={contact.jid || `${contact.phone.replace(/\D/g, '')}@s.whatsapp.net`}>
            {contact.jid || `${contact.phone.replace(/\D/g, '')}@s.whatsapp.net`}
          </span>
        </div>
        <div className="flex justify-between items-center text-gray-400">
          <span>LID:</span>
          <span className="font-mono text-gray-300 text-[10px] truncate max-w-[170px]" title={contact.lid || '1029384756123@lid'}>
            {contact.lid || '1029384756123@lid'}
          </span>
        </div>
      </div>

      {/* Exchanged Media Section */}
      <div className="space-y-2 bg-gray-950 p-3 rounded-2xl border border-gray-800 text-xs">
        <div className="flex items-center justify-between font-bold text-gray-200">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Paperclip className="w-3.5 h-3.5" />
            Mídias Trocadas ({mediaMessages.length})
          </span>
        </div>

        {/* Media Category Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-[10px] text-center font-semibold text-gray-400">
          <button
            onClick={() => setMediaTab('images')}
            className={`py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              mediaTab === 'images' ? 'bg-emerald-600 text-white' : 'hover:text-gray-200'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>({images.length})</span>
          </button>

          <button
            onClick={() => setMediaTab('audios')}
            className={`py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              mediaTab === 'audios' ? 'bg-emerald-600 text-white' : 'hover:text-gray-200'
            }`}
          >
            <Volume2 className="w-3 h-3" />
            <span>({audios.length})</span>
          </button>

          <button
            onClick={() => setMediaTab('videos')}
            className={`py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              mediaTab === 'videos' ? 'bg-emerald-600 text-white' : 'hover:text-gray-200'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>({videos.length})</span>
          </button>

          <button
            onClick={() => setMediaTab('docs')}
            className={`py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              mediaTab === 'docs' ? 'bg-emerald-600 text-white' : 'hover:text-gray-200'
            }`}
          >
            <Paperclip className="w-3 h-3" />
            <span>({docs.length})</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="pt-2 max-h-48 overflow-y-auto space-y-2">
          {mediaTab === 'images' && (
            images.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic text-center py-3">Nenhuma imagem trocada.</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {images.map((m) => {
                  const angle = imageRotations[m.mediaUrl || ''] || 0;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedImage(m.mediaUrl || null)}
                      className="aspect-square bg-gray-900 border border-gray-800 rounded-lg overflow-hidden relative cursor-pointer hover:border-emerald-500 transition-all group"
                    >
                      <img
                        src={m.mediaUrl}
                        alt="Foto trocada"
                        className="w-full h-full object-cover transition-transform duration-200"
                        style={{ transform: `rotate(${angle}deg)` }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {mediaTab === 'audios' && (
            audios.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic text-center py-3">Nenhum áudio trocado.</p>
            ) : (
              <div className="space-y-2">
                {audios.map((m) => (
                  <div key={m.id} className="space-y-1">
                    <div className="text-[9px] text-gray-400 font-mono flex justify-between">
                      <span>{m.senderName || (m.sender === 'contact' ? contact.name : 'Atendente')}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <WaveformAudioPlayer src={m.mediaUrl || ''} />
                  </div>
                ))}
              </div>
            )
          )}

          {mediaTab === 'videos' && (
            videos.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic text-center py-3">Nenhum vídeo trocado.</p>
            ) : (
              <div className="space-y-2">
                {videos.map((m) => (
                  <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl p-1.5 space-y-1">
                    <video src={m.mediaUrl} controls className="w-full rounded-lg max-h-36 bg-black" />
                    <div className="text-[9px] text-gray-400 flex justify-between px-1">
                      <span>{m.timestamp}</span>
                      <a href={m.mediaUrl} download className="text-emerald-400 hover:underline">Baixar Vídeo</a>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {mediaTab === 'docs' && (
            docs.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic text-center py-3">Nenhum documento trocado.</p>
            ) : (
              <div className="space-y-1.5">
                {docs.map((m) => (
                  <a
                    key={m.id}
                    href={m.mediaUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-emerald-500/50 p-2 rounded-xl text-[11px] text-gray-200 transition-all"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate font-medium">{m.content || 'Anexo Documento'}</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </a>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Ticket Details */}
      <div className="space-y-2.5 bg-gray-950 p-3 rounded-2xl border border-gray-800 text-xs">
        <div className="font-bold text-gray-300 mb-1 flex items-center justify-between">
          <span>Informações do Atendimento</span>
          <span className="font-mono text-[10px] text-gray-400">#{ticket.protocol}</span>
        </div>
        <div className="flex justify-between text-gray-400 items-center">
          <span>Status:</span>
          <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
            {ticket.status === 'in_progress' ? 'EM ATENDIMENTO' :
             ticket.status === 'pending' ? 'PENDENTE / FILA' :
             ticket.status === 'waiting' ? 'EM ESPERA' : 'ENCERRADO'}
          </span>
        </div>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="w-full mt-1.5 flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium py-2 px-3 rounded-xl transition-all cursor-pointer text-xs hover:border-emerald-500/60 shadow-sm"
          title="Exportar Histórico Completo do Atendimento"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Exportar Histórico</span>
        </button>
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
          <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-xs text-gray-400 min-h-[60px]">
            {contact.notes || 'Nenhuma observação registrada.'}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <ImageViewerModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage}
          initialRotation={imageRotations[selectedImage] || 0}
          onRotationChange={onRotationChange}
        />
      )}

      {/* Edit Contact Modal */}
      {isEditContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveContact} className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                Editar Dados do Contato
              </h3>
              <button
                type="button"
                onClick={() => setIsEditContactModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500">Nome no WhatsApp / PushName (Original)</label>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">{contact.pushName || contact.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/80 text-[11px]">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500">JID do Cliente</label>
                    <p className="text-gray-300 font-mono text-[10px] truncate">{contact.jid || `${contact.phone.replace(/\D/g, '')}@s.whatsapp.net`}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500">LID do Cliente</label>
                    <p className="text-gray-300 font-mono text-[10px] truncate">{contact.lid || '1029384756123@lid'}</p>
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
                  placeholder="cliente@exemplo.com"
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
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditContactModalOpen(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 rounded-xl transition-all border border-gray-700 cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-xl transition-all shadow-md shadow-emerald-900/40 cursor-pointer text-xs"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Export Ticket Modal */}
      <ExportTicketModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        ticket={ticket}
        messages={messages}
      />
    </div>
  );
};
