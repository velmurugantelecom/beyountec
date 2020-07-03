import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from '../../core/services/core.service';
// import { PostsService } from '../_service/post.service';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../shared/header/header.component';
import { TranslateService } from '@ngx-translate/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control.dirty || control.touched);
    return (invalidCtrl);
  }
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  providers:[HeaderComponent],
})
export class ChangePasswordComponent implements OnInit {

  changePassword: FormGroup;
  validation_messages: any;
  isSubmitted: boolean;
  oldPasswordIsRequired: any;
  newPasswordIsRequired: any;
  confirmPasswordIsRequired: any;

  matcher = new MyErrorStateMatcher();
  userName: string = localStorage.getItem('Username');
  errors: any[];
  isFirstLogin: Boolean = false;

  checkPasswords(group: FormGroup) {
    let pass = group.controls.newpassword.value;
    let confirmPass = group.controls.confirmpassword.value;
    return pass === confirmPass ? null : { notSame: true }
  }

  constructor(private formBuilder: FormBuilder,
   public router: Router,
   public postService: CoreService,
   public actRoute: ActivatedRoute,
   private translate: TranslateService,
   private toastr: ToastrService,
   private header : HeaderComponent) { }

  ngOnInit() {
    this.changePassword = this.formBuilder.group({
      username: [''],
      oldpassword: ['', Validators.compose([
        Validators.required,
        //Validators.pattern('^[a-zA-Z0-9]*$')
      ])],
      newpassword: ['', Validators.compose([
        Validators.required,
        //Validators.pattern('^[a-zA-Z0-9]*$')
      ])],
      confirmpassword: ['', Validators.compose([
        Validators.required,
        //Validators.pattern('^[a-zA-Z0-9]*$')
      ])]
    }, { validator: this.checkPasswords });

    this.translate.get('Required.OldPasswordIsRequired') .subscribe(value => { 
      this.oldPasswordIsRequired = value; 
    } );
    this.translate.get('Required.NewPasswordIsRequired') .subscribe(value => { 
      this.newPasswordIsRequired = value; 
    } );
    this.translate.get('Required.ConfirmPasswordIsRequired') .subscribe(value => { 
      this.confirmPasswordIsRequired = value; 
    } );

    this.validation_messages = {

      "oldpassword": [
        { type: 'required', message: this.oldPasswordIsRequired  }
        //  { type: 'pattern', message: 'Enter a valid old password' }
      ],
      "newpassword": [
        { type: 'required', message: this.newPasswordIsRequired }
        //{ type: 'pattern', message: 'Enter a valid new password' }
      ],
      "confirmpassword": [
        { type: 'required', message:  this.confirmPasswordIsRequired }
        //{ type: 'pattern', message: 'Enter a valid Password' }
      ]
    }
    this.changePassword.patchValue({ username: this.userName });
  }

  onSavePassword() {
    this.isSubmitted = true;
    if (this.changePassword.invalid) {
      return;
    }
    let params = {
      "newPassword": this.changePassword.value.newpassword,
      "oldPassword": this.changePassword.value.oldpassword
    }

    this.postService.postInputs('login/changePassword', params, '').subscribe(result => {
      if (result.status === 406) {
        this.errors = result.data;
        this.changePassword.patchValue({newpassword: '', confirmpassword: ''});
      }
      else if(result.status === 404){
        this.toastr.error('', result.message, {
          timeOut: 3000
        }); 
        this.changePassword.patchValue({oldpassword: ''});
      }
      else if (result.status === 200) {        
         this.toastr.success('', result.message, {
           timeOut: 2000
         });  
         this.header.LogOut();
      }

      if (result.status === 404) {
        this.errors = result.message;
      }

    }, err => {
      alert("Network Error");
    });
  }

  onReset() {
    this.changePassword.patchValue({
      oldpassword: '',
      newpassword: '',
      confirmpassword: ''
    });
  }
}
