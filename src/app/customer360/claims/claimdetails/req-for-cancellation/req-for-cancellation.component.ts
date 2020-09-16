import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Customer360Service } from '../../../customer360.service';
import { ClaimdetailsComponent } from '../claimdetails.component';
import * as _moment from "moment";
import swal from 'sweetalert'
const moment = _moment;

@Component({
  selector: 'app-req-for-cancellation',
  templateUrl: './req-for-cancellation.component.html',
  styleUrls: ['./req-for-cancellation.component.scss']
})
export class ReqForCancellationComponent implements OnInit, AfterViewInit {
  cancelReq: FormGroup;
  public language: any;
  options: any = {};
  navParams: any = {};
  public minEffectiveDate;
  public maxEffectiveDate: Date;
  @ViewChild(ClaimdetailsComponent, { static: false }) ClaimDetail: ClaimdetailsComponent;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private service: Customer360Service) {
    // this.navParams = this.router.getCurrentNavigation().extras.state;

    this.route.queryParams
      .subscribe(params => {
        this.navParams['policyNo'] = params['policyNo'];
        this.navParams['productid'] = params['productid'];
      })



  }

  ngOnInit() {

    this.cancelReq = this.formBuilder.group({
      policyNo: ['', [Validators.required,]],
      reason: ['', [Validators.required,]],
      remarks: ['', [Validators.required,]],
      effectiveDate: ['', [Validators.required,]],
      contactme: ['', [Validators.required,]],
      emailid: ['', [Validators.required,]]
    });

    this.service.ongetpolicyno.subscribe((value: any) => {
      if (value.data != undefined) {
        this.cancelReq.patchValue({ emailid: value.data.userDetails.email, contactme: value.data.userDetails.mobileNo })

        //setting min and max date for effective date
        this.minEffectiveDate = moment(new Date(value.data.startDate)).format("YYYY-MM-DD");
        this.maxEffectiveDate = new Date(value.data.endDate);
      }

    })
    this.getReasons();
    this.language = localStorage.getItem("language");
  }

  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }

  getReasons() {
    let url = `options/list`
    let values = {
      optionType: "E001", productId: this.navParams.productid
    }
    this.service.getdropdownvaluesdbsync(url, values).subscribe((data: any) => {
      this.options['reasonForChange'] = data;
    })
  }

  ngAfterViewInit() {
    this.cancelReq.patchValue({ policyNo: this.ClaimDetail.policyarr.policyNo })
  }

  onsubmit() {

    if (this.cancelReq.status == 'INVALID') {
      return
    }
    let values = this.cancelReq.value;

    this.service.requestForCancellation(values).subscribe((data: any) => {
      swal(
        '', data, 'success'
      );
      setTimeout(() => {

        this.customer360();
      }, 2000);
    });
  }


  get formCtrls() {
    return this.cancelReq.controls;
  }

  onDateChange(event) {
  }



  customer360() {
    this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo } });
  }
  policyPage() {
    this.router.navigate(['/User/dashboard']);
  }
}
