import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Customer360Service } from '../../../customer360.service'
import swal from 'sweetalert'
import { ClaimdetailsComponent } from '../claimdetails.component';
import { DatePipe } from '@angular/common';

import * as _moment from "moment";
import { bindCallback } from 'rxjs';
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
  maxIntimatedDate:any;
  public selectedLossDate:any;
  public selectedIntimatedDate:any;
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
        this.minLossDate = moment(new Date(this.policyarr.startDate)).format("YYYY-MM-DD");
       // this.minLossDate = moment(new Date(this.policyarr.startDate));
        //this.minLossDate = moment(this.policyarr.startDate + " " + "00:00");
        this.maxLossDate = new Date(this.policyarr.endDate);
        this.maxIntimatedDate=new Date(this.policyarr.endDate);
        if(this.currentDate>=this.maxLossDate){
          this.maxLossDate=this.maxLossDate;
        }
        else{
          this.maxLossDate=this.currentDate;
        }
        
      }
    })
  }
  isMyDateFormat(date: string): string {
    this.selectedLossDate=date;
    let selectedLossDateChanged=this.dateConversion(this.selectedLossDate);
    let selectedminLossDateChanged=this.dateConversion(this.minLossDate) ;
    let selectedmaxLossDateChanged=this.dateConversion(this.maxLossDate);
    if (date.length !== 10) {
      return 'Please enter valid input';
    } else {
     if (selectedminLossDateChanged > selectedLossDateChanged) {
        return 'Loss date cannot be less than Policy period';
      } else if (selectedmaxLossDateChanged <  selectedLossDateChanged) {
        return 'Loss date should be current date or less than the current date';
      }
    }
   // return 'Unknown error.';
  }
  getErrorMessage(pickerInput: string): string {
    if (!pickerInput || pickerInput === '' ) {
      return 'Loss Date is required';
    }
    return this.isMyDateFormat(pickerInput);
  }
  getIntimatedDateErrorMessage(pickerInput1: string): string {
    if (!pickerInput1 || pickerInput1 === '' ) {
      return 'Intimated Date is required';
    }
    return this.isMyIntimatedDateFormat(pickerInput1);
  }


  isMyIntimatedDateFormat(date: string): string {
    this.selectedIntimatedDate=date;
    let selectedLossDateChangedFormat=this.dateConversion(this.selectedLossDate);
    let selectedIntimatedDateChangedFormat=this.dateConversion(this.selectedIntimatedDate) ;
    let selectedMaxIntimatedDateChangedFormat=this.dateConversion(this.maxIntimatedDate);
    if (date.length !== 10) {
      return 'Please enter valid input';
    } else {
     if ( selectedLossDateChangedFormat > selectedIntimatedDateChangedFormat) {
        return 'Intimated date cannot be less than Loss date';
      } else if (selectedMaxIntimatedDateChangedFormat < selectedIntimatedDateChangedFormat) {
        return 'Intimated date cannot be greater than policy period';
      }
    }
   // return 'Unknown error.';
  }
  dateConversion(date: any) {
    function formatDate(date) {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      return [year, month, day].join('-');
    }
    return formatDate(date);
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
  policyPage() {
    this.router.navigate(['/User/dashboard']);
  }

  onDateChange(event) {
    this.minDate = this.ReportaLoss.value.lossDate

  }


}
