import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Customer360Service } from '../../../customer360.service'
import swal from 'sweetalert'
import { ClaimdetailsComponent } from '../claimdetails.component';
import { DatePipe } from '@angular/common';

import * as _moment from "moment";
const moment = _moment;


@Component({
  selector: 'app-report-aloss',
  templateUrl: './report-aloss.component.html',
  styleUrls: ['./report-aloss.component.scss'],
  providers: [DatePipe]
})
export class ReportALOssComponent implements OnInit {


  ReportaLoss: FormGroup;
  policyarr: any
  currentDate:any;
  navParams: any = {};
  minDate: any;
  minLossDate;
  maxLossDate;
  @ViewChild(ClaimdetailsComponent, { static: false }) ClaimDetail: ClaimdetailsComponent;

  constructor(private datePipe: DatePipe, private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder, private service1: Customer360Service) {
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
      this.currentDate =moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      if (this.policyarr) {
        this.minLossDate = moment(this.policyarr.startDate + " " + "00:00");
        this.maxLossDate = new Date(this.policyarr.endDate);
        if(this.currentDate>=this.maxLossDate){
          this.maxLossDate=this.maxLossDate;
        }
        else{
          this.maxLossDate=this.currentDate;
        }
        
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
      swal(
        data, 'FNOL Created Succcessfully', 'success'
      );

      setTimeout(() => {
        this.customer360();
      }, 3000);
    }, err => {
      swal(
        '', 'Please try again', 'error'
      );
    })
  }
  customer360() {
    this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo } });
  }

  onDateChange(event) {
    this.minDate = this.ReportaLoss.value.lossDate

  }


}
