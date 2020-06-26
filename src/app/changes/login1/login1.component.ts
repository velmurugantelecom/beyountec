import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { CoreService } from '../../core/services/core.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import * as _moment from "moment";
const moment = _moment;
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'app-login1',
  templateUrl: './login1.component.html',
  styleUrls: ['./login1.component.scss']
})
export class Login1Component implements OnInit {
  showTab: string = 'login';
  LoginForm: FormGroup;
  infoForm: FormGroup;
  showPassword = false;
  dropdownOptions = [{ typeid: "1113", typedesc: "Full Insurance" },
  { typeid: "1116", typedesc: "Third Party Insurance" }];
 
  options = [{ "label": "050", "value": "050" },
  { "label": "052", "value": "052" },
  { "label": "054", "value": "054" },
  { "label": "055", "value": "055" },
  { "label": "056", "value": "056" },
  { "label": "058", "value": "058" }];
  constructor(private route: ActivatedRoute,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private commonService: CoreService,
    private authService: AuthService) {
    router.events.forEach(event => {
      if (event instanceof NavigationEnd) {

        this.showTab = event.url.slice(1).split("/")[0];
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


    this.infoForm = this.formBuilder.group({
      productType: ['', Validators.required],
      mobileCode: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.minLength(7),
      Validators.maxLength(7)]],
      email: ['', [Validators.required, Validators.email]],
    
    });




  }




  // submitForm() {
  //   if (this.LoginForm.status == 'INVALID') {
  //     return
  //   }
  //   let value = this.LoginForm.value;
  //   this.commonService.postInputs('login/signIn', value, {}).subscribe(response => {
  //     let data = response.data;
  //     localStorage.setItem('tokenDetails', data.token);
  //     localStorage.setItem('Username', data.userName)
  //     localStorage.setItem('isLoggedIn', 'true');
  //     this.authService.isUserLoggedIn.next(true);
  //     this.authService.isGuestUser.next(false);
  //     this.router.navigate([`/User/dashboard`]);
  //   });
  // }

  getChassisNumber() {
    this.router.navigate(['/demo-motor-info'])
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


}
