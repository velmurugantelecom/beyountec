import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppService } from '../core/services/app.service';
import { ToastrService } from 'ngx-toastr';
import { CoreService } from '../core/services/core.service';
import { DropDownService } from '../core/services/dropdown.service';
import { MatDialog } from '@angular/material';
import { MessagePopupComponent } from '../modal/message-popup/message-popup.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-get-quote',
  templateUrl: './get-quote.component.html',
  styleUrls: ['./get-quote.component.scss']
})
export class GetQuoteComponent implements OnInit {

  options: any = [];
  QuoteType: any
  public carType: string
  public infoForm: FormGroup;
  public chassisForm: FormGroup;
  public RenewalForm: FormGroup;
  public isFormSubmited: boolean;
  public chassisNo: string;
  public isValidChassisNo: boolean;
  public radioError: boolean;
  public dialogeDetails: any;
  public dropdownOptions: any;
  public autoDataURL = '';
  public invalidChassisNo: boolean;
  public invalidEmail: boolean;

  constructor(private router: Router, private formBuilder: FormBuilder,
    private service: CoreService,
    private route: ActivatedRoute,
    private appService: AppService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private dropdownservice: DropDownService) {
    this.route.queryParams
      .subscribe(params => {
        this.QuoteType = params['Type'];
      });
  }

  ngOnInit() {
    this.appService.setuserDetails(null);
    this.infoForm = this.formBuilder.group({
      productType: ['', Validators.required],
      mobileCode: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.minLength(7),
      Validators.maxLength(7)]],
      email: ['', [Validators.required, Validators.email]],
      chassisNo: ['', Validators.required]
    });
    this.RenewalForm = this.formBuilder.group({
      chassisNo: ['', Validators.required],
      tcNo: ['', Validators.required]
    });
    this.service.listOptions('MOBILE_CON_CODE', '*').subscribe(response => {
      this.options['mobileCode'] = response['data'];
      this.infoForm.patchValue({
        mobileCode: response['data'][0].value
      });
    });
    this.dropdownservice.getInputs('brokerservice/options/product/list', '').subscribe((response: any) => {
      this.dropdownOptions = response.data;
    });
  }

  selectCarType(event: any) {
    this.carType = event.target.value;
  }

  get formCtrls() {
    return this.infoForm.controls;
  }

  getQuote(): void {
    this.spinner.show();
    let value = {
      ...this.infoForm.value
    }
    this.appService.setuserDetails(value);
    let params = {
      chassisNo: this.infoForm.value.chassisNo
    }
    this.service.getInputsAutoData(this.autoDataURL, params).subscribe(res => {
      this.appService.setVehicleAutoData(res);
      this.spinner.hide();
      this.router.navigate(['/motor-info']);
    }, err => {
      console.log(err)
      this.invalidChassisNo = true;
      this.infoForm.controls['chassisNo'].setErrors({ 'incorrect': true });
    });
  }

  selectOption(value) {
    this.radioError = false;
    if (value.value === '1113') {
      this.autoDataURL = 'ae/findByChassisNoWithPrice';
    } else {
      this.autoDataURL = 'ae/findByChassisNo'
    }
  }

  goBack(): void {
    this.isFormSubmited = false;
  }

  getChassisNumber(): void {
    let value = {
      emailId: this.infoForm.value['email']
    }
    this.service.getInputs(`brokerservice/user/existsByEmail`, value).subscribe(res => {

      if (res == true) {
        this.invalidEmail = true;
        let dialogRef = this.dialog.open(MessagePopupComponent, {
          width: '400px',
          data: {
            title: 'Try Login',
            body: `Email address is aldready Exist. Try Login.`
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result)
          this.router.navigate([`/Login`]);
        });
      } else {

        if (this.infoForm.value.productType === '') {
          this.radioError = true;
        }
        if (this.infoForm.status == 'INVALID') {
          return;
        } else {
          this.saveAuditData();
          this.getQuote();
        }
      }
    });
  }

  saveAuditData() {
    let body = {
      email: this.infoForm.value['email'],
      mobNo: this.infoForm.value['mobileNo'],
      loginSrc:'CP'
    }
    this.service.postInputs2('audit/users', body, '').subscribe(res => {

    })
  }

  RenewalSubmit() {
    if (this.RenewalForm.status == 'INVALID') {
      return
    }
    this.service.getInputsDbsync('validateChassisNoAndTcNo', this.RenewalForm.value).subscribe((response) => {
      if (response.responseCode == -1) {
        let value = {
          ...this.RenewalForm.value
        }
        this.appService.setuserDetails(value);
        this.router.navigate([`/get-qoute`], { queryParams: { Type: 'New-Quote' } });
      } else {
        let dialogRef = this.dialog.open(MessagePopupComponent, {
          width: '400px',
          data: {
            title: 'Renew Quote',
            body: `Our customer support will contact you for renewal processing`
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          this.router.navigate([`/home`]);
        });
      }
    });
  }

  navigate() {
    let value = {
      ...this.infoForm.value,
      chassisNo: this.chassisForm.value.chassisNo
    }
    this.appService.setuserDetails(value);
    this.router.navigate(['/motor-info']);
  }
}
