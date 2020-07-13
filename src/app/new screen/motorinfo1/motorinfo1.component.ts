import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { CoreService } from 'src/app/core/services/core.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DropDownService } from 'src/app/core/services/dropdown.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductChangePopupComponent } from 'src/app/modal/product-change/product-change.component';
import { MatDialog } from '@angular/material';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';

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

@Component({
  selector: 'app-motorinfo1',
  templateUrl: './motorinfo1.component.html',
  styleUrls: ['./motorinfo1.component.scss']
})
export class NewMotorInfoScreen implements OnInit {

  public today = new Date();
  public items = [];
  public selected = [];
  public basicUserDetails = {};
  public chassisNoForm: FormGroup;
  public vehicleForm: FormGroup;
  public insuredForm: FormGroup;
  public autoData: any = {};
  public autoDataURL;
  public productId;
  public gridDetails = [];
  public options: any = {};
  public showForm: boolean;
  public showGrid: boolean;
  public selectedTrim;
  public tcNoLength = 10;
  public additionalDetails: any = {};
  public maxVehicleValue = 0;
  public vehicleValue = 0;
  public isAlreadyChecked = true;
  public enableGridBtn = true;
  public enableContinue = true;
  public quoteNo = '';
  public invalidChassisNo: boolean;
  public quoteDetails = {};
  public trimOption = [];
  public isLoggedInUser: boolean;
  public loggedInUserName;
  public checkTcNoStatus;
  public typeHint = '';
  public searchType;
  subscription: Subscription
  // gauge properties
  gaugeType = "semi";
  gaugeValue;
  minValue = 0;
  maxValue = 100000;

  constructor(private dataService: DataService,
    private formBuilder: FormBuilder,
    private coreService: CoreService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private dropdownservice: DropDownService,
    public dialog: MatDialog,
    public runtimeConfigService: RuntimeConfigService) {
    this.route.queryParams
      .subscribe(params => {
        if (params['quoteNo']) {
          this.quoteNo = params['quoteNo'];
        }
      });
  }

  ngOnInit() {
    // patching basic details at header
    this.patchBasicUserDetails(this.dataService.getUserDetails());
    this.chassisNoForm = this.formBuilder.group({
      chassisNo: ['', [Validators.required, Validators.minLength(15)]]
    });

    this.vehicleForm = this.formBuilder.group({
      chassisNo: ['', [Validators.required, Validators.minLength(15)]],
      makeId: [{ value: '', disabled: true }, [Validators.required]],
      modelId: [{ value: '', disabled: true }, [Validators.required]],
      makeYear: [{ value: '', disabled: true }, [Validators.required]],
      trim: [{ value: '', disabled: true }, [Validators.required]],
      vehicleValue: [0, [Validators.required]],
      // to set usage type PRIVATE as default
      usage: [{ value: '1001', disabled: true }, [Validators.required]],
      repairType: ['', [Validators.required]],
      noOfPassengers: ['', [Validators.required]],
      registeredAt: ['', [Validators.required]],
      tcFileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      regStatus: ['', [Validators.required]],
      registeredDate: ['', []],
      prevPolicyExpDate: ['', []],
      ncdYears: ['', []],
      licenseIssueDate: ['', [Validators.required,]],
      vehicleTypeId: ['', []],
      noOfDoors: ['', []]
    });
    this.insuredForm = this.formBuilder.group({
      prefix: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      dob: ['', [Validators.required]]
    });

    // loading dropdown values
    this.getDropDownOptions('make', 'MAKE');
    this.getDropDownOptions('regYear', 'MOTOR_YEAR');
    this.getDropDownOptions('ncdYears', 'NCD_YRS');
    this.getDropDownOptions('usageType', 'VEH_USAGE');
    this.getDropDownOptions('registeredAt', 'REG_AT');
    this.getDropDownOptions('repairType', 'MOTOR_AG_REPIR');
    this.getDropDownOptions('regStatus', 'REG_STATUS');
    this.getDropDownOptions('prefix', 'UCD_PREFIX_NAME');

    // revise details
    if (this.quoteNo) {
      this.getQuoteDetails();
      this.checkTcNoStatus = false;
      this.enableContinue = false;
      this.vehicleForm.controls['chassisNo'].disable();
    }
    this.onFormValueChanges();
  }

