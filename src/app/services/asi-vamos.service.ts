import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AsiVamosService {


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
