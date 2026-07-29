import React, { useState } from 'react';
import { Layers, Plus, Edit3, Trash2, Clock, Utensils, Calendar, MessageSquare, AlertCircle, CheckCircle2, ShieldAlert, Info, X } from 'lucide-react';
import { Queue, Department } from '../../types';

interface QueuesManagementProps {
  queues: Queue[];
  departments: Department[];
  onAddQueue: (queue: Queue) => void;
  onUpdateQueue: (queue: Queue) => void;
  onDeleteQueue: (id: string) => void;
}

const ALL_DAYS = [
  { id: 'mon', label: 'Seg' },
  { id: 'tue', label: 'Ter' },
  { id: 'wed', label: 'Qua' },
  { id: 'thu', label: 'Qui' },
  { id: 'fri', label: 'Sex' },
  { id: 'sat', label: 'Sáb' },
  { id: 'sun', label: 'Dom' }
];

export const QueuesManagement: React.FC<QueuesManagementProps> = ({
  queues,
  departments,
  onAddQueue,
  onUpdateQueue,
  onDeleteQueue
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [color, setColor] = useState('emerald');
  const [botGreeting, setBotGreeting] = useState('');

  // Working Hours State
  const [workingHoursEnabled, setWorkingHoursEnabled] = useState(true);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [workingDays, setWorkingDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [outOfHoursMessage, setOutOfHoursMessage] = useState('Agradecemos seu contato. Nosso atendimento está fora do horário de expediente. Seu atendimento permanece registrado em nossa fila e responderemos assim que retornarmos!');
  const [maxOutOfHoursMessages, setMaxOutOfHoursMessages] = useState<number>(2);

  // Lunch Break State
  const [lunchBreakEnabled, setLunchBreakEnabled] = useState(true);
  const [lunchStartTime, setLunchStartTime] = useState('12:00');
  const [lunchEndTime, setLunchEndTime] = useState('13:30');
  const [lunchMessage, setLunchMessage] = useState('Estamos no intervalo de almoço. Sua solicitação já foi salva em nossa fila e será atendida em breve.');
  const [maxLunchMessages, setMaxLunchMessages] = useState<number>(1);

  const handleOpenAdd = () => {
    setEditingQueue(null);
    setName('');
    setDepartmentId(departments[0]?.id || 'dept-vendas');
    setColor('emerald');
    setBotGreeting('Olá! Você está em nossa fila de atendimento.');
    setWorkingHoursEnabled(true);
    setStartTime('08:00');
    setEndTime('18:00');
    setWorkingDays(['mon', 'tue', 'wed', 'thu', 'fri']);
    setOutOfHoursMessage('Agradecemos seu contato. Estamos fora do horário de atendimento. Sua mensagem continuará na fila e responderemos assim que abrirmos.');
    setMaxOutOfHoursMessages(2);
    setLunchBreakEnabled(true);
    setLunchStartTime('12:00');
    setLunchEndTime('13:30');
    setLunchMessage('Estamos em horário de almoço. Seu atendimento continuará registrado em nossa fila!');
    setMaxLunchMessages(1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (queue: Queue) => {
    setEditingQueue(queue);
    setName(queue.name);
    setDepartmentId(queue.departmentId);
    setColor(queue.color || 'emerald');
    setBotGreeting(queue.botGreeting || '');
    setWorkingHoursEnabled(queue.workingHoursEnabled ?? true);
    setStartTime(queue.startTime || '08:00');
    setEndTime(queue.endTime || '18:00');
    setWorkingDays(queue.workingDays || ['mon', 'tue', 'wed', 'thu', 'fri']);
    setOutOfHoursMessage(queue.outOfHoursMessage || 'Agradecemos seu contato. Estamos fora do horário. Sua mensagem continua na fila.');
    setMaxOutOfHoursMessages(queue.maxOutOfHoursMessages ?? 2);
    setLunchBreakEnabled(queue.lunchBreakEnabled ?? false);
    setLunchStartTime(queue.lunchStartTime || '12:00');
    setLunchEndTime(queue.lunchEndTime || '13:30');
    setLunchMessage(queue.lunchMessage || 'Estamos em horário de almoço. Seu atendimento continuará na fila!');
    setMaxLunchMessages(queue.maxLunchMessages ?? 1);
    setIsModalOpen(true);
  };

  const toggleDay = (dayId: string) => {
    setWorkingDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingQueue) {
      const updated: Queue = {
        ...editingQueue,
        name,
        departmentId,
        color,
        botGreeting,
        workingHoursEnabled,
        startTime,
        endTime,
        workingDays,
        outOfHoursMessage,
        maxOutOfHoursMessages,
        lunchBreakEnabled,
        lunchStartTime,
        lunchEndTime,
        lunchMessage,
        maxLunchMessages
      };
      onUpdateQueue(updated);
    } else {
      const newQueue: Queue = {
        id: 'queue-' + Date.now(),
        name,
        departmentId,
        color,
        botGreeting,
        workingHoursEnabled,
        startTime,
        endTime,
        workingDays,
        outOfHoursMessage,
        maxOutOfHoursMessages,
        lunchBreakEnabled,
        lunchStartTime,
        lunchEndTime,
        lunchMessage,
        maxLunchMessages
      };
      onAddQueue(newQueue);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Filas de Atendimento &amp; Horários de Expediente
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Configure saudações, horário de expediente, intervalo de almoço e quantidade máxima de avisos automáticos enviadas aos clientes fora do horário.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nova Fila de Atendimento
          </button>
        </div>

        {/* Queues List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queues.map((q) => {
            const dept = departments.find((d) => d.id === q.departmentId);

            return (
              <div
                key={q.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 hover:border-gray-700 transition-all shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Title & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-gray-100">{q.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Setor: <span className="text-emerald-400 font-medium">{dept ? dept.name : 'Geral'}</span>
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      ID: {q.id}
                    </span>
                  </div>

                  {/* Greeting */}
                  <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-xs">
                    <span className="text-gray-400 font-medium block mb-0.5 text-[11px]">Mensagem de Boas-Vindas Bot:</span>
                    <p className="text-gray-200 italic">"{q.botGreeting || 'Sem mensagem configurada'}"</p>
                  </div>

                  {/* Working Hours Summary */}
                  <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 text-xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                      <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        Horário de Expediente:
                      </span>
                      {q.workingHoursEnabled ? (
                        <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md">
                          {q.startTime || '08:00'} às {q.endTime || '18:00'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">
                          24 Horas Ativo
                        </span>
                      )}
                    </div>

                    {q.workingHoursEnabled && (
                      <div className="text-[11px] space-y-1">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span>Dias de Operação:</span>
                          <span className="text-gray-200 font-medium">
                            {(q.workingDays || ['mon', 'tue', 'wed', 'thu', 'fri'])
                              .map((d) => ALL_DAYS.find((item) => item.id === d)?.label)
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                        <p className="text-gray-400 truncate">
                          <strong className="text-gray-300">Aviso Fora do Expediente:</strong> "{q.outOfHoursMessage || 'Fora do horário de atendimento'}"
                        </p>
                        <p className="text-[10px] text-emerald-400/90 font-mono">
                          Limite de Avisos: {q.maxOutOfHoursMessages ?? 2}x por cliente que insistir.
                        </p>
                      </div>
                    )}

                    {/* Lunch Break Summary */}
                    <div className="pt-2 border-t border-gray-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-200 flex items-center gap-1.5 text-[11px]">
                          <Utensils className="w-3.5 h-3.5 text-amber-400" />
                          Horário de Almoço:
                        </span>
                        {q.lunchBreakEnabled ? (
                          <span className="text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-md">
                            {q.lunchStartTime || '12:00'} às {q.lunchEndTime || '13:30'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-gray-500">Sem Intervalo</span>
                        )}
                      </div>
                      {q.lunchBreakEnabled && (
                        <p className="text-[11px] text-gray-400 truncate">
                          <strong className="text-gray-300">Aviso de Almoço:</strong> "{q.lunchMessage || 'Estamos em horário de almoço.'}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Guaranteed Persistence Rule Banner */}
                  <div className="flex items-start gap-2 p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Atendimentos recebidos fora do horário ou no almoço <strong>permanecem salvos na fila</strong> para a equipe atender na abertura do expediente.
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-emerald-400 font-medium px-3 py-1.5 rounded-xl border border-gray-700 transition-all text-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar Fila &amp; Horários
                  </button>
                  <button
                    onClick={() => onDeleteQueue(q.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                    title="Excluir Fila"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                {editingQueue ? 'Editar Fila & Horários de Atendimento' : 'Cadastrar Nova Fila de Atendimento'}
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
              {/* Basic Queue Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Nome da Fila / Opção do Bot</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1 - Vendas & Orçamentos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Setor Vinculado</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bot Greeting */}
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Mensagem de Boas-Vindas da Fila</label>
                <textarea
                  rows={2}
                  placeholder="Mensagem padrão enviada ao cliente quando ele escolhe esta fila..."
                  value={botGreeting}
                  onChange={(e) => setBotGreeting(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Section 1: Working Hours Config */}
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="font-bold text-gray-200 flex items-center gap-1.5 text-xs">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Horário de Expediente da Fila
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workingHoursEnabled}
                      onChange={(e) => setWorkingHoursEnabled(e.target.checked)}
                      className="rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-300 font-medium">Ativar Horário</span>
                  </label>
                </div>

                {workingHoursEnabled && (
                  <div className="space-y-3 pt-1">
                    {/* Start / End time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1 font-medium">Horário de Abertura</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1 font-medium">Horário de Fechamento</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Working Days */}
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Dias de Funcionamento</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_DAYS.map((day) => {
                          const active = workingDays.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => toggleDay(day.id)}
                              className={`px-3 py-1 rounded-lg border font-semibold transition-all text-xs ${
                                active
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-200'
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Out of hours message */}
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Mensagem Personalizada Fora do Horário</label>
                      <textarea
                        rows={2}
                        value={outOfHoursMessage}
                        onChange={(e) => setOutOfHoursMessage(e.target.value)}
                        placeholder="Mensagem enviada quando o cliente entra na fila fora do expediente..."
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Max Repeat Messages */}
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                        <span>Limite de envio deste aviso se o cliente insistir:</span>
                        <span className="text-emerald-400 font-bold font-mono">{maxOutOfHoursMessages}x</span>
                      </label>
                      <select
                        value={maxOutOfHoursMessages}
                        onChange={(e) => setMaxOutOfHoursMessages(Number(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value={1}>Enviar no máximo 1 vez</option>
                        <option value={2}>Enviar no máximo 2 vezes</option>
                        <option value={3}>Enviar no máximo 3 vezes</option>
                        <option value={5}>Enviar no máximo 5 vezes</option>
                        <option value={999}>Ilimitado (Sempre avisar)</option>
                      </select>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Evita sobrecarregar o cliente com múltiplos avisos iguais se ele mandar várias mensagens em sequência.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Lunch Break Config */}
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="font-bold text-gray-200 flex items-center gap-1.5 text-xs">
                    <Utensils className="w-4 h-4 text-amber-400" />
                    Horário de Almoço da Fila
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lunchBreakEnabled}
                      onChange={(e) => setLunchBreakEnabled(e.target.checked)}
                      className="rounded border-gray-700 bg-gray-900 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-xs text-gray-300 font-medium">Ativar Horário de Almoço</span>
                  </label>
                </div>

                {lunchBreakEnabled && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1 font-medium">Início Almoço</label>
                        <input
                          type="time"
                          value={lunchStartTime}
                          onChange={(e) => setLunchStartTime(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1 font-medium">Fim Almoço</label>
                        <input
                          type="time"
                          value={lunchEndTime}
                          onChange={(e) => setLunchEndTime(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Mensagem Personalizada de Almoço</label>
                      <textarea
                        rows={2}
                        value={lunchMessage}
                        onChange={(e) => setLunchMessage(e.target.value)}
                        placeholder="Mensagem enviada durante o horário de almoço..."
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                        <span>Limite de envio do aviso de almoço se insistir:</span>
                        <span className="text-amber-400 font-bold font-mono">{maxLunchMessages}x</span>
                      </label>
                      <select
                        value={maxLunchMessages}
                        onChange={(e) => setMaxLunchMessages(Number(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-gray-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value={1}>Enviar no máximo 1 vez</option>
                        <option value={2}>Enviar no máximo 2 vezes</option>
                        <option value={3}>Enviar no máximo 3 vezes</option>
                        <option value={999}>Ilimitado (Sempre avisar)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Informative Persistence Note */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-[11px] text-emerald-200">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Garantia de Fila:</strong> Mesmo que o cliente entre fora do horário ou no almoço, a conversa <strong>permanecerá na fila</strong> com status pendente até que a equipe retorne.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
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
                {editingQueue ? 'Salvar Alterações' : 'Cadastrar Fila'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