  onFormValueChanges() {
    this.vehicleForm.get('tcFileNumber').statusChanges.subscribe(value => {
      if (value === 'INVALID') {
        this.insuredForm.patchValue({
          prefix: null,
          fullName: null,
          dob: null
        });
        return;
      } else {
        console.log(this.vehicleForm.controls['chassisNo'])
        let fieldStatus;
        if (this.vehicleForm.controls['chassisNo'].status ==='DISABLED') {
          fieldStatus = 'VALID'
        } else {
          fieldStatus = this.vehicleForm.controls['chassisNo'].status;
        }
        if (value === 'VALID' && this.checkTcNoStatus && fieldStatus === 'VALID') {
          setTimeout(() => this.getUserDetailsByTcNo(), 1000);
        }
      }
    });

  }

  patchBasicUserDetails(value) {
    if (!(Object.keys(value).length === 0 && value.constructor === Object)) {
      this.basicUserDetails = value;
      if (value.productType === '1113') {
        this.autoDataURL = 'ae/findByChassisNoWithPrice';
        this.productId = '1113';
        this.basicUserDetails['productTypeName'] = 'Full Insurance';
      } else {
        this.autoDataURL = 'ae/findByChassisNo';
        this.productId = '1116';
        this.basicUserDetails['productTypeName'] = 'Third Party Insurance';
      }
    }
  }

  get formCtrl() {
    return this.chassisNoForm.controls;
  }

  getAutoData() {
    if (this.selected.length != 3) {
      this.vehicleForm.controls['chassisNo'].disable();
    } else {
      this.vehicleForm.controls['chassisNo'].enable();
    }
    this.checkTcNoStatus = true;
    this.showForm = false;
    this.showGrid = false;
    this.enableGridBtn = true;
    this.enableContinue = true;
    if (this.chassisNoForm.status == 'VALID') {
      this.trimOption = [];
      this.spinner.show();
      let greyParams = {
        chassisNo: this.chassisNoForm.value.chassisNo,
        productId: this.productId
      }
      let params = {
        chassisNo: this.chassisNoForm.value.chassisNo
      }
      forkJoin(this.coreService.greyImportService('ae/isImportedVehicle', greyParams).pipe(catchError(err => {
        return of(undefined)
      })),
        this.coreService.greyImportService(this.autoDataURL, params).pipe(catchError(err => {
          return of(undefined)
        }))
      ).subscribe(([res1, res2]) => {
        res1 = this.productId === '1113' ? res1 : false;
        if (!res1) {
          this.spinner.hide();
          this.autoData = res2;
          if (this.autoData.length === 0) {
            this.navigateToMsgScreen('autodata-failed');
          }
          if (this.autoData[0]['makeYear'] && this.productId === '1113')
            this.makeYearValidation(this.autoData[0]['makeYear'])
          else {
            this.validateAutoData();
          }
        } else {
          if (res1)
            this.spinner.hide();
          this.navigateToMsgScreen('autodata-failed');
          if (!res2) {
            this.invalidChassisNo = true;
            this.chassisNoForm.controls['chassisNo'].setErrors({ 'incorrect': true });
          }
        }
      });
    }
  }

  findLabels() {
    this.options['make'].find(make => {
      if (make.value === this.autoData[0].makeId)
        this.autoData[0]['makeLabel'] = make.label;
    });
    this.options['model'].find(model => {
      if (model.value === this.autoData[0].modelId)
        this.autoData[0]['modelLabel'] = model.label;
    });
    this.autoData.forEach(ob => {
      this.trimOption.push(ob.trim);
    })
  }

