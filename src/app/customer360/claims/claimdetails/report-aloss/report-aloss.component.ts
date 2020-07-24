import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Customer360Service } from '../../../customer360.service'
import { ToastrService } from 'ngx-toastr';
import { ClaimdetailsComponent } from '../claimdetails.component';

import * as _moment from "moment";
const moment = _moment;


@Component({
  selector: 'app-report-aloss',
  templateUrl: './report-aloss.component.html',
  styleUrls: ['./report-aloss.component.scss']
})
export class ReportALOssComponent implements OnInit {


  ReportaLoss: FormGroup;
  policyarr: any
  navParams: any = {};
  minDate: any;
  minLossDate;
  maxLossDate;
  @ViewChild(ClaimdetailsComponent, { static: false }) ClaimDetail: ClaimdetailsComponent;

  constructor(private toastr: ToastrService, private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder, private service1: Customer360Service) {
    // this.navParams = this.router.getCurrentNavigation().extras.state;
    this.route.queryParams
      .subscribe(params => {
        this.navParams['policyNo'] = params['policyNo'];
        this.navParams['productid'] = params['productid'];
      })


  }

  ngOnInit() {


    this.ReportaLoss = this.formBuilder.group({
      policyNo: [[Validators.required,]],
      lossDate: ['', [Validators.required,]],
      intimatedDate: ['', [Validators.required,]],
      lossDescription: ['', [Validators.required,]],
      policeStation: ['', [Validators.required,]],
      policeReportNo: ['', [Validators.required,]],
      lossLocation: ['', [Validators.required,]],
      atFault: ['', [Validators.required,]]
    });

    this.service1.ongetpolicyno.subscribe((data) => {
      this.policyarr = data.data;
      if (this.policyarr) {
        this.minLossDate = moment(new Date(this.policyarr.startDate)).subtract(1, 'd')
        this.maxLossDate = new Date(this.policyarr.endDate);
      }
    })
  }
  ngAfterViewInit() {
    this.ReportaLoss.patchValue({ policyNo: this.navParams['policyNo'] })
  }
  onsubmit() {
    if (this.ReportaLoss.status == 'INVALID') {
      return
    }

    let value = this.ReportaLoss.value;
    this.service1.reportaloss(value).subscribe((data) => {
      this.toastr.success(data, 'FNOL Created Succcessfully', {
        timeOut: 2000
      });

      setTimeout(() => {
        this.customer360();
      }, 3000);
    }, err => {
      this.toastr.error('Please try again');
    })
  }
  customer360() {
    this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo } });
  }

  onDateChange(event) {
    this.minDate = this.ReportaLoss.value.lossDate

  }


}
