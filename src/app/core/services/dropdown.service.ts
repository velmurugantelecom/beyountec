import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { config } from '../config';

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
  constructor(private http: HttpClient) {
    this.DevEndpoint = environment.DevEndpoint;
    this.DevEndpointDbsync = environment.DevEndpointdbsync;
    this.PaymentEndpoint = environment.PaymentEndpoint;
    this.DevEndpointAutoData = environment.DevEndpointAutoData;
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
