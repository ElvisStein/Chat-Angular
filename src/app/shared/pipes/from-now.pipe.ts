import { Pipe, PipeTransform } from '@angular/core';

import { AppConfigService } from 'src/app/core/services/app-config.service';

@Pipe({
  name: 'fromNow',
  // Aula 207 tornando um pipe impuro
  pure: false
})
export class FromNowPipe implements PipeTransform {

  constructor(
    private appConfig: AppConfigService
  ) {}

  transform(date: string): string {
    return timeDifferenceForDate(date, this.appConfig.timeDifference);
  }

}

function getTimeDifference(current: number, previous: number) {
  const milliSecondsPerMinute = 60 * 1000;  // Quantos milisegundos por minuto
  const milliSecondsPerHour = milliSecondsPerMinute * 60;
  const milliSecondsPerDay = milliSecondsPerHour * 24;
  const milliSecondsPerMonth = milliSecondsPerDay * 30;
  const milliSecondsPerYear = milliSecondsPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < milliSecondsPerMinute / 3) {
    return 'Agora mesmo';
  }

  if (elapsed < milliSecondsPerMinute) {
    return 'menos de 1 minuto atrás';
  } else if (elapsed < milliSecondsPerHour) {
    return Math.round(elapsed / milliSecondsPerMinute) + ' minutos atrás';
  } else if (elapsed < milliSecondsPerDay) {
    return Math.round(elapsed / milliSecondsPerHour) + ' h atrás';
  } else if (elapsed < milliSecondsPerMonth) {
    return Math.round(elapsed / milliSecondsPerDay) + ' dias atrás';
  } else if (elapsed < milliSecondsPerYear) {
    return Math.round(elapsed / milliSecondsPerMonth) + ' meses atrás';
  } else {
    return Math.round(elapsed / milliSecondsPerYear) + ' anos atrás';
  }
}

function timeDifferenceForDate(date: string, timeDifference: number) {
  const now = new Date().getTime() + timeDifference;
  const updated = new Date(date).getTime();
  return getTimeDifference(now, updated);
}
