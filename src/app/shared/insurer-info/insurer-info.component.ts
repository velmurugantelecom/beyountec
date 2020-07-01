import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { AppService } from 'src/app/core/services/app.service';
import { CoreService } from 'src/app/core/services/core.service';

import { NgxSpinnerService } from "ngx-spinner";

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { WebCamComponent } from 'src/app/shared/web-cam/web-cam.component'
import * as moment from 'moment';

export function CustomDOBValidator(control: AbstractControl) {

  const givenDate = new Date(control.value);
  const date = givenDate.getDate();
  const month = givenDate.getMonth();
  const year = givenDate.getFullYear();
  const momentDate = moment({ year: year, month: month, day: date }).startOf('day');

  const now = moment().startOf('day');
  const yearsDiff = momentDate.diff(now, 'years');

  if (yearsDiff > -18) {
    return { younger: true };
  } else {
    return null;
  }
}

@Component({
  selector: 'app-insurer-info',
  templateUrl: './insurer-info.component.html',
  styleUrls: ['./insurer-info.component.scss']
})
export class InsurerInfoComponent implements OnInit {

  @Output()
  insurerInfoEmitter = new EventEmitter();
  @Input()
  public insuredDetails;
  @Input()
  insuredFormStatus;

  public insurerForm: FormGroup;
  public isFormValid: boolean;
  fileToUpload: File = null;
  frontUrl: any = '';
  backUrl: any = '';
  options: any = {};
  public maxDate = new Date();
  public nationality;
  constructor(public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private appService: AppService,
    private coreService: CoreService, ) {
  }

  ngOnInit() {

    this.insurerForm = this.formBuilder.group({
      personalId: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      prefix: ['', [Validators.required]],
      fullNameBL: ['', []],
      taxId: ['', []],
      nationality: ['', []],
      address4: ['', []],
      city: ['', []],
      country: ['', []],
      address1: ['', []],
      address2: ['', []],
      occupation: ['', []],
      postBox: ['', []]
    });
    this.getDropDownOptions('gender', 'GENDER');
    this.getDropDownOptions('prefix', 'UCD_PREFIX_NAME');

    this.onFormValueChanges();
  }

