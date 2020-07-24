import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Customer360Service } from '../../customer360.service';

@Component({
  selector: 'app-insuredtab',
  templateUrl: './insuredtab.component.html',
  styleUrls: ['./insuredtab.component.scss']
})
export class InsuredtabComponent implements OnInit {

  constructor(private service1: Customer360Service) { }
  insureddetails: any;
  insuredsub: Subscription;
  customertype: any;
  ngOnInit() {

    this.insuredsub = this.service1.ongetpolicyno.subscribe(value => {
      if (value.length != 0) {
        this.insureddetails = value.data.userDetails;
        
        this.customertype = value.data.customerType;
      }
    }, err => {
    })
  }






}
