import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { CoreService } from '../core/services/core.service';
import { AuthService } from '../core/services/auth.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import * as _moment from "moment";
const moment = _moment;
import { ToastrService } from 'ngx-toastr';
import { DropDownService } from 'src/app/core/services/dropdown.service';
import { MessagePopupComponent } from 'src/app/modal/message-popup/message-popup.component';
import { MatDialog, MatStepper, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from 'src/app/core/services/data.service';
import { Subscription } from 'rxjs';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';

function confirmPassword(control: AbstractControl) {
  if (!control.parent || !control) {
    return;
  }
  if (control.parent.get('password').value !== control.parent.get('confirmPassword').value) {
    return {
      passwordsNotMatch: true
    };
  }
}

@Component({
  selector: 'app-login1',
  templateUrl: './login1.component.html',
  styleUrls: ['./login1.component.scss']
})
export class NewLoginScreen implements OnInit, OnDestroy {


  public formType: string = 'login';
  public LoginForm: FormGroup;
  public infoForm: FormGroup;
  public ForgotForm: FormGroup;
  public OtpForm: FormGroup;
  public PasswordForm: FormGroup
  public showPassword = false;
  public autoDataURL = '';
  public invalidChassisNo: boolean;
  public invalidEmail: boolean;
  public radioError: boolean;
  public options = {};
  public isRevisedDetail: boolean;
  public isResetLinkSend: boolean;
  public PwdSopList = [];
  public routerToken: any;
  public minutes = 2;
  public seconds = 0;
  public totalMs = 120000;
  public doTimeout: boolean = false;
  public subscription: Subscription
  public runtimeConfig;
  public captchaIsLoaded = false;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;
  public email;
  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'en';
  public type: 'image' | 'audio';
  public isValidForm: boolean;
  public routes = [
    'new-login',
    'new-motor-info',
    'compare-plans',
    'quote-summary',
    'additional-details',
    'payment-succeed',
    'payment-failed',
    'resetPassword',
    'contact-message',
    'forgotPwd',
    'User',
    'Customer360',
    ''
  ]
  constructor(private dropdownservice: DropDownService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private authService: AuthService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private dataService: DataService,
    private toastr: ToastrService,
    public runtimeConfigService: RuntimeConfigService) {
    router.events.forEach(event => {
      if (event instanceof NavigationEnd) {
        this.formType = event.url.slice(1).split("/")[0];
        console.log(this.formType)
        if (this.formType.includes('new-login') || this.formType === '')
          this.formType = 'new-login';
        if (this.formType.includes('resetPassword')) {
          this.formType = 'resetPassword';
          this.routerToken = event.url.slice(1).split("/")[1];
        }
        let res;
         this.routes.filter(val => {
          if (val === this.formType)
          res = true;
        });
        console.log(res);
        if (!res) {
          this.formType = 'new-login'
        }
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
    this.runtimeConfig = this.runtimeConfigService.config;
    this.LoginForm = this.formBuilder.group({
      userName: ['', [Validators.required,]],
      password: ['', [Validators.required,]]
   //   recaptcha: ['', Validators.required]
    });
    this.infoForm = this.formBuilder.group({
      productType: ['', Validators.required],
      mobileCode: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.minLength(7),
      Validators.maxLength(7)]],
      email: ['', [Validators.required, Validators.email]],
    });
    this.ForgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.OtpForm = this.formBuilder.group({
      otp: ['', [Validators.required,]],
    });
    this.PasswordForm = this.formBuilder.group({
      userName: [{ value: '', disabled: true }, [Validators.required,]],
      password: ['', [Validators.required,]],
      confirmPassword: ['', [Validators.required, confirmPassword]],
    });
    if (this.routerToken) {
      this.getOtp();
    }
    if (!this.isRevisedDetail) {
      this.guestUserCall();
    }
    else {
      this.patchBasicDetails();
      this.loadDropdownValues();
    }
    if (this.runtimeConfig.Environment === 'QC') {
      this.LoginForm.get('recaptcha').setValidators([]);
      this.LoginForm.get('recaptcha').updateValueAndValidity();
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
    this.subscription = this.coreService.postInputs('login/signIn', value, {}).subscribe(response => {
      let data = response.data;
      localStorage.setItem('guesttokenDetails', data.token);
      localStorage.setItem('isLoggedIn', 'false');
      this.authService.isGuestUser.next(true);
      this.loadDropdownValues();
    });
  }

  loadDropdownValues() {
    this.subscription = this.dropdownservice.getInputs('brokerservice/options/product/list', '').subscribe((response: any) => {
      this.options['products'] = response.data;
    });
    this.subscription = this.coreService.listOptions('MOBILE_CON_CODE', '*').subscribe(response => {
      this.options['mobileCode'] = response['data'];
      this.infoForm.patchValue({
        mobileCode: response['data'][0].value
      });
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
    });
  }

  handleSuccess(event) {
    this.isValidForm = false;
  }
  submitForm() {
    localStorage.removeItem('tokenDetails');
    localStorage.removeItem('Username');
    localStorage.removeItem('guesttokenDetails');
    localStorage.removeItem('isLoggedIn');
    if (this.LoginForm.status == 'INVALID') {
      this.isValidForm = true;
      return
    }
    let value = this.LoginForm.value;
    this.subscription = this.coreService.postInputs('login/signIn', value, {}).subscribe(response => {
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
    this.subscription = this.coreService.getInputs(`brokerservice/user/existsByEmail`, value).subscribe(res => {
      if (res == true) {
        this.invalidEmail = true;
        let dialogRef = this.dialog.open(MessagePopupComponent, {
          width: '400px',
          data: {
            for: 'emailAlreadyExist',
            title: 'Try Login',
            body: `Your account already exists, please login with you credentials.`
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log(result)
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
    this.subscription = this.coreService.postInputs2('audit/users', body, '').subscribe(res => {
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

  ForgotNavigate() {
    this.router.navigate(['/forgotPwd'])
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

  forgotPwd() {
    if (this.ForgotForm.status === 'INVALID') {
      return;
    }
    this.spinner.show();
    this.subscription = this.coreService.postInputs3(`brokerservice/user/forgotPassword?emailId=${this.ForgotForm.value.email}`, '').subscribe(res => {
      this.spinner.hide();
      this.isResetLinkSend = true;
      this.email = this.ForgotForm.value.email;
    }, err => {
      this.spinner.hide();
    });
  }

  resetPwd() {
    if (!this.PasswordForm.valid) {
      return;
    }
    let body = {
      token: this.routerToken,
      password: this.PasswordForm.value['confirmPassword']
    }
    this.subscription = this.coreService.postInputs(`login/resetPassword`, body, '').subscribe(res => {
      if (res.status == 'F') {
        this.PwdSopList = res.errorMessages;
      }
      else {
        this.toastr.success('', 'Password Saved Succcessfully', {
          timeOut: 2000
        });
        this.router.navigate([`new-login`]);
      }
    });
  }
  getOtp() {
    this.subscription = this.coreService.getInputs1(`brokerservice/user/confirmPasswordReset/${this.routerToken}`, '').subscribe(res => {
      this.showTimer();
      this.PasswordForm.patchValue({ 'userName': res })
    })
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

  submitOtpForm() {
    if (!this.OtpForm.valid) {
      return;
    }
    this.subscription = this.coreService.getInputs(`brokerservice/user/validateOtp?token=${this.routerToken}&otp=${this.OtpForm.value['otp']}`, '').subscribe(res => {
      if (res)
        this.showPassword = true;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}


// dialoguecomponent
@Component({
  selector: 'Quotedialog',
  templateUrl: './Quotedialog.html',
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
