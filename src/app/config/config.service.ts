import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  url: string = "https://www.brinsadigital.com.co/api-datax"

  

  constructor() { }
}

export const url: string = "https://www.brinsadigital.com.co/api-datax";