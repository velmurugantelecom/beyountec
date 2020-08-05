import { Component, OnInit, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { CoreService } from '../core/services/core.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DropDownService } from '../core/services/dropdown.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { AppService } from '../core/services/app.service';
import { EmailPopupComponent } from '../modal/email-popup/email-popup.component';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { WebCamComponent } from '../shared/web-cam/web-cam.component';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ScanAndUpload } from '../shared/scan-and-upload/scan-and-upload.component';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

@Component({
  selector: 'app-additional-details',
  templateUrl: './additional-details.component.html',
  styleUrls: ['./additional-details.component.scss'],
  providers: [DatePipe]
})
export class AdditionalDetailsComponent implements OnInit {

  public isAttachmentArea: boolean;
  public additionalDetails: FormGroup;
  public quoteDetails: any;
  public options: any = {};
  public showBankField: boolean;
  public quoteNo;
  public showHeader = false;
  public mailId: string;
  public isReviseDetails;
  public isOldQuote;
  public fileContainer = [];
  public DocUploadForm: FormGroup;
  public addMoreDoc: boolean;
  public activeStepper;
  public isAttachmentSubmitted: boolean;
  public selectedBank = null;
  public selectedColor = null;
  public selectedPlate = null;
  public selectedNationality = null;
  public selectedOccupation = null;
  public policyPopup: any;
  public effetiveDates: any
  public nowTime: any;
  public minTime: any;
  public RegistrationNoRequired: boolean = true;
  public questionnaireStatus:boolean=false;
  public RegistrationMarkRequired:boolean =true;
  public QuestionnaireStatusShow:boolean =false;
  yes: any;
  no: any;
  public language: any;
  @ViewChild('stepper', { static: false }) private stepper: MatStepper;
  filteredBanks: Observable<string[]>;
  filteredColors: Observable<string[]>;
  filteredPlateCodes: Observable<string[]>;
  filteredNationality: Observable<string[]>;
  filteredOccupation: Observable<string[]>;
  public maxEffectiveDate;
  public today = moment(new Date()).subtract(1, 'd')
  public effectiveDateChanged = false
  public currentEffDate;
  public subscription: Subscription;
  public goTo = '';
  constructor(private formBuilder: FormBuilder,
    private coreService: CoreService,
    private router: Router, private route: ActivatedRoute,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public toasterService: ToastrService,
    private cdr: ChangeDetectorRef,
    private dropdownservice: DropDownService,
    private translate: TranslateService,
    private datePipe: DatePipe

  ) { }

  ngOnInit() {
    let date = moment(new Date()).add(1, 'd')
    this.additionalDetails = this.formBuilder.group({
      colorId: ['', [Validators.required]],
      noOfDoors: ['', [Validators.required, Validators.min(1), Validators.max(99)]],
      mortgagedYN: ['', [Validators.required]],
      bankName: ['', [Validators.required]],
      regNo: ['', [Validators.required]],
      engineNo: ['', []],
      registrationMark: ['', [Validators.required]],
      effectiveDate: [date, [Validators.required]],
      fullNameBL: ['', Validators.required],
      prefixBL: ['', [Validators.required]],
      taxId: ['', []],
      nationality: ['', [Validators.required]],
      address4: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['12', [Validators.required]],
      address1: ['', [Validators.required]],
      address2: ['', []],
      occupation: ['', [Validators.required]],
      postBox: ['', []],
      personalId: ['', [Validators.required, Validators.minLength(15)]],
      questionnaire: ['', []]

    });
    this.DocUploadForm = this.fb.group({});
    this.route.queryParams
      .subscribe(params => {
        this.quoteNo = params['quoteNo'];
        this.isReviseDetails = params['reviseDetails'];
        this.isOldQuote = params['retrieveQuote'];
        this.goTo = params['goTo'];
      });
    this.spinner.show();
    if (this.isReviseDetails || this.isOldQuote) {
      if (this.goTo === '3') {
        this.activeStepper = 'three'
      } else {
        this.activeStepper = 'second';
      }
      this.doContinue('1');
      setTimeout(() => {
        this.goForward();
      }, 1000)
    } else {
      this.loadQuoteDetails();
    }
    this.language = localStorage.getItem("language");
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }

