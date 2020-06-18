import { Component, OnInit } from '@angular/core';
import { Customer360Service } from '../../customer360.service';
@Component({
  selector: 'app-drivertab',
  templateUrl: './drivertab.component.html',
  styleUrls: ['./drivertab.component.scss']
})
export class DrivertabComponent implements OnInit {

  constructor(private service1: Customer360Service) { }
  driverdetails: any;
  tcfilenumber: number;
  ngOnInit() {
    this.service1.ongetpolicyno.subscribe(value => {
      if (value.length != 0) {
        this.driverdetails = value.data.drivers[0];
      }
      this.tcfilenumber = value.data.vehicleDetails.tcFileNumber;
    }, err => {
    })
  }
}