  searchDetailsManually(type) {
    if (type === 'Make') {
      this.selected = [...this.selected, { label: this.autoData[0].makeYear.toString(), value: this.autoData[0].makeYear.toString() }]
      // this.selected.push({ label: this.autoData.makeYear.toString(), value: this.autoData.makeYear.toString()});
      this.items = this.options.make;
      this.typeHint = type;
    } else if (type === 'Model') {
      this.selected = [...this.selected,
      { label: this.autoData[0].makeYear.toString(), value: this.autoData[0].makeYear.toString() },
      { label: this.autoData[0].makeLabel, value: this.autoData[0].makeLabel }
      ];
      this.typeHint = type;
    }
  }

  async validateAutoData() {
    if (this.autoData.length > 0) {
      if (this.autoData[0].makeYear) {
        if (this.autoData[0].makeYear && this.autoData[0].makeId && this.autoData[0].modelId && this.autoData[0].trim) {
          // scenario 1 ... all 4 values
          if (this.productId === '1113' && !this.autoData[0].vehicleValue) {
            this.navigateToMsgScreen('autodata-failed');
          }
          this.showGrid = true;
          await this.loadVehicleDropDowns('makeId', 'model', this.autoData[0].makeId);
          this.findLabels();
          this.gridMakeover();
        } else if (this.autoData[0].makeYear && !this.autoData[0].makeId && !this.autoData[0].modelId) {
          // scenario 2 ... makeyear only
          this.searchDetailsManually('Make');
        } else if (this.autoData[0].makeYear && this.autoData[0].makeId && !this.autoData[0].modelId) {
          // scenario 3 ... makeyear & make only
          this.searchDetailsManually('Model');
        } else if (this.autoData[0].makeYear && this.autoData[0].makeId && this.autoData[0].modelId && !this.autoData[0].trim
          && !this.autoData[0].vehicleValue) {
          // scenario 4 ... allM's available wo vehicleValue, trim
          this.navigateToMsgScreen('autodata-failed');
        }
      } else {
        this.navigateToMsgScreen('autodata-failed');
      }
    } else {
      this.navigateToMsgScreen('autodata-failed');
    }
  }

  gridMakeover() {
    this.gridDetails[0] = this.autoData[0].makeYear;
    this.gridDetails[1] = this.autoData[0].makeLabel;
    this.gridDetails[2] = this.autoData[0].modelLabel;
    this.gridDetails[3] = this.autoData[0].noOfCylinders;
    this.gridDetails[4] = this.autoData[0].noOfSeats;
    this.gridDetails[5] = this.autoData[0].noOfDoors;
    this.gridDetails[6] = this.autoData[0].engineSize;

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
    this.subscription = this.coreService.listOptions(optionId, productId).subscribe((response: any) => {
      this.options[key] = response.data;
      if (!this.quoteNo && key === 'regYear')
        this.items = this.options.regYear;
    });
  }

