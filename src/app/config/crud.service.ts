import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { url } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private httpClient: HttpClient) { } 

  getData(body: string) {
    return this.httpClient.post<any>(`${url}/grid2`, body);
  }

  getRecords(director: number, periodo: string, categ: string, filters: any) {
    return this.httpClient.post<any>(`https://www.brinsadigital.com.co/asivamos-api/asivamos/${director}/${periodo}/${categ}`, filters)
  }

  getClients(match: string, limit: number) {
    return this.httpClient.get<any>(`https://www.brinsadigital.com.co/asivamos-api/cliente/${match}/${limit}`)
  }

  getProducts(match: string, limit: number) {
    return this.httpClient.get<any>(`https://www.brinsadigital.com.co/asivamos-api/producto/${match}/${limit}`)
  }
}
