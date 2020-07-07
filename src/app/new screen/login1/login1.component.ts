import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { CoreService } from '../../core/services/core.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import * as _moment from "moment";
const moment = _moment;
import { ToastrService } from 'ngx-toastr';
import { DropDownService } from 'src/app/core/services/dropdown.service';
import { MessagePopupComponent } from 'src/app/modal/message-popup/message-popup.component';
import { AppService } from 'src/app/core/services/app.service';
import { MatDialog, MatStepper, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-login1',
  templateUrl: './login1.component.html',
  styleUrls: ['./login1.component.scss']
})
export class NewLoginScreen implements OnInit {


  public showTab: string = 'login';
  public LoginForm: FormGroup;
  public infoForm: FormGroup;
  public showPassword = false;
  public autoDataURL = '';
  public invalidChassisNo: boolean;
  public invalidEmail: boolean;
  public radioError: boolean;
  public options = {};
  public isRevisedDetail: boolean;

  constructor(private dropdownservice: DropDownService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private authService: AuthService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private dataService: DataService) {
    router.events.forEach(event => {
      if (event instanceof NavigationEnd) {
        this.showTab = event.url.slice(1).split("/")[0];
      }
    });

    this.route.queryParams
      .subscribe(params => {
        if (params['reviseDetails']) {
          this.isRevisedDetail = true;
        }
      });
  }

  patchBasicDetails() {
    this.infoForm.patchValue(this.dataService.getUserDetails())
  }

  ngOnInit() {
    this.LoginForm = this.formBuilder.group({
      userName: ['', [Validators.required,]],
      password: ['', [Validators.required,]],
    });
    this.infoForm = this.formBuilder.group({
      productType: ['', Validators.required],
      mobileCode: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.minLength(7),
      Validators.maxLength(7)]],
      email: ['', [Validators.required, Validators.email]],
    });
    if (!this.isRevisedDetail) {
      this.guestUserCall();
    }
    else {
      this.patchBasicDetails();
      this.loadDropdownValues();
    }
  }

  guestUserCall() {
    this.spinner.show();
    localStorage.removeItem('tokenDetails');
    localStorage.removeItem('Username');
    localStorage.removeItem('guesttokenDetails');
    localStorage.removeItem('isLoggedIn');
    let value = {
      guestUser: true
    }
    this.coreService.postInputs('login/signIn', value, {}).subscribe(response => {
      let data = response.data;
      localStorage.setItem('guesttokenDetails', data.token);
      localStorage.setItem('isLoggedIn', 'false');
      this.authService.isGuestUser.next(true);
      this.loadDropdownValues();
    });
  }

  loadDropdownValues() {
    this.dropdownservice.getInputs('brokerservice/options/product/list', '').subscribe((response: any) => {
      this.options['products'] = response.data;
    });
    this.coreService.listOptions('MOBILE_CON_CODE', '*').subscribe(response => {
      this.options['mobileCode'] = response['data'];
      this.infoForm.patchValue({
        mobileCode: response['data'][0].value
      });
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
    });
  }

  submitForm() {
    localStorage.removeItem('tokenDetails');
    localStorage.removeItem('Username');
    localStorage.removeItem('guesttokenDetails');
    localStorage.removeItem('isLoggedIn');
    if (this.LoginForm.status == 'INVALID') {
      return
    }
    let value = this.LoginForm.value;
    this.coreService.postInputs('login/signIn', value, {}).subscribe(response => {
      let data = response.data;
      localStorage.setItem('tokenDetails', data.token);
      localStorage.setItem('Username', data.userName)
      localStorage.setItem('isLoggedIn', 'true');
      this.authService.isUserLoggedIn.next(true);
      this.authService.isGuestUser.next(false);
      this.dataService.setUserDetails({})
      this.router.navigate([`/User/dashboard`]);
    });
  }

  get formCtrls() {
    return this.infoForm.controls;
  }

  getMotorInfo(): void {
    let value = {
      emailId: this.infoForm.value['email']
    }
    this.coreService.getInputs(`brokerservice/user/existsByEmail`, value).subscribe(res => {
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
          this.LoginForm.get('userName').setValue(this.infoForm.get('email').value);
          this.LoginForm.get('password').reset();
        });
      } else {
        if (this.infoForm.value.productType === '') {
          this.radioError = true;
        }
        if (this.infoForm.status == 'INVALID') {
          return;
        } else {
          this.saveAuditData();
          this.dataService.setUserDetails(this.infoForm.value)
          this.router.navigate(['/new-motor-info'])
        }
      }
    });
  }

  saveAuditData() {
    let body = {
      email: this.infoForm.value['email'],
      mobNo: this.infoForm.value['mobileNo'],
      loginSrc: 'CP'
    }
    this.coreService.postInputs2('audit/users', body, '');
  }

  selectOption(value) {
    this.radioError = false;
    if (value.value === '1113') {
      this.autoDataURL = 'ae/findByChassisNoWithPrice';
    } else {
      this.autoDataURL = 'ae/findByChassisNo'
    }
  }

  ForgotNavigate() {
    this.router.navigate([`/forgotPwd`]);
  }

  showHidePwd(value) {
    let x: any = document.getElementById(`${value}`);
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  retrieveQuote(Type: string, Title: string): void {
    let dialogRef = this.dialog.open(QuoteDialog, {
      width: '500px',
      data: { QType: Type, QTitle: Title }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}


// dialoguecomponent
@Component({
  selector: 'Quotedialog',
  templateUrl: '../../home/Quotedialog.html',
  styles: [`
 
.closeicon_css {
  position: relative;
  
  cursor: pointer;
}
  `]
})
export class QuoteDialog {
  dialogeDetails: any;
  public quoteForm: FormGroup;
  OtpForm: FormGroup;
  token: any;
  public minutes;
  public seconds;
  public totalMs;
  public doTimeout: boolean = false;
  constructor(private service: CoreService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<QuoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data,
    private builder: FormBuilder,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.quoteForm = this.builder.group({
      type: ['', Validators.required],
    });
    this.OtpForm = this.builder.group({
      otp: ['', Validators.required]
    });
  }


  sendEmail(stepper) {
    if (this.quoteForm.invalid) {
      return
    }
    this.spinner.show();
    this.service.getInputs1(`brokerservice/quotes/confirmQuoteRetrieval?quoteNo=${this.dialogeDetails}`, '').subscribe(response => {
      if (response) {
        this.goForward(stepper)
        this.token = response;
        this.minutes = 2;
        this.seconds = 0;
        this.totalMs = 120000;
        this.showTimer();
      }
      this.spinner.hide();
    });
  }

  verifyOtp() {
    if (this.OtpForm.status === 'INVALID')
      return;
    this.service.getInputs1(`brokerservice/quotes/validateOtp?token=${this.token}&otp=${this.OtpForm.value['otp']}`, '').subscribe(response => {
      console.log(response)
      if (response == 'true') {
        this.dialogRef.close();
        this.router.navigate([`/additional-details`], {
          queryParams: {
            quoteNo: this.dialogeDetails,
            retrieveQuote: true
          }
        });
      }
    });
  }

  showTimer() {
    setInterval(() => {
      if (this.totalMs >= 0) {
        this.minutes = Math.floor((this.totalMs % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((this.totalMs % (1000 * 60)) / 1000);
      }
      this.totalMs = this.totalMs - 1000;
      if (this.totalMs === 0) {
        this.doTimeout = true;
      }
    }, 1000)
  }

  stopTimer() {
    this.doTimeout = false;
  }
  goForward(stepper: MatStepper) {
    stepper.next();
  }
}
