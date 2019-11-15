import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  timeDifference: number;

  constructor(
    private http: HttpClient
  ) {
    this.getDifference();
   }

   // Utiliza o parametro de hora do padão UTC para verificar a diferença
  getDifference(): void {
    if (!this.timeDifference) {
      this.http.get('https://time-api.now.sh/current-time')
      .pipe(take(1))
      .subscribe(res => {
        // console.log('Time: ', res);
        // O timeDifference recebe a diferença da data e hora da maquina que esta utilizando a aplicação da hora do padrão UTC
        // tslint:disable-next-line:no-string-literal
        this.timeDifference = new Date(res['ISO']).getTime() - Date.now();
      });

    }
  }

}
