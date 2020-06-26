import { Component, OnInit, Output, EventEmitter, Input, ElementRef } from '@angular/core';
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { CoreService } from 'src/app/core/services/core.service';
import { AppService } from 'src/app/core/services/app.service';
import { NgxSpinnerService } from "ngx-spinner";

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { WebCamComponent } from 'src/app/shared/web-cam/web-cam.component'
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

export function PolicyExpDateValidator(control: AbstractControl) {
  if (control.value != '') {
    const givenDate = new Date(control.value);
    const date = givenDate.getDate();
    const month = givenDate.getMonth();
    const year = givenDate.getFullYear();
    const momentDate = moment({ year: year, month: month, day: date }).startOf('day');

    const now = moment().startOf('day');
    const yearsDiff = momentDate.diff(now, 'days');
    if (yearsDiff < 0) {
      return { younger: true };
    } else if (yearsDiff > 60) {
      return { moreThan60Days: true };
    } else {
      return null;
    }
  }
}

export function CustomMakeYearValidator(control: AbstractControl) {
  const givenDate = new Date(control.value);
  const date = givenDate.getDate();
  const month = givenDate.getMonth();
  const year = givenDate.getFullYear();
  const momentDate = moment({ year: year, month: month, day: date }).startOf('day');

  const now = moment().startOf('day');
  const yearsDiff = momentDate.diff(now, 'years');
  if (yearsDiff <= -13) {
    return { oldVehcle: true };
  } else {
    return null;
  }
}

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.scss']
})

export class VehicleComponent implements OnInit {

  @Output()
  vehicleInfoEmitter = new EventEmitter();
  @Input()
  public vehicleDetails;
  @Input()
  public vehicleFormStatus;

  public chassisNo;
  public vehicleForm: FormGroup;
  public options: any = {};
  public isValidForm: boolean;
  fileToUpload: File = null;
  frontUrl: any = '';
  backUrl: any = '';
  disableRepairType: boolean;
  public tcNoLength = 10;
  public productId = '';
  public noOfDoors = null;
  public formData = new FormData();
  public maxVehicleValue = 0;
  public branchId;
  public revisingDetails: boolean;
  filteredTrims: Observable<string[]>;
  filteredRegisteredAt: Observable<string[]>;
  gaugeType = "semi";
  gaugeValue;
  minValue= 0;
  maxValue = 100000;
  gaugeChange(event){
    this.gaugeValue=this.vehicleForm.value['vehicleValue'];
  }

  constructor(private formBuilder: FormBuilder,
    private coreService: CoreService,
    private appSercice: AppService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppService) {
      this.route.queryParams
      .subscribe(params => {
        if (params['reviseDetails']) {
          this.revisingDetails = true;
          console.log(this.revisingDetails, params['reviseDetails'])
        }
      });
  }

  ngOnChanges() {
    if (this.vehicleFormStatus === false) {
      this.validateAllFormFields(this.vehicleForm);
    }
    if (this.vehicleDetails != undefined) {
      this.productId = this.appSercice.getuserDetails().productType;
      setTimeout(() => {
        this.patchFormValues(this.vehicleDetails);
        this.disableVehicleValue();
      }, 3000);
      // in case of trim single value
      if (this.vehicleDetails.trimOb.length === 1) {
        this.options['trim'] = this.vehicleDetails.trimOb;
        setTimeout(() => {
          this.vehicleForm.patchValue({
            trim: this.vehicleDetails.trimOb[0].value
          });
        }, 3000);
        this.trimChanged(this.vehicleDetails.trimOb[0], null);
      }
      // in case of trim multiple value
      else if (this.vehicleDetails.trimOb.length > 1) {
        setTimeout(() => {
          this.options['trim'] = this.vehicleDetails.trimOb;
            this.filteredTrims = this.vehicleForm['controls']['trim'].valueChanges
              .pipe(
                startWith(''),
                map(value => {
                  let c = this.filterDropDownValues(value, 'trim');
                  return c;
                })
              );
        },1000)
      }
    }
  }

