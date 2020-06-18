import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  DevEndpoint
  DevEndpointDbsync
  isUserLoggedIn = new Subject<Boolean>();
  isGuestUser = new Subject<Boolean>();

  constructor(private http: HttpClient, private myRoute: Router) {
    this.DevEndpoint = environment.DevEndpoint;
    this.DevEndpointDbsync = environment.DevEndpointdbsync;
  }


  getToken() {
    return localStorage.getItem("isLoggedIn") == 'true'
  }
  isLoggednIn() {
    return this.getToken() !== null;
  }

  logout() {
    this.isUserLoggedIn.next(false);
    let token = localStorage.getItem('tokenDetails');
    return this.http.get(this.DevEndpoint + 'login/signOut?token=' + token);
  }

  ocall() {
    return this.http.get(this.DevEndpoint + "brokerservice/");
  }

}
