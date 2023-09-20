import { Injectable, WritableSignal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AsiVamosService {

  public filterStatus: WritableSignal<FilterData> = signal({open: false, noElements: 0, filters: []});

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
  filters: any
}


export class DataActions {
  private dataObj: any;
  constructor(dataObj: any) {
    this.dataObj = dataObj;
  }

  filterAndOperate(filters: any[], operation: any, field: string) {
    return this.sum(this.filter(filters), field);
  }

  filter(filters: any[]) {
    const filterCriteria = (rec: any): boolean => {
      return filters.every(flt => {
        return rec[flt.field] === flt.value;
      });
    }
    return this.dataObj.filter(filterCriteria);
  }

  sum(records: any[], field: string) {
    return records.reduce((acc, cv) => acc + cv[field], 0);
  }
}