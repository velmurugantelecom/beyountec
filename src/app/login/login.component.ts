import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { CoreService } from '../core/services/core.service';
import { AuthService } from '../core/services/auth.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import * as _moment from "moment";
const moment = _moment;
import { ToastrService } from 'ngx-toastr';

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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  
  showTab: string = 'login';
  LoginForm: FormGroup;
  OtpForm: FormGroup;
  PasswordForm: FormGroup
  ForgotForm: FormGroup;
  isResetLinkSend: boolean;
  forgotPasswordStatus: boolean;
  routerToken: any;
  public doTimeout: boolean = false;
  public minutes = 2;
  public seconds = 0;
  public totalMs = 120000;
  showPassword = false;
  PwdSopList = [];
  public email = ''

  constructor(private route: ActivatedRoute,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private commonService: CoreService,
    private authService: AuthService) {
    router.events.forEach(event => {
      if (event instanceof NavigationEnd) {
        this.showTab = event.url.slice(1).split("/")[0];
        this.routerToken = event.url.slice(1).split("/")[1];
      }
    });
  }

  ngOnInit() {
    // localStorage.clear();
    localStorage.removeItem('tokenDetails');
    localStorage.removeItem('Username');
    localStorage.removeItem('guesttokenDetails');
    localStorage.removeItem('isLoggedIn');
    this.LoginForm = this.formBuilder.group({
      userName: ['', [Validators.required,]],
      password: ['', [Validators.required,]],
    });
    this.OtpForm = this.formBuilder.group({
      otp: ['', [Validators.required,]],
    });
    this.ForgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.PasswordForm = this.formBuilder.group({
      userName: [{ value: '', disabled: true }, [Validators.required,]],
      password: ['', [Validators.required,]],
      confirmPassword: ['', [Validators.required, confirmPassword]],
    });
    if (this.routerToken) {
      this.getOtp();
    }
  }

  getOtp() {
    this.commonService.getInputs1(`brokerservice/user/confirmPasswordReset/${this.routerToken}`, '').subscribe(res => {
      this.showTimer();
      this.PasswordForm.patchValue({ 'userName': res })
    })
  }

  forgotPwd() {
    if (this.ForgotForm.status === 'INVALID') {
      return;
    }
    this.commonService.postInputs3(`brokerservice/user/forgotPassword?emailId=${this.ForgotForm.value.email}`, '').subscribe(res => {
      this.isResetLinkSend = true;
      this.email = this.ForgotForm.value.email;
    });
  }

  submitOtpForm() {
    if (!this.OtpForm.valid) {
      return;
    }
    this.commonService.getInputs(`brokerservice/user/validateOtp?token=${this.routerToken}&otp=${this.OtpForm.value['otp']}`, '').subscribe(res => {
      this.showPassword = true;
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
    this.commonService.postInputs(`login/resetPassword`, body, '').subscribe(res => {
      if (res.status == 'F') {
        this.PwdSopList = res.errorMessages;
      }
      else {
        this.toastr.success('', 'Password Saved Succcessfully', {
          timeOut: 2000
        });
        this.router.navigate([`/Login`]);
      }
    });
  }

  submitForm() {
    if (this.LoginForm.status == 'INVALID') {
      return
    }
    let value = this.LoginForm.value;
    this.commonService.postInputs('login/signIn', value, {}).subscribe(response => {
      let data = response.data;
      localStorage.setItem('tokenDetails', data.token);
      localStorage.setItem('Username', data.userName)
      localStorage.setItem('isLoggedIn', 'true');
      this.authService.isUserLoggedIn.next(true);
      this.authService.isGuestUser.next(false);
      this.router.navigate([`/User/dashboard`]);
    });
  }

  ForgotNavigate() {
    this.router.navigate([`/forgotPwd`]);
  }

  showHidePwd(value) {
    console.log(value)
    let x: any = document.getElementById(`${value}`);
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
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
}