  getPlans() {
    if (this.productId === '1116') {
      this.manipulateFields(['vehicleValue', 'repairType'], 0);
    }
    // validating fields
    this.validateAllFormFields(this.vehicleForm);
    this.validateAllFormFields(this.insuredForm);
    if (this.vehicleForm.status === 'VALID' && this.insuredForm.status === 'VALID') {
      // auto populating traffic location
      let trafficLoc: any;
      if (this.vehicleForm['value']['registeredAt'] == '1102') {
        trafficLoc = '02'
      } else {
        trafficLoc = '01'
      }

      let data = {
        lobId: 3,
        quoteNumber: this.quoteNo,
        productId: this.productId,
        prodID: this.productId,
        customerType: "I",
        startDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        transactionType: "FQ",
        policySource: "CP",
        trafficLoc: trafficLoc,
        branchId: this.additionalDetails['branchId'],
        vehicleDetails: { ...this.vehicleForm.getRawValue() },
        driverDetails: [
          {
            isSameAsInsured: 'Y'
          }],
        insured: { ...this.insuredForm.getRawValue(), ...this.basicUserDetails, ...this.additionalDetails }
      }
      // adding one day to date fields

      let licenseIssueDate;
      let dob;
      if (this.vehicleForm['value']['licenseIssueDate']['_d']) {
        licenseIssueDate = new Date(this.vehicleForm['value']['licenseIssueDate']);
        licenseIssueDate.setDate(licenseIssueDate.getDate() + 1);
      } else {
        licenseIssueDate = this.vehicleForm['value']['licenseIssueDate'];
      }
      if (this.insuredForm['value']['dob']['_d']) {
        dob = new Date(this.insuredForm['value']['dob']);
        dob.setDate(dob.getDate() + 1);
      } else {
        dob = this.insuredForm['value']['dob'];
      }
      data['insured']['licenseIssueDate'] = licenseIssueDate
      data['vehicleDetails']['licenseIssueDate'] = licenseIssueDate;
      data['driverDetails'][0]['licenseIssueDate'] = licenseIssueDate;
      data['insured']['dob'] = dob;
      if (data['vehicleDetails']['prevPolicyExpDate'] && data['vehicleDetails']['registeredDate']) {
        if (data['vehicleDetails']['prevPolicyExpDate']['_d']) {
          data['vehicleDetails']['prevPolicyExpDate'] = new Date(data['vehicleDetails']['prevPolicyExpDate']);
          data['vehicleDetails']['prevPolicyExpDate'].setDate(data['vehicleDetails']['prevPolicyExpDate'].getDate() + 1)
        }
        if (data['vehicleDetails']['registeredDate']['_d']) {
          data['vehicleDetails']['registeredDate'] = new Date(data['vehicleDetails']['registeredDate']);
          data['vehicleDetails']['registeredDate'].setDate(data['vehicleDetails']['registeredDate'].getDate() + 1)
        }
      }
      // auto populating gender based on prefix;
      if (data['insured']['prefix'] === 'Ms' || data['insured']['prefix'] === 'Mrs') {
        data['insured']['gender'] = 'F';
      } else {
        data['insured']['gender'] = 'M';
      }
      // auto populating claimsHistory
      data['vehicleDetails']['claimsHistory'] = "3";
      if (this.isLoggedInUser) {
        data['customerId'] = this.loggedInUserName;
      }
      data['customerId'] = this.additionalDetails['customerId']
      data['vehicleDetails']['engineNumber'] = this.additionalDetails['engineNumber'];
      data['vehicleDetails']['registerNumber'] = this.additionalDetails['registerNumber'];
      data['vehicleDetails']['registrationMark'] = this.additionalDetails['registrationMark'];
      data['vehicleDetails']['colorId'] = this.additionalDetails['colorId'];
      // validating tc & chassis numbers
      let params = {
        chassisNo: this.vehicleForm.getRawValue().chassisNo,
        tcNo: data['vehicleDetails']['tcFileNumber']
      }
      if (data['vehicleDetails']['regStatus'] === '03') {
        params['regStatus'] = 'R'
        params['prevPolicyExpDate'] = moment(data['vehicleDetails']['prevPolicyExpDate']).format("YYYY-MM-DD")
      } else {
        params['regStatus'] = 'N'
      }
      this.fetchAllPlans(data);
      // this.validateTCnoAndChassisNo(params, data);
    }
  }

  goBack() {
    this.router.navigate(['/new-login'], {
      queryParams: { reviseDetails: true }
    })
  }

  submitGrid() {
    this.showForm = true;
    this.showGrid = false;
    this.enableContinue = false;
    this.vehicleForm.patchValue({
      chassisNo: this.chassisNoForm.value.chassisNo,
      makeId: this.autoData[this.selectedTrim]['makeId'],
      modelId: this.autoData[this.selectedTrim]['modelId'],
      makeYear: this.autoData[this.selectedTrim]['makeYear'].toString(),
      trim: this.autoData[this.selectedTrim]['trim'],
      noOfPassengers: this.autoData[this.selectedTrim]['noOfSeats'],
      vehicleValue: this.autoData[this.selectedTrim]['vehicleValue'],
      vehicleTypeId: this.autoData[this.selectedTrim]['vehicleTypeId'],
      noOfDoors: this.autoData[this.selectedTrim]['noOfDoors']
    });
    this.maxVehicleValue = this.autoData[this.selectedTrim]['maxValue'];
    this.minValue = this.autoData[this.selectedTrim]['vehicleValue'];
    this.maxValue = this.autoData[this.selectedTrim]['maxValue'];
    this.gaugeValue = this.vehicleForm.value['vehicleValue'];
    this.setRepairTypeAndRegType(this.autoData[this.selectedTrim]['makeYear']);
    if (this.dataService.getUserDetails().personalId) {
      this.isLoggedInUser = true;
      this.loggedInUserName = this.dataService.getUserDetails().customerId
      this.vehicleForm.patchValue({
        tcFileNumber: this.dataService.getUserDetails().tcNumber
      });
      if (this.vehicleForm.controls.chassisNo.status === 'VALID') {
        this.getUserDetailsByTcNo();
      }
    }
  }

