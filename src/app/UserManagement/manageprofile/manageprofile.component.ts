import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormControlDirective, FormControlName } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CoreService } from '../../core/services/core.service';

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


  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private postService: CoreService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
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

    this.validation_messages = {
      "email": [{ type: 'required', message: 'Email Id is required' },
      { type: 'pattern', message: 'Enter a valid Email' }],
      "mobileNo": [{ type: 'required', message: 'Mobile Number is required' }],
      "mobileCode": [{type: 'required', message: 'Mobile Code is required'}]
    };
  }

  onSaveProfile() {
    this.spinner.show();
    let obj = {};
    obj = this.profileForm.value;
    this.postService.postInputs('dbsync/user/update', obj, {}).subscribe((result: any) => {
      this.spinner.hide();
      this.toaster.success('', 'Profile Updated Successfully', {
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