  disableVehicleValue() {
    if (this.vehicleDetails['disableVehicleValue']) {
      this.vehicleForm.get('vehicleValue').setValidators([])
      this.vehicleForm.get('vehicleValue').updateValueAndValidity();
      this.vehicleForm.get('repairType').setValidators([])
      this.vehicleForm.get('repairType').updateValueAndValidity();

    }
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

  ngOnInit() {
    this.vehicleForm = this.formBuilder.group({
      chassisNo: [{ value: '', disabled: true }, [Validators.required]],
      makeId: ['', [Validators.required]],
      modelId: ['', [Validators.required]],
      vehicleTypeId: ['', [Validators.required]],
      ncdYears: ['', []],
      vehicleValue: ['', [Validators.required]],
      // to set usage type PRIVATE as default
      usage: ['1001', [Validators.required]],
      registeredAt: ['', [Validators.required]],
      repairType: ['', [Validators.required]],
      noOfPassengers: ['', [Validators.required]],
      makeYear: ['', [Validators.required]],
      regStatus: ['', Validators.required],
      trim: ['', Validators.required],
      tcFileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      registeredDate:['', [Validators.required]],
      prevPolicyExpDate: ['', []],
      branchId: ['',[]],
      colorId: ['',[]],
      noOfDoors: ['', []],
      mortgagedYN: ['', []],
      registrationMark: ['',[]],
      regNo:['',[]],
      bankName:['',[]]
    });

    this.onFormValueChanges();
    this.getDropDownOptions('make', 'MAKE');
    this.getDropDownOptions('regYear', 'MOTOR_YEAR');
    this.getDropDownOptions('ncdYears', 'NCD_YRS');
    this.getDropDownOptions('usageType', 'VEH_USAGE');
    this.getDropDownOptions('registeredAt', 'REG_AT');
    this.getDropDownOptions('repairType', 'MOTOR_AG_REPIR');
    this.getDropDownOptions('regStatus', 'REG_STATUS');
  }

  getDropDownOptions(key: string, optionId: string, productId = '*') {
    this.coreService.listOptions(optionId, productId).subscribe((response: any) => {
      this.options[key] = response.data;
      if (key === 'registeredAt') {
        this.filteredRegisteredAt = this.vehicleForm['controls']['registeredAt'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this.filterDropDownValues(value, key);
              return c;
            })
          );
      }
    });
  }

  loadVehicleDropDowns(key, targetFieldId, value) {
    let mthd;
    if(value.option)
    value = value.option.value;
    if (key == 'makeId') {
      mthd = this.coreService.listModel(value);
    }
    if (key == 'modelId') {
      const make = this.vehicleForm.get('makeId').value;
      mthd = this.coreService.listBody(make, value);
    }
    if (mthd)
      mthd.subscribe((response: any) => {
        this.options[targetFieldId] = response.data;
        if (response.data && response.data.length === 1 && key == 'makeId')
          this.loadVehicleDropDowns('modelId', 'vehicleTypeId', response.data[0].value);
      });
  }

  public filterDropDownValues(value, key): string[] {
    if (key === 'modelId')
    console.log(value, key)
    const filterValue = value.toLowerCase();
    return this.options[key].filter(option => option['label'].toLowerCase().includes(filterValue));
  }

  private onFormValueChanges(): void {
    let data = {}
    let checkTcNumber = true;
    this.vehicleForm.valueChanges.subscribe(val => {
      if ((this.vehicleForm.controls['tcFileNumber'].status === 'VALID' && checkTcNumber && !this.revisingDetails)||(this.vehicleForm.controls['tcFileNumber'].touched && this.vehicleForm.controls['tcFileNumber'].value == '' && checkTcNumber && !this.revisingDetails)) {
        checkTcNumber = false;
        let params = {
          tcNo: this.vehicleForm.value['tcFileNumber'],
          chassisNo: this.chassisNo
        }
        this.coreService.getInputsDbsync('/policy/fetchByChassisNoAndTcNo',params).subscribe(res => {
          if (res) {
            this.appSercice._insurerDetails.next(res['userDetails']);
            let value = {
              licenseIssueDate: res['userDetails']['licenseIssuedDate'],
              licenseExpiryDate: res['userDetails']['licenseExpiryDate']
            }
            this.appSercice._driverDetails.next(value);
            res['vehicleDetails']['mortgagedYN'] = res['vehicleDetails']['mortgagedYn'];
            this.vehicleForm.patchValue({
              prevPolicyExpDate: res['vehicleDetails']['prevPolicyExpDate']
            });
            this.patchAdditionalDetails(res['vehicleDetails'])
          } else {
            this.appSercice._insurerDetails.next({});
            this.appSercice._driverDetails.next({});
            this.vehicleForm.patchValue({
              prevPolicyExpDate: ''
            });
            this.patchAdditionalDetails({})
          }
        })
      }
      if (this.vehicleForm.controls['tcFileNumber'].touched && this.vehicleForm.controls['tcFileNumber'].status === 'INVALID' && this.vehicleForm.controls['tcFileNumber'].value != '') {
        checkTcNumber = true;
        this.revisingDetails = false;

      }
      if (this.vehicleForm.status === 'VALID') {
        this.vehicleForm.value['noOfDoors'] = this.noOfDoors;
        this.vehicleForm.value['chassisNo'] = this.chassisNo
        this.vehicleForm.value['branchId'] = this.branchId;
        data = this.vehicleForm.value;
        this.vehicleInfoEmitter.emit({ formName: 'vehicle', status: true, event: data });
      } else {
        this.vehicleInfoEmitter.emit({ formName: 'vehicle', status: false, event: this.vehicleForm.value });
      }
    })
  }

  patchAdditionalDetails(value) {
    this.vehicleForm.patchValue({
      colorId: value['colorId'],
      noOfDoors: value['noOfDoors'],
      mortgagedYN: value['mortgagedYN'],
      registrationMark: value['registrationMark'],
      regNo: value['regNo'],
      bankName: value['bankName']
    })
  }

  dragOverItem(event: any) {
    event.preventDefault();
  }

  dropItem(event: any) {
    event.preventDefault();
  }

  uploadMulkiya(event: any) {
    let element: HTMLElement = document.getElementById('uploadTrigger') as HTMLElement;
    element.click();
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
      this.formData.append('ocrFile', files[0], files[0].name);
      this.formData.append('doctypeid', '1');
      this.formData.append('docDesc', files[0].name);
      if (this.frontUrl == '') {
        this.coreService.TestInputs(this.formData).subscribe(response => {
          if (response.data) {
            this.vehicleForm.patchValue(response.data)
          }
          this.spinner.hide();
        }, err => {
          this.spinner.hide();
        });
      }
      else if (this.frontUrl != '') {
        this.coreService.TestInputs(this.formData).subscribe(response => {
          if (response.data) {
            this.vehicleForm.patchValue(response.data)
          }
          this.spinner.hide();
        }, err => {
          this.spinner.hide();
        });

      }
    }
  }

  closefunc(imgType: any) {
    if (imgType == 'frontUrl') {
      this.vehicleForm
      this.frontUrl = '';
    } else if (imgType == 'backUrl') {
      this.backUrl = '';
    }

  }

  patchFormValues(data) {
    this.appService._loginUserTcNumber.subscribe(res => {
      if (res.length != 0) {
        setTimeout(() => {
          this.vehicleForm.patchValue({
            tcFileNumber: res['tcNumber']
          });
        },1000)
      }
    })
    this.chassisNo = data['chassisNo']
    this.vehicleForm.patchValue(data);
    this.vehicleForm.patchValue({
      makeYear: data['makeYear'] ? data['makeYear'].toString() : null,
      ncdYears: data['ncdYears'] ? data['ncdYears'].toString() : null,
    });
    this.updateTcValidation();
    if (data['trim']) {
      this.trimChanged(data['trim'], 'revise')
    }
    if (data['registeredAt'] === 'Dubai')
    this.registeredAtChange(data['registeredAt'])
  }

  updateTcValidation() {
    if (this.vehicleForm.value.registeredAt === '1102') {
      this.tcNoLength = 8;
      this.vehicleForm.get('tcFileNumber').setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(8)]);
      this.vehicleForm.get('tcFileNumber').updateValueAndValidity();
    } else {
      this.tcNoLength = 10;
      this.vehicleForm.get('tcFileNumber').setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
      this.vehicleForm.get('tcFileNumber').updateValueAndValidity();
    }
  }

  openDialog() {
    let dialogRef = this.dialog.open(WebCamComponent, {
      panelClass: 'my-class',
      data: { QType: "Mulkiya", QTitle: "Mulkiya Card" }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show();
        var blob = this.dataURItoBlob(result.data._imageAsDataUrl);
        const formData = new FormData();
        formData.append('ocrFile', blob, 'Mulkiyuh');
        formData.append('doctypeid', '1');
        formData.append('docDesc', 'Mulkiyuh');
        if (this.frontUrl == '') {
          this.coreService.TestInputs(formData).subscribe(response => {
            if (response.data) {
              this.vehicleForm.patchValue(response.data)
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
              this.vehicleForm.patchValue(response.data)
              this.backUrl = result.data._imageAsDataUrl;
            }
            this.spinner.hide();
          }, err => {
            this.spinner.hide();
          })
        }
      }
    });
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

  alreadySet= false;
  setRepairTypeAndRegType(makeYear) {
    const today = new Date();
    if ((today.getFullYear() - makeYear) <= 5) {
      this.vehicleForm.patchValue({
        repairType: '1'
      });
      this.disableRepairType = false;
    } else {
      this.vehicleForm.patchValue({
        repairType: '2'
      });
      this.disableRepairType = true;
    }
    if (!this.alreadySet)
    this.setPrevPolicyExpDate(makeYear, 'patch');
  }

  setPrevPolicyExpDate(makeYear, value) {
    this.alreadySet = true;
    const today = new Date();
    if ((today.getFullYear() <= makeYear)) {
      if (value === 'patch') {
        this.vehicleForm.patchValue({
          regStatus: 'N'
        });
      }
      this.vehicleForm.get('prevPolicyExpDate').clearValidators();
      this.vehicleForm.get('prevPolicyExpDate').updateValueAndValidity();
      this.vehicleForm.get('registeredDate').clearValidators();
      this.vehicleForm.get('registeredDate').updateValueAndValidity();
    } else {
      if (value === 'patch') {
        this.vehicleForm.patchValue({
          regStatus: '03'
        });
      }
      this.vehicleForm.get('prevPolicyExpDate').setValidators([Validators.required, PolicyExpDateValidator]);
      this.vehicleForm.get('prevPolicyExpDate').updateValueAndValidity();
      this.vehicleForm.get('registeredDate').setValidators([Validators.required])
      this.vehicleForm.get('registeredDate').updateValueAndValidity();
    }
    console.log(makeYear,'thethethethethe')
    if (makeYear === 'N') {
      this.vehicleForm.get('prevPolicyExpDate').clearValidators();
      this.vehicleForm.get('prevPolicyExpDate').updateValueAndValidity();
      this.vehicleForm.get('registeredDate').clearValidators();
      this.vehicleForm.get('registeredDate').updateValueAndValidity();
    }
  }

  registeredAtChange(event) {
    let value
    if (event.option)
    value = event.option.value;
    else 
    value = event;
    let params = {
      productId: "*",
      filterByValue: value,
      optionType: 'LOC_DIVN'
    }
    this.coreService.getInputs('brokerservice/options/list',params).subscribe(res => {
      this.branchId = res.data[0].value; 
      this.vehicleForm['branchId'] = res.data[0].value
    })
    if (value === 'Dubai' || value === '1102') {
      this.tcNoLength = 8;
      this.vehicleForm.get('tcFileNumber').setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(8)]);
      this.vehicleForm.get('tcFileNumber').updateValueAndValidity();
    } else {
      this.tcNoLength = 10;
      this.vehicleForm.get('tcFileNumber').setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
      this.vehicleForm.get('tcFileNumber').updateValueAndValidity();
    }
  }

  trimChanged(value, type) {
    console.log(value)
    let params = {
      chassisNo: this.vehicleDetails.chassisNo
    }
    if (type === 'revise') {
      if (value.option)
      params['trim']  = value.option.value;
      else
      params['trim'] = value
    } else {
      if (value.option)
      params['trim'] = value.option.value;
      else
      params['trim'] = value.value
    }
    if (this.productId === '1113') {
      this.coreService.getInputsAutoData('ae/findByChassisNoAndTrimWithPrice', params).subscribe(res => {
        if (res.vehicleValue === null || res.vehicleTypeId === null) {
          this.router.navigate(['/contact-message', 'autodata-failed']);
        }
        if (type != 'revise') {
          this.vehicleForm.patchValue({
            vehicleValue: res.vehicleValue,
            vehicleTypeId: res.vehicleTypeId
          });
          this.noOfDoors = res.noOfDoors;
        }
        this.maxVehicleValue = res.maxValue;
        this.minValue = res.vehicleValue;
        this.maxValue = res.maxValue;
        if (type != 'revise')
        this.gaugeValue = res.vehicleValue;
        else
        this.gaugeValue = this.vehicleForm.value['vehicleValue'];
        this.vehicleForm.get('vehicleValue').setValidators([Validators.required])
        this.vehicleForm.get('vehicleValue').updateValueAndValidity();
      });
    } else {
      this.coreService.getInputsAutoData('ae/findByChassisNoAndTrim', params).subscribe(res => {
        if (res.vehicleTypeId === null) {
          this.router.navigate(['/contact-message', 'autodata-failed']);
        }
        this.vehicleForm.patchValue({
          vehicleTypeId: res.vehicleTypeId
        });
        this.noOfDoors = res.noOfDoors;
      });
    }
  }
}
