import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsiVamosService {

  constructor(private httpClient: HttpClient) { }
  
  public filterStatus: WritableSignal<FilterData> = signal({open: false, noElements: 0, filters: [], update: false});

  public allDirectors: WritableSignal<any> = signal({current: 0, list: []});

  public removeFilters = new BehaviorSubject<boolean>(false);
  
  async decryptToken(token: string) {

    const headers = new HttpHeaders({'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`});
    return await firstValueFrom(this.httpClient.get<any>('https://www.brinsadigital.com.co/api-dev/auth/echouser', {headers: headers}));
  }

  dataClient = new BehaviorSubject<any>({});
}

export class DataObject {
  _data: any = [];
  

  constructor(data: any) {
    this._data = data;
  }

  getSells(date: string) {
    console.log('Fecha: ', this._data.reverse()[0]);
    const filtered = this._data.filter((r: any) => r.Periodo === date);
    console.log('filtered: ', filtered);
    return this._data.reduce((acc: number, next: any) => {
      return acc + (next.Periodo === date ? next.VlrMesAct : 0)
    }, 0)
  }

  getAvailableDays() {
    const holidays = [];
  }

}

interface FilterData {
  open: boolean,
  noElements: number,
  filters: any,
  update: boolean
}


export class DataActions {
  private dataObj: any;
  constructor(dataObj: any) {
    this.dataObj = dataObj;
  }

  sum(field: string) {
    return this.dataObj?.reduce((acc: any, cv: any) => acc + cv[field], 0);
  }
}