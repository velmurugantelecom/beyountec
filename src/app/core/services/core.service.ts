import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { config } from '../config'
@Injectable({
  providedIn: 'root'
})
export class CoreService {

  DevEndpoint: string;
  DevEndpointDbsync: string;
  PaymentEndpoint: string;
  DevEndpointAutoData: string;
  greyImport: string;
  configs = {};
  
  constructor(private http: HttpClient) {
    this.DevEndpoint = environment.DevEndpoint;
    this.DevEndpointDbsync = environment.DevEndpointdbsync;
    this.PaymentEndpoint = environment.PaymentEndpoint;
    this.DevEndpointAutoData = environment.DevEndpointAutoData;
    this.greyImport  = environment.GreyImport;
    this.configs = config;
  }

  getLocalData(url) {
    return this.http.get("assets/json/" + url + ".json");
  }

  greyImportService(serviceAPI, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key])
      }
    }
    let url = `${this.greyImport}${serviceAPI}`;
    return this.http.get(url, {
      params: httpParams
    });
  }

  getInputs(serviceAPI, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.get(url, {
      params: httpParams
    });
  }

  getInputs1(serviceAPI, body: any): Observable<any> {
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.get(url, { responseType: 'text' });
  }
  
  postInputs3(serviceAPI, body: any): Observable<any> {
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.post(url, body,{ responseType: 'text' });
  }

  getInputsDbsync(serviceAPI, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpointDbsync}${serviceAPI}`;
    return this.http.get(url, {
      params: httpParams
    });
  }

  getInputsAutoData(serviceAPI, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpointAutoData}${serviceAPI}`;
    return this.http.get(url, {
      params: httpParams
    });
  }

  postInputs(serviceAPI, body: any, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.post(url, body, {
      params: httpParams
    });
  }

  postInputs1(serviceAPI, body: any): Observable<any> {
    let url = `${this.DevEndpointDbsync}${serviceAPI}`;
    return this.http.post(url, body,{ responseType: 'text' });
  }
  
  postInputs2(serviceAPI, body,params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpointDbsync}${serviceAPI}`;
    return this.http.post(url, body, {
      params: httpParams
    });
  }
  saveInputs(serviceAPI, body: any, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpointDbsync}${serviceAPI}`;
    return this.http.post(url, body);
  }

  updateInputs(serviceAPI, body): Observable<any> {
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.put(url, body);
  }

  delteInputs(serviceAPI): Observable<any> {
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.delete(url);
  }

  dropdownservice(serviceAPI, optionId, productId) {
    let url = `${this.DevEndpoint}${serviceAPI}optionType=${optionId}&productId=${productId}`;
    return this.http.delete(url);
  }

  listOptions(optionId, productId) {
    if (optionId === 'MAKE') return this.listMake();
    if (optionId === 'MOTOR_YEAR') return this.listYear();
    if (optionId == 'NCD_YRS') return this.listClaimYears();
    let url = `${this.DevEndpoint}brokerservice/options/list?optionType=${optionId}&productId=${productId}`;
    return this.http.get(url);
  }

  listMake() {
    let url = `${this.DevEndpoint}brokerservice/vehicledetails/make/findAll`;
    return this.http.get(url);
  }

  listModel(make) {
    let url = `${this.DevEndpoint}brokerservice/vehicledetails/model/find?makeId=${make}`;
    return this.http.get(url);
  }

  listYear() {
    let url = `${this.DevEndpoint}brokerservice/options/list?optionType=MOTOR_YEAR&productId=*`;
    return this.http.get(url);
  }

  listClaimYears() {
    let url = `${this.DevEndpoint}brokerservice/options/list?optionType=NCD_YRS&productId=*`;
    return this.http.get(url);
  }

  public listBody(make, model) {
    let url = `${this.DevEndpoint}brokerservice/vehicledetails/vehicleType/find?modelId=${model}&makeId=${make}`;
    return this.http.get(url);
  }


  listUsage() {
    let url = `${this.DevEndpoint}brokerservice/options/list?optionType=VEH_USAGE&productId=*`;
    return this.http.get(url);
  }

  listRepairType() {
    let url = `${this.DevEndpoint}brokerservice/options/list?optionType=REPAIR_TYPE&productId=*`;
    return this.http.get(url);
  }

  listRegisteredAt() {
    let url = `${this.DevEndpoint}brokerservice/options/list?optionType=REG_AT&productId=*`;
    return this.http.get(url);
  }


  TestInputs(body: any): Observable<any> {

    let url = `${environment.OcrEndpoint}ocr/submitTransaction`;
    return this.http.post(url, body);
  }

  TestInput1(body: any): Observable<any> {

    let url = `${environment.OcrEndpoint}ocr/submitTransaction3`;
    return this.http.post(url, body);
  }



  getDownload(url, params) {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let apiurl = `${this.DevEndpoint}${url}`;

    return this.http.get(apiurl, { params: httpParams, responseType: 'blob' });
  }

  paymentService(quoteNumber) {
    return this.http.post(`${this.PaymentEndpoint}payment/make/payment`, quoteNumber);
  }

  getOptions(url) {
    return this.http.get(this.DevEndpoint + url);
  }
  
  mergeDocument(url) {
    return this.http.get(this.DevEndpoint + url, { responseType: "blob" });
  }
}
