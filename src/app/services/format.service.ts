import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatService {

  constructor() { }

  formatDate(date: Date, backward: boolean = false, firstDay: boolean = false) {
    if(firstDay) {
      if(backward) {
        return `${String(date.getFullYear())}-${String(date.getMonth()).padStart(2,"0")}-01`;
      }else{
        return `01-${String(date.getMonth()).padStart(2,"0")}-${String(date.getFullYear())}`;
      }
    }else{
      if(backward) {
        return `${String(date.getFullYear())}-${String(date.getMonth()).padStart(2,"0")}-${String(date.getDate()).padStart(2, "0")}`;
      }else{
        return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth()).padStart(2,"0")}-${String(date.getFullYear())}`;
      }

    }
  }

  getPastMonths(date: Date, months: number = 3) {
    const dateCopy = new Date(date.getTime());
    const resultMonths: string[] = [];
    const resultDates: string[] = [];
    const monthName: string[] = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
    for(let i = date.getMonth()-months+1; i <= date.getMonth(); i++) {
      resultMonths.push(monthName.at(i) || "")
      dateCopy.setMonth(date.getMonth()-(i - (date.getMonth()-months+1)));
      resultDates.push(this.formatDate(dateCopy, true, true));
      dateCopy.setTime(date.getTime());
    }
    return {
      labels: resultMonths,
      dates: resultDates
    };
  }
}