  ngAfterViewInit() {
    if (this.activeStepper === 'second')
      this.stepper.selectedIndex = 1;
    else if (this.goTo === '3') {
      this.isAttachmentArea = true;
      this.stepper.selectedIndex = 2;
    }
    this.cdr.detectChanges();
  }

  private _filter(value, key): string[] {
    const filterValue = value ? value.toLowerCase() : '';

    let c = this.options[key].filter(option => option['label'].toLowerCase().includes(filterValue));
    return c
  }

  changeEffectiveDate() {

  }
  dateConversion(date: any) {
    function formatDate(date) {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      return [year, month, day].join('-');
    }
    return formatDate(date);
  }
  updateEffectiveDate(type) {
    let effectiveDate;
    if (type === 'change') {
      this.effectiveDateChanged = true;
      effectiveDate = new Date(this.additionalDetails.value['effectiveDate']).setUTCHours(0, 0, 0, 0);
    } else {
      effectiveDate = new Date(this.additionalDetails.value['effectiveDate']);
    }
    this.effetiveDates = this.dateConversion(effectiveDate);
    this.nowTime = this.dateConversion(new Date());
    this.minTime = this.datePipe.transform(new Date(), 'H:mm');;
    if (this.effetiveDates <= this.nowTime) {
      this.effetiveDates = this.effetiveDates.concat('T' + this.minTime + ':00.000Z');
    }
    else {
      this.effetiveDates = this.effetiveDates.concat('T00:00:00.000Z');

    }
    let params = {
      quoteId: this.quoteDetails.quoteId,
      amndVerNo: 0,
      //  startDate: new Date(effectiveDate).toISOString(),
      startDate: this.effetiveDates,
      productId: this.quoteDetails.productTypeId
    }
    this.subscription = this.coreService.postInputs2('changeStartDate', '', params).subscribe(res => {
    }, err => {
    });
  }

