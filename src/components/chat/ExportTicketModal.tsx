import React, { useState } from 'react';
import { Download, Printer, FileText, Code, Check, X, Shield, Sparkles } from 'lucide-react';
import { Ticket, Message, Department, Attendant } from '../../types';

interface ExportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  messages: Message[];
  department?: Department;
  attendant?: Attendant;
}

export const ExportTicketModal: React.FC<ExportTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  messages,
  department,
  attendant
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const contact = ticket.contact;

  const generateFormattedText = () => {
    let header = `====================================================\n`;
    header += `          RELATÓRIO DE ATENDIMENTO          \n`;
    header += `====================================================\n`;
    header += `Protocolo: #${ticket.protocol}\n`;
    header += `Cliente: ${contact.name} (${contact.phone})\n`;
    header += `WhatsApp PushName: ${contact.pushName || contact.name}\n`;
    header += `E-mail: ${contact.email || 'Não informado'}\n`;
    header += `Departamento: ${department?.name || 'Geral'}\n`;
    header += `Atendente Responsável: ${attendant?.name || 'Atendente'}\n`;
    header += `Data de Criação: ${new Date(ticket.createdAt).toLocaleString()}\n`;
    const formattedStatus =
      ticket.status === 'in_progress' ? 'EM ATENDIMENTO' :
      ticket.status === 'pending' ? 'PENDENTE' :
      ticket.status === 'waiting' ? 'EM ESPERA' : 'ENCERRADO';
    header += `Status: ${formattedStatus}\n`;
    header += `----------------------------------------------------\n\n`;
    header += `HISTÓRICO COMPLETO DA CONVERSA:\n\n`;

    const body = messages
      .map((m) => {
        const sender = m.isInternalNote
          ? `[NOTA INTERNA - ${m.senderName || 'Atendente'}]`
          : m.sender === 'contact'
          ? `[CLIENTE - ${contact.name}]`
          : `[ATENDENTE - ${m.senderName || 'Atendente'}]`;

        let msgLine = `${m.timestamp} - ${sender}: ${m.content || ''}`;
        if (m.mediaUrl) {
          msgLine += ` (Anexo: ${m.mediaUrl})`;
        }
        return msgLine;
      })
      .join('\n');

    return header + body;
  };

  const handleDownloadTxt = () => {
    const textContent = generateFormattedText();
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Atendimento_Protocolo_${ticket.protocol}_${contact.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonObj = {
      protocol: ticket.protocol,
      status: ticket.status,
      customer: {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        pushName: contact.pushName,
        jid: contact.jid,
        lid: contact.lid
      },
      department: department?.name,
      attendant: attendant?.name,
      createdAt: ticket.createdAt,
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        senderName: m.senderName,
        content: m.content,
        timestamp: m.timestamp,
        isInternalNote: m.isInternalNote,
        mediaUrl: m.mediaUrl,
        type: m.type
      }))
    };

    const blob = new Blob([JSON.stringify(jsonObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_Atendimento_${ticket.protocol}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const textContent = generateFormattedText();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Atendimento #${ticket.protocol}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; line-height: 1.6; color: #111; }
            h1 { color: #059669; font-size: 20px; border-bottom: 2px solid #059669; padding-bottom: 8px; }
            .info-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
            .info-box p { margin: 4px 0; }
            .msg { margin-bottom: 12px; padding: 10px; border-radius: 6px; font-size: 12px; }
            .msg-contact { background: #e5e7eb; border-left: 4px solid #4b5563; }
            .msg-attendant { background: #ecfdf5; border-left: 4px solid #10b981; }
            .msg-note { background: #fef3c7; border-left: 4px solid #f59e0b; }
            .timestamp { font-size: 10px; color: #6b7280; float: right; }
          </style>
        </head>
        <body>
          <h1>Relatório de Atendimento — Protocolo #${ticket.protocol}</h1>
          <div class="info-box">
            <p><strong>Cliente:</strong> ${contact.name} (${contact.phone})</p>
            <p><strong>E-mail:</strong> ${contact.email || 'Não informado'}</p>
            <p><strong>Departamento:</strong> ${department?.name || 'Geral'}</p>
            <p><strong>Atendente:</strong> ${attendant?.name || 'Responsável'}</p>
            <p><strong>Data de Registro:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
          </div>
          <h3>Histórico Mensagens</h3>
          ${messages
            .map(
              (m) => `
            <div class="msg ${m.isInternalNote ? 'msg-note' : m.sender === 'contact' ? 'msg-contact' : 'msg-attendant'}">
              <span class="timestamp">${m.timestamp}</span>
              <strong>${m.isInternalNote ? 'NOTA INTERNA' : m.sender === 'contact' ? contact.name : m.senderName || 'Atendente'}:</strong>
              <div>${m.content || ''}</div>
              ${m.mediaUrl ? `<div style="font-size:10px; color:#3b82f6; margin-top:4px;">Anexo: ${m.mediaUrl}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(generateFormattedText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            Exportar Histórico do Atendimento
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 text-xs space-y-1.5 text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-400">Protocolo:</span>
            <span className="font-mono text-emerald-400 font-bold">#{ticket.protocol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cliente:</span>
            <span className="font-medium text-gray-100">{contact.name} ({contact.phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Mensagens no Registro:</span>
            <span className="font-medium text-gray-200">{messages.length} interações</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Escolha o formato em que deseja exportar o relatório do atendimento completo feito pelo atendente.
        </p>

        {/* Export Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handlePrint}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-xs font-semibold text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-gray-100">Imprimir / Salvar PDF</div>
              <div className="text-[10px] text-gray-400 font-normal">Gera layout formatado</div>
            </div>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-xs font-semibold text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-gray-100">Baixar Arquivo TXT</div>
              <div className="text-[10px] text-gray-400 font-normal">Texto estruturado</div>
            </div>
          </button>

          <button
            onClick={handleDownloadJson}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-xs font-semibold text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <div className="text-gray-100">Baixar JSON</div>
              <div className="text-[10px] text-gray-400 font-normal">Dados brutos para sistemas</div>
            </div>
          </button>

          <button
            onClick={handleCopyClipboard}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-xs font-semibold text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-gray-100">{copied ? 'Copiado!' : 'Copiar Texto'}</div>
              <div className="text-[10px] text-gray-400 font-normal">Área de transferência</div>
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-800">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
