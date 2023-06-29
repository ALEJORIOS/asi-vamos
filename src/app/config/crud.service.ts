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
}