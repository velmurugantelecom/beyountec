import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
  export class RuntimeConfigService {
    config: any;
  
    constructor(private http: HttpClient) {}
  
    loadConfig() {
      return this.http
        .get<any>('./assets/RuntimeConfig.json')
        .toPromise()
        .then(config => {
          this.config = config;
        });
    }
  }