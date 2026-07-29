import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, Shield, Mail, CheckCircle2 } from 'lucide-react';
import { Attendant, Department } from '../../types';

interface AttendantsManagementProps {
  attendants: Attendant[];
  departments: Department[];
  onAddAttendant: (attendant: Attendant) => void;
  onDeleteAttendant: (id: string) => void;
}

export const AttendantsManagement: React.FC<AttendantsManagementProps> = ({
  attendants,
  departments,
  onAddAttendant,
  onDeleteAttendant
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'supervisor' | 'agent'>('agent');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newAttendant: Attendant = {
      id: 'att-' + Date.now(),
      name,
      email,
      role,
      departmentIds: departments.map((d) => d.id),
      status: 'online',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150`
    };

    onAddAttendant(newAttendant);
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              Equipe &amp; Atendentes
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Gerencie usuários, permissões de acesso e filas atribuídas aos operadores.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Atendente
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendants.map((a) => (
            <div
              key={a.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-all space-y-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src={a.avatar || 'https://images.unsplash.com/photo-1534528741775'}
                  alt={a.name}
                  className="w-12 h-12 rounded-full object-cover border border-emerald-500/50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-gray-100 truncate">{a.name}</h3>
                  <p className="text-xs text-gray-400 truncate">{a.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    {a.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online no Sistema
                </span>
                <button
                  onClick={() => onDeleteAttendant(a.id)}
                  className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Novo Atendente
            </h3>

            <div className="space-y-3 text-xs">
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
                <label className="block text-gray-400 mb-1 font-medium">Email de Acesso</label>
                <input
                  type="email"
                  required
                  placeholder="amanda@fhchat.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
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
                Cadastrar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
