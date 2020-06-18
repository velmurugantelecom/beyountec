import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { CoreService } from 'src/app/core/services/core.service';
import { NgxSpinnerService } from "ngx-spinner";
import * as _moment from "moment";
import { AppService } from 'src/app/core/services/app.service';


import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { WebCamComponent } from 'src/app/shared/web-cam/web-cam.component'

const moment = _moment;

export function customIssueDateValidator(dobDate: Date): ValidatorFn {

  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value.getFullYear() - dobDate.getFullYear() <= 15) {
      return { invalidIssueDate: true }
    } else {
      return null;
    }
  }
}


@Component({
  selector: 'app-driver-license-details',
  templateUrl: './driver-license-details.component.html',
  styleUrls: ['./driver-license-details.component.scss']
})
export class DriverLicenseDetailsComponent implements OnInit {

  @Output()
  driverInfoEmitter = new EventEmitter();
  @Input()
  public driverDetails;
  @Input()
  public driverFormStatus;

  public driverForm: FormGroup;
  fileToUpload: File = null;
  frontUrl: any = '';
  backUrl: any = '';
  date = new Date();
  minDateExpiry;
  minDateIssue: Date;
  public tcNoLength = 10;
  constructor(private formBuilder: FormBuilder, private coreService: CoreService,
    private appService: AppService,
    private spinner: NgxSpinnerService, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.driverForm = this.formBuilder.group({
      // tcFileNumber: ['', [Validators.required, Validators.minLength(10),Validators.maxLength(10)]],
      licenseIssueDate: ['', [Validators.required,]],
      licenseExpiryDate: ['', [Validators.required]],
    });

    this.onFormValueChanges();

    // if (this.appService.getuserDetails()['tcNo'] != null) {
    //   this.driverForm.patchValue({
    //     tcFileNumber: parseInt(this.appService.userDetails.tcNo)
    //   })
    // }

    this.appService._dob.subscribe(val => {
      if (val) {
        let date = moment(val).add('years', 18)['_d'];
        this.minDateIssue = date.toISOString();
      }
    });
  }

  ngOnChanges() {
    if (this.driverFormStatus === false) {
      this.validateAllFormFields(this.driverForm);
    }
    if (this.driverDetails != undefined)
      this.patchFormValues();
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

  onFormValueChanges(): void {
    this.driverForm.valueChanges.subscribe(val => {
      if (this.driverForm.status === 'VALID') {
        this.driverInfoEmitter.emit({ formName: 'driver', status: true, event: this.driverForm.value });
      } else {
        this.driverInfoEmitter.emit({ formName: 'driver', status: false, event: this.driverForm.value });
      }
    })
  }


  closefunc(imgType: any) {
    if (imgType == 'frontUrl') {
      this.frontUrl = '';
    } else if (imgType == 'backUrl') {
      this.backUrl = '';
    }

  }


  uploadMulkiya(event: any) {
    let element: HTMLElement = document.getElementById('uploadTrigger') as HTMLElement;
    element.click();
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  uploadDriverLicenseByDD(event: any) {
    event.preventDefault();
    this.onSelectFile(event.dataTransfer.files);
  }

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
            this.driverForm.patchValue(response.data)
            this.driverForm.patchValue({
              licenseIssueDate: new Date(response.data['licenseIssueDate']),
              licenseExpiryDate: new Date(response.data['expiryDate'])
              // tcFileNumber: response.data['tcFileNumber'],

            });
          }
          this.spinner.hide();
        }, err => {
          this.spinner.hide();
        });
      }
      else if (this.frontUrl != '') {
        this.coreService.TestInputs(formData).subscribe(response => {
          if (response.data) {
            this.driverForm.patchValue(response.data)
          }
          this.spinner.hide();
        }, err => {
          this.spinner.hide();
        });
      }
    }
  }

  issuedDateChange(event) {
    if (event.value != null) {
      this.minDateExpiry = event.value;
    }
  }

  patchFormValues() {
    this.minDateExpiry = new Date(this.driverDetails['licenseIssueDate']);
    this.driverForm.patchValue({
      licenseIssueDate: this.driverDetails['licenseIssueDate'] ? new Date(this.driverDetails['licenseIssueDate']) : '',
      licenseExpiryDate: this.driverDetails['licenseExpiryDate'] ? new Date(this.driverDetails['licenseExpiryDate']) : ''
    });
  }

  openDialog(Type: string, Title: string): void {
    let dialogRef = this.dialog.open(WebCamComponent, {
      panelClass: 'my-class',
      data: { QType: "Driving License", QTitle: "Driving License" }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // loading
        this.spinner.show();
        var blob = this.dataURItoBlob(result.data._imageAsDataUrl);
        const formData = new FormData();
        formData.append('ocrFile', blob, 'License');
        formData.append('doctypeid', '1');
        formData.append('docDesc', 'License');

        if (this.frontUrl == '') {
          this.coreService.TestInputs(formData).subscribe(response => {
            if (response.data) {
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
}
