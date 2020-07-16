import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  userBasicDetails: any = {};
  planDetails: any = {};

  constructor() { }

  setUserDetails(data) {
      this.userBasicDetails = data;
  }

  getUserDetails() {
      return this.userBasicDetails;
  }

  setPlanDetails(data) {
    this.planDetails = data;
  }

  getPlanDetails() {
    return this.planDetails;
  }
}
