import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Customer360Service } from '../../customer360.service';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-paymenttabs',
  templateUrl: './paymenttabs.component.html',
  styleUrls: ['./paymenttabs.component.scss']
})
export class PaymenttabsComponent implements OnChanges {
  subscriptionDetail: any = []
  @Input("policyNo") paydetails: any = [];
  constructor(private service1: Customer360Service,private spinner: NgxSpinnerService) { }

  ngOnChanges() {
    if (this.paydetails.policyNo) {
      this.service1.getpay({ refNo: this.paydetails.policyNo }).subscribe(data => {
        this.subscriptionDetail = data;
      })
    }

  }

}
