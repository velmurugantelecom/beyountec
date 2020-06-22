import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormControlDirective, FormControlName } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CoreService } from '../../core/services/core.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-manageprofile',
  templateUrl: './manageprofile.component.html',
  styleUrls: ['./manageprofile.component.scss']
})
export class ManageprofileComponent implements OnInit {
  profileForm: FormGroup;
  inputData: any = [];
  validation_messages: any = {};
  options: any = [];
  profileUpdated:any;
  emailRequired: any;
  validEmail: any;
  mobileNumberRequired:any;
  mobileCodeRequired: any;


  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private postService: CoreService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    private translate: TranslateService,
    private service: CoreService) { }

  ngOnInit() {
    this.profileForm = this.formBuilder.group({
      firstName: [''],
      middleName: [''],
      lastName: [''],
      mobileCode: ['', [Validators.required]],
      mobileNo: ['', Validators.required],
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])],
    });
    this.service.listOptions('MOBILE_CON_CODE', '*').subscribe(response => {
      this.options['mobileCode'] = response['data'];
    });
    this.postService.getInputs(`dbsync/user/find`, '').subscribe((data: any) => {
      this.inputData = data;
      this.profileForm.patchValue({
        firstName: this.inputData.firstName,
        middleName: this.inputData.middleName,
        lastName: this.inputData.lastName,
        mobileNo: this.inputData.mobileNo,
        email: this.inputData.email,
        mobileCode: this.inputData.mobileCode
      });
    });
  this.translate.get('Required.EmailRequired') .subscribe(value => { 
    this.emailRequired = value; 
  } );
  this.translate.get('Required.ValidEmail') .subscribe(value => { 
    this.validEmail = value; 
  } );
  this.translate.get('Required.MobileNumberRequired') .subscribe(value => { 
    this.mobileNumberRequired = value; 
  } );
  this.translate.get('Required.MobileCodeRequired') .subscribe(value => { 
    this.mobileCodeRequired = value; 
  } );

    this.validation_messages = {
      "email": [{ type: 'required', message:  this.emailRequired },
      { type: 'pattern', message: this.validEmail }],
      "mobileNo": [{ type: 'required', message: this.mobileNumberRequired }],
      "mobileCode": [{type: 'required', message: this.mobileCodeRequired}]
    };
  }

  onSaveProfile() {
    this.translate.get('ProfileUpdated') .subscribe(value => { 
      this.profileUpdated = value; 
    } );
    this.spinner.show();
    let obj = {};
    obj = this.profileForm.value;
    this.postService.postInputs('dbsync/user/update', obj, {}).subscribe((result: any) => {
      this.spinner.hide();
      this.toaster.success('', this.profileUpdated, {
        timeOut: 3000
      });
      this.router.navigate(['/User/dashboard']);
    }, err => {
      this.spinner.hide();
    });
  }

  onCancel() {
    this.router.navigate(['/User/dashboard']);
  }

}