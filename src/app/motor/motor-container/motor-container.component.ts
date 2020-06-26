import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from 'src/app/core/services/core.service';
import { AppService } from 'src/app/core/services/app.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as _moment from "moment";
import { ToastrService } from 'ngx-toastr';
import { ProductChangePopupComponent } from 'src/app/modal/product-change/product-change.component';
import { DropDownService } from 'src/app/core/services/dropdown.service';

const moment = _moment;

@Component({
  selector: 'app-motor-container',
  templateUrl: './motor-container.component.html',
  styleUrls: ['./motor-container.component.scss']
})

export class MotorContainerComponent implements OnInit {

  dateVal = new Date();
  public vehicleForm = {};
  public insurerForm = {};
  public driverForm = {};
  public userDetails = {};
  public quoteNumber: string;
  public quoteDetails = {};
  public validFormCount: number = 0;
  public submit: boolean;
  public isVehicleFormValid: boolean;
  public isInsurerFormValid: boolean;
  public isDriverFormValid: boolean;
  public vehicleDetails;
  public driverDetails;
  public insuredDetails;
  public productId;
  public vehicleFormStatus = null;
  public insuredFormStatus = null;
  public driverFormStatus = null;
  public revisedDetails: boolean;
  basicDetails = {};

  constructor(private router: Router, private coreService: CoreService,
    private appService: AppService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dropdownservice: DropDownService) {
  }

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        this.quoteNumber = params['quoteNo'];
        this.revisedDetails = params['reviseDetails'];
      });

    if (localStorage.getItem("isLoggedIn") == "true") {
      this.isloginUser();
    }
    this.appService._insurerDetails.subscribe(value => {
      this.insuredDetails = value;
    })
    this.appService._driverDetails.subscribe(value => {
      this.driverDetails = value;
    })
    this.productId = this.appService.getuserDetails().productType;
    this.basicDetails = { ...this.appService.getuserDetails() }
    if (this.basicDetails['productType'] === '1113') {
      this.basicDetails['productName'] = 'Full Insurance';
    } else {
      this.basicDetails['productName'] = 'Third Party Insurance';
    }

    let autoData = this.appService.getVehicleAutoData();
    if (autoData) {
      if (autoData['trim'].length === 0) {
        this.router.navigate(['/contact-message', 'autodata-failed']);
      }
      this.makeYearValidation(autoData['makeYear']);
      let value = {
        chassisNo: autoData['chassisNo'],
        makeId: autoData['makeId'],
        modelId: autoData['modelId'],
        trimOb: autoData['trim'],
        makeYear: autoData['makeYear'],
        noOfPassengers: autoData['noOfSeats'],
        disableFields: true,
        disableVehicleValue: false
      }
      if (this.productId != '1113') {
        value['disableVehicleValue'] = true;
        value['disableRepairType'] = true;
      }
      this.vehicleDetails = value;
    }
    if (this.quoteNumber == undefined) {
      return;
    }
    this.spinner.show();
    let url = "brokerservice/quotes/quoteDetailsSummary";
    let param = {
      quoteNumber: this.quoteNumber
    }
    this.dropdownservice.getInputs(url, param).subscribe((response) => {
      this.quoteDetails = response.data.quoteSummary;
      if (this.quoteDetails) {
        this.basicDetails = { ...this.quoteDetails['userDetails'] };
        if (this.basicDetails['productType'] === '1113') {
          this.basicDetails['productName'] = 'Full Insurance';
        } else {
          this.basicDetails['productName'] = 'Third Party Insurance';
        }
        this.productId = this.quoteDetails['productTypeId'];
        this.quoteDetails['vehicleDetails']['disableFields'] = true;
        if (this.productId != '1113') {
          this.quoteDetails['vehicleDetails']['disableVehicleValue'] = true;
        } else {
          this.quoteDetails['vehicleDetails']['disableVehicleValue'] = false;

        }
        this.vehicleDetails = this.quoteDetails['vehicleDetails'];
        this.driverDetails = this.quoteDetails['userDetails'];
        this.insuredDetails = this.quoteDetails['userDetails'];
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
    });
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
          let val = this.appService.getuserDetails();
          val['productType'] = '1116';
          this.basicDetails['productName'] = 'Third Party Insurance';
          this.appService.setuserDetails(val);
          this.productId = '1116';
          this.vehicleDetails['disableVehicleValue'] = true;
          this.vehicleDetails['disableRepairType'] = true;
        } else {
          this.router.navigate(['/contact-message', 'quotation-failed']);
        }
      });
    }
    return '';
  }

  checkForm(value) {
    if (value.status) {
      if (value.formName === 'vehicle') {
        this.isVehicleFormValid = true;
        this.vehicleForm = value.event;
      } else if (value.formName === 'insurer') {
        this.isInsurerFormValid = true;
        this.insurerForm = value.event;
      } else {
        this.isDriverFormValid = true;
        this.driverForm = value.event;
      }
    } else {
      if (value.formName === 'vehicle') {
        this.isVehicleFormValid = false;
      } else if (value.formName === 'insurer') {
        this.isInsurerFormValid = false;
      } else {
        this.isDriverFormValid = false;
      }
    }
  }

  doValidateForms() {
    let flag = false;
    if (!this.isVehicleFormValid) {
      this.vehicleFormStatus = false;
      flag = true;
    }
    if (!this.isInsurerFormValid) {
      this.insuredFormStatus = false;
      flag = true;
    }
    if (!this.isDriverFormValid) {
      this.driverFormStatus = false;
      flag = true;
    }
    if (!flag) {
      this.generatePlans(this.productId);
    }
  }

  generatePlans(productId) {
    this.spinner.show();
    let licenseIssueDate = new Date(this.driverForm['licenseIssueDate']);
    licenseIssueDate.setDate(licenseIssueDate.getDate() + 1);
    let licenseExpiryDate = new Date(this.driverForm['licenseExpiryDate']);
    licenseExpiryDate.setDate(licenseExpiryDate.getDate() + 1);
    this.driverForm['licenseIssueDate'] = licenseIssueDate;
    this.driverForm['licenseExpiryDate'] = licenseExpiryDate;
    this.insurerForm['dob'] = new Date(this.insurerForm['dob']);
    this.insurerForm['dob'].setDate(this.insurerForm['dob'].getDate() + 1);
    if (this.vehicleForm['prevPolicyExpDate'] && this.vehicleForm['registeredDate']) {
      this.vehicleForm['prevPolicyExpDate'] = new Date(this.vehicleForm['prevPolicyExpDate']);
      this.vehicleForm['prevPolicyExpDate'].setDate(this.vehicleForm['prevPolicyExpDate'].getDate() + 1);
      this.vehicleForm['registeredDate'] = new Date(this.vehicleForm['registeredDate']);
      this.vehicleForm['registeredDate'].setDate(this.vehicleForm['registeredDate'].getDate() + 1);
    }
    let trafficLoc: any;
    if (this.vehicleForm['registeredAt'] == '1102') {
      trafficLoc = '02'
    } else {
      trafficLoc = '01'
    }
    let data = {
      lobId: 3,
      quoteNumber: "",
      productId: productId,
      prodID: productId,
      customerType: "I",
      startDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      transactionType: "FQ",
      policySource: "CP",
      vehicleDetails: this.vehicleForm,
      branchId: this.vehicleForm['branchId'],
      trafficLoc: trafficLoc,
      driverDetails: [
        {
          isSameAsInsured: 'Y',
          licenseIssueDate: licenseIssueDate,
          licenseExpiryDate: licenseExpiryDate
        }],
      insured: {
        ...this.insurerForm, ...this.driverForm, ...this.appService.getuserDetails(),
      }
    };
    if (this.productId != 1113) {
      data['vehicleDetails']['repairType'] = null
    }
    data['vehicleDetails']['claimsHistory'] = "3";
    if (this.quoteNumber != undefined) {
      data['quoteId'] = this.quoteDetails['quoteId']
    }
    this.appService._insurerDetails.subscribe(value => {
      if (value.personalId == this.insurerForm['personalId']) {
        data['customerId'] = value.customerId;
      }
    });

    if (this.revisedDetails || this.quoteNumber != undefined) {
      // vehicle details
      data['vehicleDetails']['mortgagedYN'] = this.quoteDetails['vehicleDetails']['mortgagedYN'];
      data['vehicleDetails']['bankName'] = this.quoteDetails['vehicleDetails']['bankName'];
      data['vehicleDetails']['noOfDoors'] = this.quoteDetails['vehicleDetails']['noOfDoors'];
      data['vehicleDetails']['colorId'] = this.quoteDetails['vehicleDetails']['colorId'];
      data['vehicleDetails']['gccCountryId'] = this.quoteDetails['vehicleDetails']['gccCountryId'];
      data['vehicleDetails']['prevPolicyExpDate'] = this.quoteDetails['vehicleDetails']['prevPolicyExpDate'];
      // insured details
      data['insured']['address4'] = this.quoteDetails['userDetails']['address4'];
      data['insured']['nationality'] = this.quoteDetails['userDetails']['nationality'];
      data['insured']['city'] = this.quoteDetails['userDetails']['city'];
      data['insured']['taxId'] = this.quoteDetails['userDetails']['taxId'];

    }
    let params = {
      chassisNo: data['vehicleDetails']['chassisNo'],
      tcNo: data['vehicleDetails']['tcFileNumber']
    }
    if (data['vehicleDetails']['regStatus'] === '03') {
      params['regStatus'] = 'R'
      params['prevPolicyExpDate'] = moment(data['vehicleDetails']['prevPolicyExpDate']).format("YYYY-MM-DD")
    } else {
      params['regStatus'] = 'N'
    }
    if (data['productId'] === '1116') {
      data['vehicleDetails']['vehicleValue'] = '';
    }
    // this.fetchAllPlans(data);
    this.coreService.getInputsDbsync('validateChassisNoAndTcNo', params).subscribe(res => {
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
    });
  }

  fetchAllPlans(data) {
    this.coreService.saveInputs('fetchAllPlansWithRate', data, null).subscribe(response => {
      this.spinner.hide();
      localStorage.removeItem('insurerDetails');
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

  // For Login User
  isloginUser() {
    this.coreService.getInputsDbsync("insured/findByUserId", {}).subscribe(response => {
      if (response) {
        this.insuredDetails = response;
        this.basicDetails['mobileCode'] = response['mobileCode'];
        this.basicDetails['mobileNo'] = response['mobileNo'];
        this.basicDetails['email'] = response['email']
        this.appService._loginUserTcNumber.next(response);
        let value = {
          firstName: response.firstName,
          lastName: response.lastName,
          mobileNo: response.mobileNo,
          email: response.email,
          mobileCode: response.mobileCode
        }
        this.appService.setuserDetails(value);
      }
    })
  }
}