  // based on tcNumber
  getUserDetailsByTcNo() {
    let params = {
      tcNo: this.vehicleForm.value['tcFileNumber'],
      chassisNo: this.vehicleForm.getRawValue().chassisNo
    }
    this.subscription = this.coreService.getInputsDbsync('policy/fetchByChassisNoAndTcNo', params).subscribe(res => {
      if (res) {
        this.insuredForm.patchValue(res.userDetails);
        this.vehicleForm.patchValue({
          prevPolicyExpDate: res.vehicleDetails.prevPolicyExpDate,
          licenseIssueDate: res.userDetails.licenseIssuedDate
        });
        this.patchAdditionalDetails(res);
      }
    }, err => {
    });
  }

  patchAdditionalDetails(data) {
    this.additionalDetails['address1'] = data.userDetails.address1;
    this.additionalDetails['address2'] = data.userDetails.address2;
    this.additionalDetails['address4'] = data.userDetails.address4;
    this.additionalDetails['city'] = data.userDetails.city;
    this.additionalDetails['fullNameBL'] = data.userDetails.fullNameBL;
    this.additionalDetails['nationality'] = data.userDetails.nationality;
    this.additionalDetails['occupation'] = data.userDetails.occupation;
    this.additionalDetails['personalId'] = data.userDetails.personalId;
    this.additionalDetails['taxId'] = data.userDetails.taxId;
    this.additionalDetails['postBox'] = data.userDetails.postBox;
    this.additionalDetails['prefixBL'] = data.userDetails.prefixBL;
    // vehicle details
    this.additionalDetails['engineNumber'] = data.vehicleDetails.engineNo;
    this.additionalDetails['registerNumber'] = data.vehicleDetails.regNo;
    this.additionalDetails['registrationMark'] = data.vehicleDetails.registrationMark;
    this.additionalDetails['colorId'] = data.vehicleDetails.colorId;
    this.additionalDetails['customerId'] = data.userDetails.customerId;
  }

  setRepairTypeAndRegType(makeYear) {
    if ((this.today.getFullYear() - makeYear) >= 5) {
      this.vehicleForm.patchValue({
        repairType: '2'
      });
      this.vehicleForm.controls.repairType.disable();
    } else if ((this.today.getFullYear() - makeYear) <= 2) {
      this.vehicleForm.patchValue({
        repairType: '1'
      });
    } else {
      this.vehicleForm.patchValue({
        repairType: '2'
      });
    }
    // Setting Registration Type
    if ((this.today.getFullYear() <= makeYear)) {
      this.vehicleForm.patchValue({
        regStatus: 'N'
      });
      this.manipulateFields(['prevPolicyExpDate', 'registeredDate'], 0);
    } else {
      this.vehicleForm.patchValue({
        regStatus: '03'
      });
      this.manipulateFields(['prevPolicyExpDate', 'registeredDate'], 1);
    }
  }

  regTypeChange(value) {
    if (value === 'N') {
      this.vehicleForm.patchValue({
        regStatus: 'N'
      });
      this.manipulateFields(['prevPolicyExpDate', 'registeredDate'], 0);
    } else {
      this.vehicleForm.patchValue({
        regStatus: '03'
      });
      this.manipulateFields(['prevPolicyExpDate', 'registeredDate'], 1);
    }
  }

