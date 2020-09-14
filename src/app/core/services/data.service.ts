import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  userBasicDetails: any = {};
  vehicleDetails: any = {};
  planDetails: any = {};
  email:any='';
  motorPageLoaderContent:any;

  constructor() { }

  setUserDetails(data) {
      this.userBasicDetails = data;
  }

  getUserDetails() {
      return this.userBasicDetails;
  }

  setPlanDetails(data) {
    console.log(data)
    this.planDetails = data;
  }

  getPlanDetails() {
    return this.planDetails;
  }

  setVehicleDetails(data) {
    this.vehicleDetails = data;
  }

  getVehicleDetails() {
    return this.vehicleDetails;
  }
  setEmailDetails(data) {
    this.email = data;
}

getEmailDetails() {
    return this.email;
}
setMotorPageLoaderContent(data) {
  this.motorPageLoaderContent = data;
}
getMotorPageLoaderContent() {
  return this.motorPageLoaderContent;
}
}
