import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Phone,
  Mail,
  UserPlus,
  X,
  Smartphone,
  Layers,
  Check,
  Building,
  CheckCircle2
} from 'lucide-react';
import { Attendant, Department, Role, WhatsAppConnection, Queue } from '../../types';

interface AttendantsManagementProps {
  attendants: Attendant[];
  departments: Department[];
  connections: WhatsAppConnection[];
  queues: Queue[];
  onAddAttendant: (attendant: Omit<Attendant, 'id' | 'activeTicketsCount'>) => void;
  onUpdateAttendant: (attendant: Attendant) => void;
  onDeleteAttendant?: (id: string) => void;
}

export const AttendantsManagement: React.FC<AttendantsManagementProps> = ({
  attendants,
  departments,
  connections,
  queues,
  onAddAttendant,
  onUpdateAttendant,
  onDeleteAttendant
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendant, setSelectedAttendant] = useState<Attendant | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('attendant');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-vendas');
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);

  const handleOpenAdd = () => {
    setSelectedAttendant(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('attendant');
    setDepartmentId(departments[0]?.id || 'dept-vendas');
    setSelectedConnectionIds(connections.map((c) => c.id)); // select all by default
    setSelectedQueueIds(queues.map((q) => q.id)); // select all by default
    setShowModal(true);
  };

  const handleOpenEdit = (att: Attendant) => {
    setSelectedAttendant(att);
    setName(att.name);
    setEmail(att.email);
    setPhone(att.phone || '');
    setRole(att.role);
    setDepartmentId(att.departmentId);
    setSelectedConnectionIds(att.connectionIds || connections.map((c) => c.id));
    setSelectedQueueIds(att.queueIds || queues.map((q) => q.id));
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (selectedAttendant) {
      onUpdateAttendant({
        ...selectedAttendant,
        name,
        email,
        phone,
        role,
        departmentId,
        connectionIds: selectedConnectionIds,
        queueIds: selectedQueueIds
      });
    } else {
      onAddAttendant({
        name,
        email,
        phone,
        role,
        departmentId,
        status: 'online',
        connectionIds: selectedConnectionIds,
        queueIds: selectedQueueIds,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`
      });
    }

    setShowModal(false);
  };

  const handleToggleConnection = (id: string) => {
    setSelectedConnectionIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleToggleQueue = (id: string) => {
    setSelectedQueueIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const getDepartmentName = (id: string) => {
    return departments.find((d) => d.id === id)?.name || 'Sem setor';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full text-gray-900 dark:text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Gestão de Equipe & Atendentes
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cadastre operacionais e atribua quais <strong>Conexões WhatsApp</strong> e <strong>Filas de Atendimento</strong> cada atendente pode acessar.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 flex items-center gap-2 shrink-0 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Atendente</span>
        </button>
      </div>

      {/* Attendants List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {attendants.map((att) => {
          const boundConns = connections.filter((c) =>
            (att.connectionIds || []).includes(c.id)
          );
          const boundQueues = queues.filter((q) =>
            (att.queueIds || []).includes(q.id)
          );

          return (
            <div
              key={att.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-4 relative hover:border-emerald-500/80 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={att.avatar}
                      alt={att.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {att.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{att.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded uppercase">
                          {att.role === 'admin'
                            ? 'Administrador'
                            : att.role === 'supervisor'
                            ? 'Supervisor'
                            : 'Atendente'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {att.activeTicketsCount} ativos
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(att)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Editar Permissões & Conexões"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details Section */}
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3 border border-gray-100 dark:border-gray-800/80 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-gray-400" /> Setor:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {getDepartmentName(att.departmentId)}
                    </span>
                  </div>

                  {/* Bound WhatsApp Connections */}
                  <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-emerald-500" /> Conexões WhatsApp
                      </span>
                      <span className="text-emerald-500">{boundConns.length} linha(s)</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {boundConns.length > 0 ? (
                        boundConns.map((c) => (
                          <span
                            key={c.id}
                            className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md font-medium truncate max-w-[140px]"
                            title={c.name}
                          >
                            {c.name.replace('WhatsApp ', '')}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Nenhuma linha atrelada</span>
                      )}
                    </div>
                  </div>

                  {/* Bound Queues */}
                  <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-blue-500" /> Filas Permitidas
                      </span>
                      <span className="text-blue-500">{boundQueues.length} fila(s)</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {boundQueues.length > 0 ? (
                        boundQueues.map((q) => (
                          <span
                            key={q.id}
                            className="text-[10px] px-2 py-0.5 rounded-md border font-medium truncate max-w-[140px]"
                            style={{
                              backgroundColor: `${q.color}15`,
                              borderColor: `${q.color}40`,
                              color: q.color
                            }}
                            title={q.name}
                          >
                            {q.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Nenhuma fila atrelada</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {att.phone || 'Sem fone'}
                </span>

                {onDeleteAttendant && att.role !== 'admin' && (
                  <button
                    onClick={() => {
                      if (confirm(`Remover o atendente ${att.name}?`)) {
                        onDeleteAttendant(att.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Excluir Atendente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {selectedAttendant ? 'Editar Permissões & Atribuições' : 'Cadastrar Novo Atendente'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Oliveira"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs mt-1 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="operador@suaempresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs mt-1 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                    Telefone Operacional
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+55 11 91111-2222"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs mt-1 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                    Setor Principal
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs mt-1 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                    Nível de Permissão
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs mt-1 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="attendant">Atendente Operacional</option>
                    <option value="supervisor">Supervisor de Fila</option>
                    <option value="admin">Administrador Geral</option>
                  </select>
                </div>
              </div>

              {/* Bound WhatsApp Connections */}
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Smartphone className="w-4 h-4" /> Conexões WhatsApp Vinculadas
                  </span>
                  <span className="text-[11px] font-normal text-gray-400">
                    {selectedConnectionIds.length} selecionada(s)
                  </span>
                </label>
                <p className="text-[11px] text-gray-500">
                  O atendente só conseguirá visualizar chamados vindos dos números de WhatsApp marcados abaixo:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {connections.map((c) => {
                    const isChecked = selectedConnectionIds.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleToggleConnection(c.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-300'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Smartphone className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{c.name}</span>
                        </div>
                        {isChecked && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bound Queues */}
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <Layers className="w-4 h-4" /> Filas de Atendimento Vinculadas
                  </span>
                  <span className="text-[11px] font-normal text-gray-400">
                    {selectedQueueIds.length} selecionada(s)
                  </span>
                </label>
                <p className="text-[11px] text-gray-500">
                  Defina em quais setores/filas (ex: Vendas, Suporte) o atendente poderá puxar mensagens da fila de espera:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {queues.map((q) => {
                    const isChecked = selectedQueueIds.includes(q.id);
                    return (
                      <button
                        type="button"
                        key={q.id}
                        onClick={() => handleToggleQueue(q.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isChecked
                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: q.color }} />
                          <span className="truncate">{q.name}</span>
                        </div>
                        {isChecked && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  {selectedAttendant ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