  loadQuoteDetails() {
    let url = "brokerservice/quotes/quoteDetailsSummary";
    let params = {
      quoteNumber: this.quoteNo
    }
    this.dropdownservice.getInputs(url, params).subscribe((response) => {
      if (response.data && response.data != null) {
        this.quoteDetails = response.data.quoteSummary;
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
      this.maxEffectiveDate = moment(new Date()).add('days', 30)['_d'];
      this.getDropDownOptions('bankName', 'BANKNAME', response.data.quoteSummary.productTypeId);
      this.getDropDownOptions('plateCode', 'VEH_REG_MARK', response.data.quoteSummary.productTypeId);
      this.getUploadedDocs();
      if (this.quoteDetails.vehicleDetails.regStatus === 'N' && this.quoteDetails.vehicleDetails.registeredAt != "1102") {
        this.additionalDetails.get('registrationMark').setValidators([]);
        this.additionalDetails.get('registrationMark').updateValueAndValidity();
        this.additionalDetails.get('regNo').setValidators([]);
        this.additionalDetails.get('regNo').updateValueAndValidity();
        this.RegistrationNoRequired = false;
        this.RegistrationMarkRequired = false;
      }
      if (this.quoteDetails.vehicleDetails.regStatus === 'N' && this.quoteDetails.vehicleDetails.registeredAt == "1102") {
      this.questionnaireStatus = false;
      this.RegistrationNoRequired= false;
      this.RegistrationMarkRequired=false;
      this.additionalDetails.get('registrationMark').setValidators([]);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
      this.additionalDetails.get('regNo').setValidators([]);
      this.additionalDetails.get('regNo').updateValueAndValidity();
      }
      else if (this.quoteDetails.vehicleDetails.regStatus === '03' && this.quoteDetails.vehicleDetails.registeredAt == "1102") {
        this.questionnaireStatus = false;
        this.RegistrationNoRequired= true;
        this.RegistrationMarkRequired=true;
        this.additionalDetails.get('registrationMark').setValidators([Validators.required]);
        this.additionalDetails.get('registrationMark').updateValueAndValidity();
        this.additionalDetails.get('regNo').setValidators([Validators.required]);
        this.additionalDetails.get('regNo').updateValueAndValidity();
      }
      if(this.quoteDetails.vehicleDetails.registeredAt == "1102"){
        this.QuestionnaireStatusShow =true;
        }
      this.translate.get('Yes').subscribe(value => {
        this.yes = value;
      });
      this.translate.get('No').subscribe(value => {
        this.no = value;
      });
      this.mailId = this.quoteDetails.userDetails.email;
      this.options['financed'] = [
        {
          label: this.no,
          value: 'N'
        }, {
          label: this.yes,
          value: 'Y'
        },];
        this.options['questionnaire'] = [
          {
            label: 'Is the vehicle already registered in Dubai?',
            value: '04'
          }, {
            label: 'First time registered in Dubai?',
            value: 'N'
          }, {
            label: 'Renewing your existing vehicle in Dubai?',
            value: '03'
          }];
       
         // if(( this.quoteDetails.vehicleDetails.registeredAt != "1102")||(this.isReviseDetails)){
            this.additionalDetails.patchValue({
              questionnaire: this.quoteDetails.vehicleDetails.regStatus
            });
         // }
      if ((!this.isReviseDetails) && (!this.isOldQuote)) {
        if (this.quoteDetails.productTypeId == '1116') {
          this.additionalDetails.patchValue({
            mortgagedYN: this.options['financed'][0].value
          });
        }
        else {
          this.additionalDetails.patchValue({
            mortgagedYN: '',
          });
        }
      }
      this.getDropDownOptions('vehicleColor', 'COLOUR');
      this.getDropDownOptions('country', 'COUNTRY');
      this.getDropDownOptions('nationality', 'NATIONALITY');
      this.getDropDownOptions('motor_emirate', 'MOTOR_EMIRATE');
      this.getDropDownOptions('profession', 'PROFESSION');
      this.patchFormValues();
      this.options['prefix'] = [{ "label": "السيد", "value": "Mr" }, { "label": "تصلب متعدد", "value": "Ms" }, { "label": "السيدة", "value": "Mrs" }]
    });
  }

  addAdditionalDetail(stepper: MatStepper) {
    if (this.showBankField) {
      if (!this.selectedBank || this.selectedBank !== this.additionalDetails.controls['bankName'].value) {
        this.additionalDetails.controls['bankName'].setValue(null);
        this.selectedBank = '';
      }
    }
    if (!this.selectedColor || this.selectedColor !== this.additionalDetails.controls['colorId'].value) {
      this.additionalDetails.controls['colorId'].setValue(null);
      this.selectedColor = '';
    }
    if (!this.selectedPlate || this.selectedPlate !== this.additionalDetails.controls['registrationMark'].value) {
      this.additionalDetails.controls['registrationMark'].setValue(null);
      this.selectedPlate = '';
    }
    if (!this.selectedNationality || this.selectedNationality !== this.additionalDetails.controls['nationality'].value) {
      this.additionalDetails.controls['nationality'].setValue(null);
      this.selectedNationality = '';
    }
    if (!this.selectedOccupation || this.selectedOccupation !== this.additionalDetails.controls['occupation'].value) {
      this.additionalDetails.controls['occupation'].setValue(null);
      this.selectedOccupation = '';
    }
    if (this.additionalDetails.invalid) {
      return;
    }
    this.spinner.show();
    let profession;
    this.options['profession'].forEach(element => {
      if (element.label === this.additionalDetails.value['occupation']) {
        profession = element.value;
      }
    });
    let nationality;
    this.options['nationality'].forEach(element => {
      if (element.label === this.additionalDetails.value['nationality']) {
        nationality = element.value;
      }
    });
    let insuredDetails = {
      quoteId: this.quoteDetails.quoteId,
      quoteNo: this.quoteNo,
      address1: this.additionalDetails.value['address1'],
      address2: this.additionalDetails.value['address2'],
      postBox: this.additionalDetails.value['postBox'],
      fullName: this.quoteDetails.userDetails.fullName,
      age: this.quoteDetails.userDetails.age,
      licenseIssueDate: this.quoteDetails.userDetails.licenseIssueDate,
      email: this.quoteDetails.userDetails.email,
      licenseExpiryDate: this.quoteDetails.userDetails.licenseExpiryDate,
      mobileNo: this.quoteDetails.userDetails.mobileNo,
      //personalId: this.quoteDetails.userDetails.personalId,
      personalId: this.additionalDetails.value['personalId'],
      nationality: nationality,
      fullNameBL: this.additionalDetails.value['fullNameBL'],
      firstNameBL: this.additionalDetails.value['fullNameBL'],
      prefixBL: this.additionalDetails.value['prefixBL'],
      taxId: this.additionalDetails.value['taxId'],
      city: this.additionalDetails.value['city'],
      country: this.additionalDetails.value['country'],
      occupation: profession,
      address4: this.additionalDetails.value['address4'],
      driverSameAsInsured: true
    }
    let bankName;
    this.options['bankName'].forEach(element => {
      if (element.label === this.additionalDetails.value['bankName']) {
        bankName = element.value;
      }
    });
    let color;
    this.options['vehicleColor'].forEach(element => {
      if (element.label === this.additionalDetails.value['colorId']) {
        color = element.value;
      }
    });
    let plateCode;
    this.options['plateCode'].forEach(element => {
      if (element.label === this.additionalDetails.value['registrationMark']) {
        plateCode = element.value;
      }
    });
    let vehicledetails = {
      colorId: color,
      mortgagedYN: this.additionalDetails.value['mortgagedYN'],
      bankName: bankName,
      sgsID: this.quoteDetails.quoteId,
      noOfDoors: this.additionalDetails.value['noOfDoors'],
      registeredAt: this.quoteDetails.vehicleDetails.registeredAt,
      registrationMark: plateCode,
      regNo: this.additionalDetails.value['regNo'],
      engineNo: this.additionalDetails.value['engineNo'],
      regStatus: this.additionalDetails.value['questionnaire'],
      trim: this.quoteDetails.vehicleDetails.trim
    }
    if (vehicledetails.mortgagedYN === 'N') {
      delete vehicledetails['bankName'];
    }
    let params = {
      quoteNumber: this.quoteNo
    }
    if (!moment(this.currentEffDate).isSame(this.additionalDetails.value.effectiveDate))
      this.updateEffectiveDate('change')
    else
      this.updateEffectiveDate(null)
    this.subscription = this.coreService.postInputs(`brokerservice/vehicledetails/updateVehicleDetails`, [vehicledetails], params).subscribe(response => {
      this.subscription = this.coreService.postInputs(`brokerservice/insuredetails/addinsure`,
        insuredDetails, null).subscribe(response => {
          this.spinner.hide();
          stepper.next();
        }, err => {
          this.spinner.hide();
        });
    });
    this.isAttachmentArea = true;
  }



  financeStatusChange(value) {
    if (value === 'Y') {
      this.showBankField = true;
    } else {
      this.showBankField = false;
      this.additionalDetails.get('bankName').setValidators([]);
      this.additionalDetails.get('bankName').updateValueAndValidity();
    }
  }

  registrationNoChange(regNoValue) {
    if (regNoValue.target.value.length > 0) {
      this.RegistrationMarkRequired=true;
      this.additionalDetails.get('registrationMark').setValidators(Validators.required);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
    }
    else {
      this.RegistrationMarkRequired=false;
      this.additionalDetails.get('registrationMark').setValidators([]);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
    }
  }
  questionnaireStatusChange(value) {
    if (value === '04') {
      this.questionnaireStatus = true;
      this.RegistrationNoRequired= true;
      this.RegistrationMarkRequired=true;
      this.additionalDetails.get('registrationMark').setValidators([Validators.required]);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
      this.additionalDetails.get('regNo').setValidators([Validators.required]);
      this.additionalDetails.get('regNo').updateValueAndValidity();
    } else if(value === 'N'){
      this.questionnaireStatus = false;
      this.RegistrationNoRequired= false;
      this.RegistrationMarkRequired=false;
      this.additionalDetails.get('registrationMark').setValidators([]);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
      this.additionalDetails.get('regNo').setValidators([]);
      this.additionalDetails.get('regNo').updateValueAndValidity();
    }
    else if(value === '03'){
      this.questionnaireStatus = false;
      this.RegistrationNoRequired= true;
      this.RegistrationMarkRequired=true;
      this.additionalDetails.get('registrationMark').setValidators([Validators.required]);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
      this.additionalDetails.get('regNo').setValidators([Validators.required]);
      this.additionalDetails.get('regNo').updateValueAndValidity();
    }
  }

  emiratesChange(value) {
    let params = {
      productId: "*",
      filterByValue: value,
      optionType: 'MOTOR_CITY'
    }
    this.subscription = this.coreService.getInputs('brokerservice/options/list', params).subscribe((response) => {
      this.options['city'] = response.data;
      if (this.quoteDetails.userDetails['address4'] == value) {
        this.additionalDetails.patchValue({
          city: this.quoteDetails.userDetails['city'],
        });
      }
      else {
        this.additionalDetails.patchValue({
          city: '',
        });
      }
    });
  }

  getDropDownOptions(key: string, optionId: string, productId = '*') {
    this.subscription = this.coreService.listOptions(optionId, productId).subscribe((response: any) => {
      this.options[key] = response.data;
      if (key === 'bankName') {
        this.filteredBanks = this.additionalDetails['controls']['bankName'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value, key);
              return c;
            })
          );
      } else if (key === 'vehicleColor') {
        this.filteredColors = this.additionalDetails['controls']['colorId'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value, key);
              return c;
            })
          );
      } else if (key === 'plateCode') {
        this.filteredPlateCodes = this.additionalDetails['controls']['registrationMark'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value, key);
              return c;
            })
          );
      } else if (key === 'nationality') {
        this.filteredNationality = this.additionalDetails['controls']['nationality'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value, key);
              return c;
            })
          );
      } else if (key === 'profession') {
        this.filteredOccupation = this.additionalDetails['controls']['occupation'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value, key);
              return c;
            })
          );
      }
    });
  }

  doNavigate(event) {
    event.preventDefault();
    this.isAttachmentSubmitted = true;
    if (this.DocUploadForm.status != 'INVALID')
      this.router.navigate([`/quote-summary`], {
        queryParams: {
          quoteNo: this.quoteNo,
          isQuickSummary: false
        }
      });
  }

  doContinue(value) {
    this.showHeader = true;
    if (value === '0') {
      this.patchFormValues();
    }
  }


  goForward() {
    this.loadQuoteDetails();
  }

  goBack(stepper: MatStepper) {
    stepper.previous();
    this.isAttachmentArea = false;
  }

  get VehicleDetails() {
    return this.additionalDetails.controls.VehicleDetails as FormGroup;
  }

  get insuredDetails() {
    return this.additionalDetails.controls.insuredDetails as FormGroup;
  }

  get formCtrls() {
    return this.additionalDetails.controls;
  }

  get formCtrlsDoc() {
    return this.DocUploadForm.controls;
  }
  downloadDocuments() {
    let url = `brokerservice/quotes/quotePdfreport?quoteNumber=${this.quoteNo}`
    this.subscription = this.coreService.getDownload(url, '').subscribe((response) => {
      if (response) {
        var link = document.createElement("a");
        link.href = URL.createObjectURL(response);
        link.download = `Motor_Insurance_Quote.pdf`;
        link.click();
      }
    })
  }

  openAttachment(value) {
    let fileName = `${this.quoteDetails.quoteId}_0_${value}`;
    this.subscription = this.coreService.mergeDocument('brokerservice/documentupload/downloadFile?fileName=' + fileName).subscribe((response: any) => {
      var link = document.createElement("a");
      link.href = URL.createObjectURL(response);
      link.download = value;
      link.click();
    });
  }

  sendMail() {
    let dialogRef = this.dialog.open(EmailPopupComponent, {
      width: '400px',
      data: {
        head: 'printpopup',
        name: 'this.name',
        mailId: this.mailId,
        docNo: this.quoteNo,
        selectedDocs: `MOT_TPL_QT_${this.quoteNo}_0.pdf`,
        transactionType: 'Q'
      },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  printDocument() {
    this.subscription = this.coreService.mergeDocument(`brokerservice/quotes/quotePdfreport?quoteNumber=${this.quoteNo}`).subscribe((response: any) => {
      var blob = new Blob([response], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.contentWindow.print();
    }, err => {
    });
  }

  reviseDetails() {
    this.router.navigate(['motor-info'], {
      queryParams: {
        quoteNo: this.quoteNo,
        reviseDetails: true
      }
    })
  }

  patchFormValues() {
    if (this.isReviseDetails || this.isOldQuote) {
      this.additionalDetails.patchValue({
        mortgagedYN: this.quoteDetails.vehicleDetails['mortgagedYN'],
      });
      this.additionalDetails.patchValue({
        bankName: this.quoteDetails.vehicleDetails['bankName'],
      });
    }
    if (this.quoteDetails.vehicleDetails['colorName']) {
      this.selectedColor = this.quoteDetails.vehicleDetails['colorName'];
    }
    if (this.quoteDetails.vehicleDetails['registrationMarkDesc']) {
      this.selectedPlate = this.quoteDetails.vehicleDetails['registrationMarkDesc'];
    }
    if (this.quoteDetails.userDetails['nationalityDesc']) {
      this.selectedNationality = this.quoteDetails.userDetails['nationalityDesc'];
    }
    if (this.quoteDetails.userDetails['professionName']) {
      this.selectedOccupation = this.quoteDetails.userDetails['professionName'];
    }
    this.additionalDetails.patchValue({
      // vehicle
      colorId: this.quoteDetails.vehicleDetails['colorName'],
      noOfDoors: this.quoteDetails.vehicleDetails['noOfDoors'],
      // mortgagedYN: this.quoteDetails.vehicleDetails['mortgagedYN'],
      prevPolicyExpDate: this.quoteDetails.vehicleDetails['prevPolicyExpDate'],
      // bankName: this.quoteDetails.vehicleDetails['bankName'],
      registrationMark: this.quoteDetails.vehicleDetails['registrationMarkDesc'],
      regNo: this.quoteDetails.vehicleDetails['regNo'],
      engineNo: this.quoteDetails.vehicleDetails['engineNo'],
      //Insured
      prefixBL: this.quoteDetails.userDetails['prefixBL'],
      fullNameBL: this.quoteDetails.userDetails['fullNameBL'],
      occupation: this.quoteDetails.userDetails['professionName'],
      personalId: this.quoteDetails.userDetails['personalId'],
      nationality: this.quoteDetails.userDetails['nationalityDesc'],
      address1: this.quoteDetails.userDetails['address1'],
      address2: this.quoteDetails.userDetails['address2'],
      postBox: this.quoteDetails.userDetails['postBox'],
      address4: this.quoteDetails.userDetails['address4'],
      taxId: this.quoteDetails.userDetails['taxId'],
      // city: this.quoteDetails.userDetails['city'],
      // country: this.quoteDetails.userDetails['country']
    });
    if (this.isReviseDetails || this.isOldQuote) {
    } else {
      this.additionalDetails.patchValue({
        prefixBL: this.quoteDetails.userDetails['prefix']
      })
    }
    this.selectedBank = this.quoteDetails.vehicleDetails['bankName'];
    // this.selectedColor = this.quoteDetails.vehicleDetails['colorName'];
    // this.selectedPlate = this.quoteDetails.vehicleDetails['registrationMarkDesc'];
    // this.selectedNationality = this.quoteDetails.vehicleDetails['nationalityDesc'];
    // this.selectedOccupation = this.quoteDetails.vehicleDetails['professionName'];
    let effectivDate;
    if (this.quoteDetails.vehicleDetails['prevPolicyExpDate']) {
      effectivDate = moment(this.quoteDetails.vehicleDetails['prevPolicyExpDate']).add(1, 'd');
    } else {
      effectivDate = moment(new Date());
    }
    this.additionalDetails.patchValue({
      effectiveDate: effectivDate
    });
    this.currentEffDate = effectivDate;
  }

  // dynamic 
  addMoreDocuments() {
    if (this.addMoreDoc) {
      return;
    }
    this.addMoreDoc = true;
    let params = {
      quoteId: this.quoteDetails['quoteId'],
      loadAllDocs: 'Y'
    }
    this.subscription = this.coreService.postInputs('brokerservice/documentupload/getUploadDocName', {}, params).subscribe((response: any) => {
      let shallowcopy = this.fileContainer.slice();
      let value = shallowcopy.splice(1);
      const result = response.filter(({ polDoId }) => !value.some(x => x.id == polDoId));
      let index = 4;
      result.forEach((element) => {
        this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
        this.fileContainer.push(
          {
            id: element.polDoId,
            label: element.polDocDes,
            controlName: `documentName${index + 1}`,
            value: ''
          }
        )
        index++;
      });
    });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field, index) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  //  get Uploaded List docs
  getUploadedDocs() {
    let params = {
      quotenumber: this.quoteDetails['quoteId']
    }
    this.subscription = this.coreService.getInputs('brokerservice/documentupload/uploadedDocs', params).subscribe((result: any) => {
      if (result.length > 0) {
        let sortedArray: any[] = result.sort((n1, n2) => n1.docId - n2.docId);
        sortedArray.forEach((element, index) => {
          this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
          let fName = element.fileName.split('_0_');
          this.fileContainer.push(
            {
              id: element.docId,
              controlName: `documentName${index + 1}`,
              value: fName[1] || null
            }
          )
        });
      }
      else {
        this.getDocuments()
      }
    });
  }

  selectFile(event, docId, i, label) {
    this.spinner.show();
    let selectedFileName = event.srcElement.files[0].name;
    const formData = new FormData();
    formData.append('files', event.target.files[0], selectedFileName);
    formData.append('doctypeid', docId);
    formData.append('docDesc', label);
    formData.append('quotenumber', this.quoteDetails['quoteNumber']);
    this.subscription = this.coreService.postInputs('brokerservice/documentupload/uploadMultipleFiles', formData, null).subscribe(response => {
      console.log(response)
      this.spinner.hide();
      let fName = response[0].fileName.split('_0_')
      this.fileContainer[i].value = fName[1];
    }, err => {
      this.spinner.hide();
      this.toasterService.error("", "Invalid File Format", {
        timeOut: 3000
      })
    })

  }

  // get mandatory docs
  getDocuments() {
    let body = {
      quoteId: this.quoteDetails['quoteId'],
      loadAllDocs: "N"
    }
    this.subscription = this.coreService.postInputs('brokerservice/documentupload/getUploadDocName', {}, body).subscribe((response: any) => {
      if (response) {
        response.forEach((element, index) => {
          this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
          this.fileContainer.push({
            id: element.polDoId,
            label: element.polDocDes,
            controlName: `documentName${index + 1}`,
            value: '',
            message: `${element.polDocDes} is required`
          });
        });
      }
    });
  }

  openDialog(docId, i, value, controlName): void {
    if (i === 0) {
      value = 'Vehicle Registration Card';
    }
    let dialogRef = this.dialog.open(ScanAndUpload, {
      panelClass: 'my-class',
      data: { docId: docId, fileName: value, quoteNo: this.quoteDetails['quoteNumber'] }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fileContainer[i].value = result[0].docDesc;
        this.DocUploadForm.value[controlName] = result[0].docDesc;
        this.DocUploadForm.controls[controlName].setErrors(null);
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

  scanUpload(blob, docId, i, filename) {
    this.spinner.show();
    const formData = new FormData();
    formData.append('files', blob, filename);
    formData.append('doctypeid', docId);
    formData.append('docDesc', `${filename}`);
    formData.append('quotenumber', this.quoteDetails['quoteNumber']);
    this.subscription = this.coreService.postInputs('brokerservice/documentupload/uploadMultipleFiles', formData, null).subscribe(response => {
      this.spinner.hide();
      this.fileContainer[i].value = filename;
    }, err => {
      this.spinner.hide();
    })
  }

  dropDownSelected(event: any, type) {
    if (type === 'bankName') {
      this.selectedBank = event.option.value;
    } else if (type === 'color') {
      this.selectedColor = event.option.value;
    } else if (type === 'plateCode') {
      this.selectedPlate = event.option.value;
    } else if (type === 'nationality') {
      this.selectedNationality = event.option.value;
    } else if (type === 'occupation') {
      this.selectedOccupation = event.option.value;
    }
  }

  getCampus(stepper) {
    this.showHeader = true;
    stepper.next();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  onStepperSelectionChange(event: StepperSelectionEvent) {
    console.log(event.selectedStep.label);
    let stepLabel = event.selectedStep.label
    this.scrollToSectionHook();
  }

  private scrollToSectionHook() {
    const element = document.querySelector('.stepperTop');
    console.log(element);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth', block: 'start', inline:
            'nearest'
        });
      }, 250);
    }
  }
}


