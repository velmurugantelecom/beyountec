import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Customer360Service } from '../../../customer360.service';
import { ToastrService } from 'ngx-toastr';
import { ViewChild, AfterViewInit, } from '@angular/core';
import { MatDatepicker } from '@angular/material';
import { Moment } from 'moment';
import * as moment from 'moment';
@Component({
  selector: 'app-req-for-endorsment',
  templateUrl: './req-for-endorsment.component.html',
  styleUrls: ['./req-for-endorsment.component.scss']
})
export class ReqForEndorsmentComponent implements OnInit {

  public dateTime: Date;
  @ViewChild(MatDatepicker, { static: false }) picker: MatDatepicker<Moment>;
  isValidMoment: boolean = false;

  endorsmentreq: FormGroup;
  options: any = {};
  navParams: any = {};

  public minEffectiveDate;
  public maxEffectiveDate;
  constructor(

    private toastr: ToastrService,
    private router: Router,
    private formBuilder: FormBuilder,
    private service: Customer360Service,
    private route: ActivatedRoute,
  ) {


    // this.navParams = this.router.getCurrentNavigation().extras.state;

    this.route.queryParams
      .subscribe(params => {
        this.navParams['policyNo'] = params['policyNo'];
        this.navParams['productid'] = params['productid'];
      })


  }

  ngOnInit() {


    this.endorsmentreq = this.formBuilder.group({
      policyNo: ['', [Validators.required]],
      emailid: ['', [Validators.required]],
      mobileNo: ['', [Validators.required]],
      remarks: ['', [Validators.required]],
      reason: ['', [Validators.required]],
      subType: ['', [Validators.required]],
      effectivedate: ['', [Validators.required]],
      type: ['', [Validators.required]]
    });

    this.endorsmentreq.patchValue({ policyNo: this.navParams.policyNo });
    this.service.ongetpolicyno.subscribe((value: any) => {
      if (value.data != undefined) {
        this.endorsmentreq.patchValue({
          emailid: value.data.userDetails.email,
          mobileNo: value.data.userDetails.mobileNo
        });

        //setting min and max date for effective date
        this.minEffectiveDate = moment(new Date(value.data.startDate)).subtract(1, 'd')
        this.maxEffectiveDate = new Date(value.data.endDate);
      }

      this.getreasonforchange();
      this.gettype();
    });
  }

  ngAfterViewInit() {
    this.picker._selectedChanged.subscribe(
      (newDate: Moment) => {
        this.isValidMoment = moment.isMoment(newDate);
      },
      (error) => {
        throw Error(error);
      }
    );
  }

  getreasonforchange() {
    let url = `options/list`;
    let values = { optionType: 'E001', productId: this.navParams.productid };
    this.service.getdropdownvaluesdbsync(url, values).subscribe((data: any) => {
      this.options['reasonForChange'] = data;
    });
  }

  gettype() {
    let url = `endorsement/findEndorsementType`;
    let values = {
      productId: this.navParams.productid
    };
    this.service.getdropdownvaluesdbsync(url, values).subscribe((data: any) => {
      this.options['endorsmentType'] = data;
    });
  }

  getsubtype(endorsmentId) {
    let url = `endorsement/findEndorsementSubType`;
    let values = {
      productId: this.navParams.productid,
      endorsementTypeId: endorsmentId.value
    };
    this.service.getdropdownvaluesdbsync(url, values).subscribe((data: any) => {
      this.options['endorsmentSubType'] = data;
    });
  }

  onsubmit() {
    if (this.endorsmentreq.status == 'INVALID') {

      return
    }
    let values = this.endorsmentreq.value;
    this.service.requestForEndorsement(values).subscribe(
      (data: any) => {
        this.toastr.success(data);

        setTimeout(() => {

          this.customer360();
        }, 2000);
      },
      err => {
      }
    );
  }

  customer360() {
    this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo } });
  }
  policyPage() {
    this.router.navigate(['/User/dashboard']);
  }

}
