import { Queue } from '../types';

export interface ScheduleCheckResult {
  isOut: boolean;
  isLunch: boolean;
  message: string;
  maxLimit: number;
  reason: 'none' | 'out_of_hours' | 'lunch_break';
}

export function checkQueueSchedule(queue: Queue | undefined): ScheduleCheckResult {
  if (!queue) {
    return { isOut: false, isLunch: false, message: '', maxLimit: 0, reason: 'none' };
  }

  const now = new Date();
  const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 1. Check Working Hours
  if (queue.workingHoursEnabled) {
    const workingDays = queue.workingDays || ['mon', 'tue', 'wed', 'thu', 'fri'];

    if (!workingDays.includes(dayName)) {
      return {
        isOut: true,
        isLunch: false,
        message: queue.outOfHoursMessage || 'Agradecemos seu contato. Nossos atendentes estão fora do horário de expediente. Seu atendimento permanece salvo em nossa fila!',
        maxLimit: queue.maxOutOfHoursMessages ?? 2,
        reason: 'out_of_hours'
      };
    }

    const [startH, startM] = (queue.startTime || '08:00').split(':').map(Number);
    const [endH, endM] = (queue.endTime || '18:00').split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (currentMinutes < startMin || currentMinutes >= endMin) {
      return {
        isOut: true,
        isLunch: false,
        message: queue.outOfHoursMessage || 'Agradecemos seu contato. Nossos atendentes estão fora do horário de expediente. Seu atendimento permanece salvo em nossa fila!',
        maxLimit: queue.maxOutOfHoursMessages ?? 2,
        reason: 'out_of_hours'
      };
    }
  }

  // 2. Check Lunch Break
  if (queue.lunchBreakEnabled) {
    const [lStartH, lStartM] = (queue.lunchStartTime || '12:00').split(':').map(Number);
    const [lEndH, lEndM] = (queue.lunchEndTime || '13:30').split(':').map(Number);
    const lStartMin = lStartH * 60 + lStartM;
    const lEndMin = lEndH * 60 + lEndM;

    if (currentMinutes >= lStartMin && currentMinutes < lEndMin) {
      return {
        isOut: false,
        isLunch: true,
        message: queue.lunchMessage || 'Estamos em nosso horário de almoço. Seu atendimento permanece na fila e responderemos assim que retornarmos!',
        maxLimit: queue.maxLunchMessages ?? 1,
        reason: 'lunch_break'
      };
    }
  }

  return { isOut: false, isLunch: false, message: '', maxLimit: 0, reason: 'none' };
}
