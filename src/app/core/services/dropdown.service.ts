import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { config } from '../config';
import { RuntimeConfigService } from './runtime-config.service';

@Injectable({
  providedIn: 'root'
})
export class DropDownService {

  DevEndpoint: string;
  DevEndpointDbsync: string;
  PaymentEndpoint: string;
  DevEndpointAutoData: string;
  languageLable:string='language';
  configs = {};
  constructor(private http: HttpClient,
    private configService: RuntimeConfigService) {
    this.DevEndpoint = configService.config.DevEndpoint;
    this.DevEndpointDbsync = configService.config.DevEndpointdbsync;
    this.PaymentEndpoint = configService.config.PaymentEndpoint;
    this.DevEndpointAutoData = configService.config.DevEndpointAutoData;
    this.configs = config;
  }
  getInputs(serviceAPI, params): Observable<any> {
   let  languageValue=localStorage.getItem("language");
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    httpParams=httpParams.append(
      this.languageLable,languageValue
      );
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.get(url, {
      params: httpParams
    });
  }


      // get policy by emiratesid
      getpolicy(params): Observable<any> {
        let  languageValue=localStorage.getItem("language");
        let httpParams = new HttpParams();
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
        httpParams=httpParams.append(
          this.languageLable,languageValue
          );
        let url = `${this.DevEndpoint}brokerservice/search/policies/findAll`
        return this.http.get(url, { params: httpParams })
    }





}
