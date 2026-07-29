import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, Edit3, Shield, Mail, Lock, Key, CheckCircle2, Wifi, MessageSquare, Layers, X, Eye, EyeOff } from 'lucide-react';
import { Attendant, Department, Queue, WhatsAppConnection } from '../../types';

interface AttendantsManagementProps {
  attendants: Attendant[];
  departments: Department[];
  queues: Queue[];
  connections: WhatsAppConnection[];
  onAddAttendant: (attendant: Attendant) => void;
  onUpdateAttendant: (attendant: Attendant) => void;
  onDeleteAttendant: (id: string) => void;
}

export const AttendantsManagement: React.FC<AttendantsManagementProps> = ({
  attendants,
  departments,
  queues,
  connections,
  onAddAttendant,
  onUpdateAttendant,
  onDeleteAttendant
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendant, setEditingAttendant] = useState<Attendant | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'supervisor' | 'agent'>('agent');
  const [status, setStatus] = useState<'online' | 'busy' | 'offline'>('online');
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);

  const handleOpenAdd = () => {
    setEditingAttendant(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('agent');
    setStatus('online');
    setSelectedQueueIds(queues.map((q) => q.id));
    setSelectedDepartmentIds(departments.map((d) => d.id));
    setSelectedConnectionIds(connections.map((c) => c.id));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (attendant: Attendant) => {
    setEditingAttendant(attendant);
    setName(attendant.name);
    setEmail(attendant.email);
    setPassword(attendant.password || '••••••••');
    setRole(attendant.role);
    setStatus(attendant.status);
    setSelectedQueueIds(attendant.queueIds || queues.map((q) => q.id));
    setSelectedDepartmentIds(attendant.departmentIds || departments.map((d) => d.id));
    setSelectedConnectionIds(attendant.connectionIds || connections.map((c) => c.id));
    setIsModalOpen(true);
  };

  const toggleQueue = (qId: string) => {
    setSelectedQueueIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const toggleConnection = (cId: string) => {
    setSelectedConnectionIds((prev) =>
      prev.includes(cId) ? prev.filter((id) => id !== cId) : [...prev, cId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    if (editingAttendant) {
      const updated: Attendant = {
        ...editingAttendant,
        name,
        email,
        password,
        role,
        status,
        queueIds: selectedQueueIds,
        departmentIds: selectedDepartmentIds,
        connectionIds: selectedConnectionIds
      };
      onUpdateAttendant(updated);
    } else {
      const newAttendant: Attendant = {
        id: 'att-' + Date.now(),
        name,
        email,
        password,
        role,
        status,
        queueIds: selectedQueueIds,
        departmentIds: selectedDepartmentIds,
        connectionIds: selectedConnectionIds,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150`
      };
      onAddAttendant(newAttendant);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              Equipe &amp; Atendentes
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Gerencie logins, senhas, senhas de acesso, filas de atendimento e conexões permitidas para cada operador.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Atendente
          </button>
        </div>

        {/* Attendants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendants.map((a) => {
            const assignedQueues = queues.filter((q) => (a.queueIds || []).includes(q.id));
            const assignedConnections = connections.filter((c) => (a.connectionIds || []).includes(c.id));

            return (
              <div
                key={a.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-all space-y-4 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={a.avatar || 'https://images.unsplash.com/photo-1534528741775'}
                      alt={a.name}
                      className="w-12 h-12 rounded-full object-cover border border-emerald-500/50 shrink-0 shadow-md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-sm text-gray-100 truncate">{a.name}</h3>
                        <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 shrink-0">
                          {a.role === 'admin' ? 'Admin' : a.role === 'supervisor' ? 'Supervisor' : 'Agente'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-500" />
                        {a.email}
                      </p>
                    </div>
                  </div>

                  {/* Permissions Details */}
                  <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2 text-[11px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 font-medium flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-400" />
                        Filas ({assignedQueues.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {assignedQueues.length > 0 ? (
                          assignedQueues.map((q) => (
                            <span key={q.id} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700 text-[10px]">
                              {q.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-[10px]">Todas as filas</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-1 border-t border-gray-800">
                      <span className="text-gray-400 font-medium flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-blue-400" />
                        Conexões WhatsApp ({assignedConnections.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {assignedConnections.length > 0 ? (
                          assignedConnections.map((c) => (
                            <span key={c.id} className="bg-gray-800 text-blue-300 px-2 py-0.5 rounded border border-gray-700 text-[10px]">
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-[10px]">Todas as conexões</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs">
                  <span className={`font-semibold flex items-center gap-1.5 text-[11px] ${
                    a.status === 'online' ? 'text-emerald-400' : a.status === 'busy' ? 'text-amber-400' : 'text-gray-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      a.status === 'online' ? 'bg-emerald-500 animate-pulse' : a.status === 'busy' ? 'bg-amber-500' : 'bg-gray-600'
                    }`} />
                    {a.status === 'online' ? 'Online' : a.status === 'busy' ? 'Ocupado' : 'Offline'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-emerald-400 font-medium px-2.5 py-1 rounded-lg border border-gray-700 transition-all text-xs cursor-pointer"
                      title="Editar Atendente e Permissões"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => onDeleteAttendant(a.id)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
                      title="Excluir Atendente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                {editingAttendant ? 'Editar Atendente & Permissões' : 'Cadastrar Novo Atendente'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amanda Rocha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Email / Usuário de Acesso</label>
                  <input
                    type="email"
                    required
                    placeholder="amanda@fhchat.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Password & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Senha de Acesso</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Senha do atendente"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 pr-9 text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Cargo / Permissão</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="agent">Agente de Atendimento</option>
                    <option value="supervisor">Supervisor de Setor</option>
                    <option value="admin">Administrador Geral</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Status Inicial</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="online">Online</option>
                  <option value="busy">Ocupado</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {/* Queues Assignment */}
              <div className="space-y-1.5 pt-2 border-t border-gray-800">
                <label className="block text-gray-300 font-semibold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Filas de Atendimento Permitidas:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-950 p-3 rounded-xl border border-gray-800 max-h-36 overflow-y-auto">
                  {queues.map((q) => {
                    const checked = selectedQueueIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQueue(q.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          checked ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded border border-gray-700 flex items-center justify-center bg-gray-800">
                          {checked && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                        </span>
                        <span className="truncate">{q.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Connections Assignment */}
              <div className="space-y-1.5 pt-2 border-t border-gray-800">
                <label className="block text-gray-300 font-semibold flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-blue-400" />
                  Conexões WhatsApp Permitidas:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-950 p-3 rounded-xl border border-gray-800 max-h-36 overflow-y-auto">
                  {connections.map((c) => {
                    const checked = selectedConnectionIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleConnection(c.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          checked ? 'bg-blue-950/40 border-blue-500/50 text-blue-300' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded border border-gray-700 flex items-center justify-center bg-gray-800">
                          {checked && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                        </span>
                        <span className="truncate">{c.name} ({c.phone || 'Sem N°'})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl transition-all border border-gray-700 cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/40 cursor-pointer text-xs"
              >
                {editingAttendant ? 'Salvar Alterações' : 'Cadastrar Atendente'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
