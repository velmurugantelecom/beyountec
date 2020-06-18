import { Component, OnInit } from '@angular/core';
import { Customer360Service } from '../../customer360.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-vehicletab',
  templateUrl: './vehicletab.component.html',
  styleUrls: ['./vehicletab.component.scss']
})
export class VehicletabComponent implements OnInit {

  constructor(private service1: Customer360Service) { }
  vehicledetails: any;
  onVehiclesub: Subscription;


  ngOnInit() {

    this.onVehiclesub = this.service1.ongetpolicyno.subscribe(value => {
      if (value.length != 0) {
        this.vehicledetails = value.data.vehicleDetails;
      }
    }, err => {
    })
  }

}
