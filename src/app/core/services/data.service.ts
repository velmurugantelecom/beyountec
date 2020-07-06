import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  userBasicDetails: any = {};

  constructor() { }

  setUserDetails(data) {
      this.userBasicDetails = data;
  }

  getUserDetails() {
      return this.userBasicDetails;
  }
}