  manipulateFields(fields, type) {
    fields.forEach(field => {
      if (type === 0) {
        this.vehicleForm.get(field).setValue(null);
        this.vehicleForm.get(field).clearValidators();
        this.vehicleForm.get(field).updateValueAndValidity();
      } else {
        if (field === 'prevPolicyExpDate') {
          this.vehicleForm.get(field).setValidators([Validators.required, PolicyExpDateValidator]);
        } else {
          this.vehicleForm.get(field).setValidators([Validators.required]);
        }
        this.vehicleForm.get(field).updateValueAndValidity();
      }
    });
  }

  registeredAtChange(value) {
    let params = {
      productId: "*",
      filterByValue: value,
      optionType: 'LOC_DIVN'
    }
    this.subscription = this.coreService.getInputs('brokerservice/options/list', params).subscribe(res => {
      this.additionalDetails['branchId'] = res.data[0].value;
    })
    this.vehicleForm.get('tcFileNumber').setValue(null);
    if (value === '1102') {
      this.tcNoLength = 8;
      this.vehicleForm.get('tcFileNumber').setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(8)]);
      this.vehicleForm.get('tcFileNumber').updateValueAndValidity();
    } else {
      this.tcNoLength = 10;
      this.vehicleForm.get('tcFileNumber').setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
      this.vehicleForm.get('tcFileNumber').updateValueAndValidity();
    }
  }

  trimChanged(event) {
    this.enableGridBtn = false;
    this.selectedTrim = event.target.value
  }

  loadVehicleDropDowns(key, targetFieldId, value) {
    return new Promise(resolve => {
      let mthd;
      if (key == 'makeId') {
        mthd = this.coreService.listModel(value);
      }
      if (mthd)
      this.subscription = mthd.subscribe((response: any) => {
          this.options[targetFieldId] = response.data;
          resolve();
        });
    });
  }

  gaugeChange() {
    this.gaugeValue = this.vehicleForm.value['vehicleValue'];
  }

  // to validate TC No & Chassis No
  validateTCnoAndChassisNo(params, data) {
    this.spinner.show();
    this.subscription = this.coreService.getInputsDbsync('validateChassisNoAndTcNo', params).subscribe(res => {
      if (res.responseCode === -1) {
        this.fetchAllPlans(data);
      } else {
        this.spinner.hide();
        let errorMsg = '';
        switch (res.responseCode) {
          case 1: {
            errorMsg = 'Policy exists for the Chassis No. / TCF No.';
            break;
          }
          case 2: {
            errorMsg = 'Policy is expired';
            break;
          }
          case 3: {
            errorMsg = 'Policy expiry date is not valid';
            break;
          }
        }
        this.toastr.error('', errorMsg, {
          timeOut: 3000
        });
      }
    }, err => {
      this.spinner.hide();
    });
  }

  // Fetching Plan Details
  fetchAllPlans(data) {
    this.spinner.show();
    this.subscription = this.coreService.saveInputs('fetchAllPlansWithRate', data, null).subscribe(response => {
      this.spinner.hide();
      if (response.status === 'VF') {
        this.router.navigate(['/contact-message', 'br-failed']);
      } else {
        const navigationExtras = {
          state: {
            response
          }
        }
        this.router.navigate(['/compare-plans'], navigationExtras);
      }
    }, err => {
      this.spinner.hide();
    });
  }

  async getQuoteDetails() {
    this.spinner.show();
    let url = "brokerservice/quotes/quoteDetailsSummary";
    let param = {
      quoteNumber: this.quoteNo
    }
    this.dropdownservice.getInputs(url, param).subscribe((response) => {
      this.spinner.hide();
      this.quoteDetails = response.data.quoteSummary;
      if (this.quoteDetails) {
        this.patchAdditionalDetails(this.quoteDetails)
        this.productId = this.quoteDetails['productTypeId']
        this.showForm = true;
        this.loadVehicleDropDowns('makeId', 'model', this.quoteDetails['vehicleDetails']['makeId']);
        this.patchQuoteDetails();
      }
    });
  }

  patchQuoteDetails() {
    this.vehicleForm.patchValue(this.quoteDetails['vehicleDetails']);
    this.insuredForm.patchValue(this.quoteDetails['userDetails']);
    this.vehicleForm.patchValue({
      makeYear: this.quoteDetails['vehicleDetails']['makeYear'].toString(),
      ncdYears: this.quoteDetails['vehicleDetails']['ncdYears'].toString(),
      licenseIssueDate: this.quoteDetails['userDetails']['licenseIssueDate']
    });
    this.gaugeValue = this.quoteDetails['vehicleDetails']['vehicleValue'];
    if (this.quoteDetails['vehicleDetails']['registeredAt'] === '1102') {
      this.tcNoLength = 8;
      this.vehicleForm.get('tcFileNumber').setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(8)]);
      this.vehicleForm.get('tcFileNumber').updateValueAndValidity();
    }
  }

  resetDropDown() {
    this.showGrid = false;
    this.showForm = false;
    this.selected = [];
    this.items = this.options.regYear;
    this.gridDetails = [];
    this.trimOption = [];
    this.enableContinue = true;
  }

  makeYearValidation(value) {
    let makeYear = parseInt(value);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const yearDiff = year - makeYear;
    if (yearDiff > 7 && this.productId === '1113') {
      let dialogRef = this.dialog.open(ProductChangePopupComponent, {
        width: '450px'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.productId = '1116';
          this.basicUserDetails['productTypeName'] = 'Third Party Insurance';
          let value = this.dataService.getUserDetails();
          value['productType'] = '1116';
          this.dataService.setUserDetails(value);
          this.getAutoData();
        } else {
          this.navigateToMsgScreen('quotation-failed');
        }
      });
    } else if (this.searchType != 'Manual') {
      this.validateAutoData();
    };
  }

  async onchangeLoadDropdown() {
    if (this.chassisNoForm.status === 'INVALID') {
      this.searchType = 'Manual';
      this.chassisNoForm.controls['chassisNo'].setErrors({});
      this.chassisNoForm.controls['chassisNo'].markAsUntouched();
      this.chassisNoForm.controls['chassisNo'].updateValueAndValidity();
      console.log(this.chassisNoForm)
      this.checkTcNoStatus = true;
    }
    if (this.selected.length === 0) {
      this.items = this.options.regYear;
    }
    if (this.selected.length == 1) {
      if (this.selected[0].value && this.productId === '1113')
        this.makeYearValidation(this.selected[0].value)
      this.typeHint = 'Make';
      this.items = this.options.make;
    } else if (this.selected.length == 2) {
      if (this.showGrid) {
        this.showGrid = false;
        this.gridDetails = [];
        this.trimOption = [];
        this.showForm = false;
      }
      this.typeHint = 'Model';
      await this.loadVehicleDropDowns('makeId', 'model', this.selected[1].value);
      this.items = this.options.model;
    }
    else if (this.selected.length == 3) {
      this.spinner.show();
      let params = {
        modelYear: this.selected[0].value,
        make: this.selected[1].value,
        model: this.selected[2].value
      };
      if (this.productId === '1113') {
        this.subscription = this.coreService.greyImportService('ae/findVehicleWithPrice', params).subscribe(res => {
          this.autoData = res;
          this.validateAutoData();
          this.spinner.hide();
        });
      } else {
        this.subscription = this.coreService.greyImportService('ae/findVehicle', params).subscribe(res => {
          this.autoData = res;
          this.validateAutoData();
          this.spinner.hide();
        });
      }
    }
  }

  navigateToMsgScreen(type) {
    let value = this.dataService.getUserDetails();
    value['chassisNo'] = this.chassisNoForm.controls.chassisNo.value;
    this.dataService.setUserDetails(value);
    this.router.navigate(['/contact-message', type]);
  }

  chassisNoChange() {
    if (this.vehicleForm.controls.chassisNo.status === 'VALID') {
      let greyParams = {
        chassisNo: this.vehicleForm.value.chassisNo,
        productId: this.productId
      }
      this.subscription = this.coreService.greyImportService('ae/isImportedVehicle', greyParams).subscribe(res => {
        if (res) {
          this.navigateToMsgScreen('autodata-failed')
        }
      });
    }
  }
  trackByFn(index) {
    return index;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
}
}