  ngOnChanges() {
    if (this.insuredFormStatus === false) {
      this.validateAllFormFields(this.insurerForm);
    }
    if (this.insuredDetails != undefined)
      console.log(this.insuredDetails);
    this.patchFormValues(this.insuredDetails)
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  getDropDownOptions(key: string, optionId: string, productId = '*') {
    this.coreService.listOptions(optionId, productId).subscribe((response: any) => {
      this.options[key] = response.data;
      // if (key ==='prefix') {
      //   this.insurerForm.patchValue({
      //     prefix: response['data'][0].value
      //   });
      // }
    });

  }

  onFormValueChanges(): void {
    this.insurerForm.valueChanges.subscribe(val => {
      if (this.insurerForm.status === 'VALID') {
        this.isFormValid = true;
        this.insurerForm.value['firstName'] = this.insurerForm.value['fullName'];
        this.insurerInfoEmitter.emit({ formName: 'insurer', status: true, event: this.insurerForm.value });
      }
      if (this.isFormValid && this.insurerForm.status === 'INVALID') {
        this.insurerInfoEmitter.emit({ formName: 'insurer', status: false, event: this.insurerForm.value });
      }
      if (this.insurerForm.get('dob').status === 'VALID') {
        this.appService._dob.next(this.insurerForm.get('dob').value);
      }
    })
  }

  closefunc(imgType: any) {
    if (imgType == 'frontUrl') {
      this.frontUrl = '';
      this.insurerForm.controls['personalId'].reset();
      this.insurerForm.controls['fullName'].reset();
    } else if (imgType == 'backUrl') {
      this.backUrl = '';
      this.insurerForm.controls['gender'].reset();
      this.insurerForm.controls['dob'].reset();
    }

  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  uploadinsured(event: any) {
    let element: HTMLElement = document.getElementById('insuredTrigger') as HTMLElement;
    element.click();
  }
  uploadinsuredByDD(event: any) {
    event.preventDefault();
    this.onSelectFile(event.dataTransfer.files);
  }
  // ocr Upload
  onSelectFile(files: FileList) { // called each time file input changes
    if (files.length != 0) {
      this.spinner.show();
      var reader = new FileReader(); reader.onload = (event: any) => { // called once readAsDataURL is completed

        if (this.frontUrl == '') {
          if (files.item(0).type.includes('pdf')) {
            this.frontUrl = './assets/sharedimg/pdf.png'
          } else {
            this.frontUrl = event.target.result;
          }
        }
        else if (this.frontUrl && this.backUrl == '') {
          if (files.item(0).type.includes('pdf')) {
            this.backUrl = './assets/sharedimg/pdf.png'
          } else {
            this.backUrl = event.target.result;
          }
        }
      }
      reader.readAsDataURL(files.item(0));
      this.fileToUpload = files.item(0);
      const formData = new FormData();
      formData.append('ocrFile', files[0], files[0].name);
      formData.append('doctypeid', '1');
      formData.append('docDesc', files[0].name);
      if (this.frontUrl == '') {
        this.coreService.TestInputs(formData).subscribe(response => {
          if (response.data) {
            this.patchFormValues(response.data);
          }
          this.spinner.hide();
        }, err => {
          this.spinner.hide();
        });
      }
      else if (this.frontUrl != '') {
        this.coreService.TestInputs(formData).subscribe(response => {
          if (response.data) {
            this.patchFormValues(response.data);
          }
          this.spinner.hide();
        }, err => {
          this.spinner.hide();
        });
      }
    }
  }

  // Retrival or Renewal Patch Func
  patchFormValues(data) {
    console.log(data['prefix'])
    if(data['prefix']){
      this.insurerForm.patchValue({prefix: data['prefix']});   
    }
    if (data['gender'] === 'M') {
      this.insurerForm.patchValue({
        prefix: 'Mr'
      })
    } else {
      this.insurerForm.patchValue({
        prefix: 'Mrs'
      })
    }
    this.insurerForm.patchValue({
      personalId: data['personalId'] ? data['personalId'] : '',
      fullName: data['fullName'] ? data['fullName'] : '',
      dob: data['dob'] ? new Date(data['dob']) : '',
      gender: data['gender'] ? data['gender'] : '',
      address1: data['address1'] ? data['address1'] : '',
      address2: data['address2'] ? data['address2'] : '',
      address4: data['address4'] ? data['address4'] : '',
      fullNameBL: data['fullNameBL'] ? data['fullNameBL']: '',
      city: data['city'] ? data['city'] : '',
      country: data['country'] ? data['country'] : '',
      occupation: data['occupation'] ? data['occupation'] : '',
      postBox: data['postBox'] ? data['postBox'] : '',
      taxId: data['taxId'] ? data['taxId'] : '',
      nationality: data['nationality'] ? data['nationality'] : '',

    });
  }

  openDialog() {
    let dialogRef = this.dialog.open(WebCamComponent, {
      panelClass: 'my-class',
      data: { QType: "Emirates", QTitle: "Emirates Card" }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // loading
        this.spinner.show();
        var blob = this.dataURItoBlob(result.data._imageAsDataUrl);
        const formData = new FormData();
        formData.append('ocrFile', blob, 'Emirates');
        formData.append('doctypeid', '1');
        formData.append('docDesc', 'Emirates');

        if (this.frontUrl == '') {
          this.coreService.TestInputs(formData).subscribe(response => {
            if (response.data) {
              this.patchFormValues(response.data);
              this.frontUrl = result.data._imageAsDataUrl;
            }
            this.spinner.hide();
          }, err => {
            this.spinner.hide();
          })
        }
        else if (this.frontUrl != '' && this.backUrl == '') {
          this.coreService.TestInputs(formData).subscribe(response => {
            if (response.data) {
              this.patchFormValues(response.data);
              this.backUrl = result.data._imageAsDataUrl;
            }
            this.spinner.hide();
          }, err => {
            this.spinner.hide();
          })

        }
      }
    })

  }


  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  onDateChange() {
    if (this.insurerForm.get('dob').status === 'VALID') {
      this.appService._dob.next(this.insurerForm.get('dob').value);
    }
  }

  onGenderChange(event, type) {
    let gender, prefix;
    if (type === 'prefix') {
      if (event.value === 'Mr')
      gender = 'M';
    else 
    gender = 'F'
    this.insurerForm.patchValue({
      gender: gender
    });
    } else {
      if (event.value === 'M')
      prefix = 'Mr';
      else 
      prefix = 'Mrs'
      this.insurerForm.patchValue({
        prefix: prefix
      });
    }
  }
}
