import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { CoreService } from '../core/services/core.service';
import { DropDownService } from '../core/services/dropdown.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { AppService } from '../core/services/app.service';
import { MatDialog } from '@angular/material';
import { EmailPopupComponent } from '../modal/email-popup/email-popup.component';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { WebCamComponent } from '../shared/web-cam/web-cam.component';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ScanAndUpload } from '../shared/scan-and-upload/scan-and-upload.component';

@Component({
  selector: 'app-additional-details',
  templateUrl: './additional-details.component.html',
  styleUrls: ['./additional-details.component.scss']
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
  @ViewChild('stepper', { static: false }) private stepper: MatStepper;
  filteredBanks: Observable<string[]>;
  public maxEffectiveDate;
  public today = moment(new Date()).subtract(1, 'd')
  public effectiveDateChanged = false
  constructor(private formBuilder: FormBuilder,
    private coreService: CoreService,
    private appService: AppService,
    private router: Router, private route: ActivatedRoute,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public toasterService: ToastrService,
    private cdr: ChangeDetectorRef,
    private dropdownservice: DropDownService
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
      prefix: ['', [Validators.required]],
      taxId: ['', []],
      nationality: ['', [Validators.required]],
      address4: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['12', [Validators.required]],
      address1: ['', [Validators.required]],
      address2: ['', []],
      occupation: ['', [Validators.required]],
      postBox: ['', []]
    });
    this.DocUploadForm = this.fb.group({});
    this.route.queryParams
      .subscribe(params => {
        this.quoteNo = params['quoteNo'];
        this.isReviseDetails = params['reviseDetails'];
        this.isOldQuote = params['retrieveQuote'];
      });
    this.spinner.show();
    if (this.isReviseDetails || this.isOldQuote) {
      this.activeStepper = 'second';
      this.doContinue('1');
      setTimeout(() => {
        this.goForward();
      }, 1000)
    } else {
      this.loadQuoteDetails();
    }
  }

  ngAfterViewInit() {
    if (this.activeStepper === 'second')
      this.stepper.selectedIndex = 1;
    this.cdr.detectChanges();
  }

  private _filter(value): string[] {
    const filterValue = value ? value.toLowerCase(): '';

    let c = this.options['bankName'].filter(option => option['label'].toLowerCase().includes(filterValue));
    return c
  }

  changeEffectiveDate(event, type) {
    let effectiveDate;
    if (type === 'change') {
      this.effectiveDateChanged = true;
      effectiveDate = new Date(this.additionalDetails.value['effectiveDate']).setUTCHours(0, 0, 0, 0);
    } else {
      effectiveDate = new Date(this.additionalDetails.value['effectiveDate']);
    }
    let params = {
      quoteId: this.quoteDetails.quoteId,
      amndVerNo: 0,
      startDate: new Date(effectiveDate).toISOString(),
      productId: this.quoteDetails.productTypeId
    }
    this.coreService.postInputs2('changeStartDate', '', params).subscribe(res => {
      console.log(res);
    }, err => {
      console.log(err);
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
        if (this.quoteDetails.productTypeId == '1116') {
          this.additionalDetails.patchValue({ mortgagedYN: 'N' });
        }
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }


      this.maxEffectiveDate = moment(new Date()).add('days', 15)['_d'];
      this.getDropDownOptions('bankName', 'BANKNAME', response.data.quoteSummary.productTypeId);
      this.getDropDownOptions('plateCode', 'VEH_REG_MARK', response.data.quoteSummary.productTypeId);

      this.getUploadedDocs();
      if (this.quoteDetails.vehicleDetails.regStatusDesc === 'New' || this.quoteDetails.vehicleDetails.registeredAt != "Dubai") {
        this.additionalDetails.get('registrationMark').setValidators([]);
        this.additionalDetails.get('registrationMark').updateValueAndValidity();
        this.additionalDetails.get('regNo').setValidators([]);
        this.additionalDetails.get('regNo').updateValueAndValidity();
      }
      this.mailId = this.quoteDetails.userDetails.email;
      this.options['financed'] = [{
        label: 'YES',
        value: 'Y'
      }, {
        label: 'NO',
        value: 'N'
      }];
      this.getDropDownOptions('vehicleColor', 'COLOUR');
      this.getDropDownOptions('country', 'COUNTRY');
      this.getDropDownOptions('nationality', 'NATIONALITY');
      this.getDropDownOptions('motor_emirate', 'MOTOR_EMIRATE');
      this.getDropDownOptions('profession', 'PROFESSION');
      this.patchFormValues();
      this.options['prefix'] = [{ "label": "السيد", "value": "السيد" }, { "label": "تصلب متعدد", "value": "تصلب متعدد" }, { "label": "السيدة", "value": "السيدة" }]
      this.additionalDetails.patchValue({
        prefix: this.options['prefix'][0].value
      });
    });
  }

  addAdditionalDetail(stepper: MatStepper) {
      if (!this.selectedBank || this.selectedBank !== this.additionalDetails.controls['bankName'].value) {
        this.additionalDetails.controls['bankName'].setValue(null);
        this.selectedBank = '';
        return;
    }
    if (this.additionalDetails.invalid) {
      return;
    }
    this.spinner.show();
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
      personalId: this.quoteDetails.userDetails.personalId,
      nationality: this.additionalDetails.value['nationality'],
      fullNameBL: this.additionalDetails.value['fullNameBL'],
      firstNameBL: this.additionalDetails.value['fullNameBL'],
      taxId: this.additionalDetails.value['taxId'],
      city: this.additionalDetails.value['city'],
      country: this.additionalDetails.value['country'],
      occupation: this.additionalDetails.value['occupation'],
      address4: this.additionalDetails.value['address4'],
      driverSameAsInsured: true
    }

    let vehicledetails = {
      colorId: this.additionalDetails.value['colorId'],
      mortgagedYN: this.additionalDetails.value['mortgagedYN'],
      bankName: this.additionalDetails.value['bankName'],
      sgsID: this.quoteDetails.quoteId,
      noOfDoors: this.additionalDetails.value['noOfDoors'],
      registeredAt: this.quoteDetails.vehicleDetails.registeredAt,
      registrationMark: this.additionalDetails.value['registrationMark'],
      regNo: this.additionalDetails.value['regNo'],
      engineNo: this.additionalDetails.value['engineNo']
    }
    if (vehicledetails.mortgagedYN === 'N') {
      delete vehicledetails['bankName'];
    }
    let params = {
      quoteNumber: this.quoteNo
    }
    if (!this.effectiveDateChanged)
    this.changeEffectiveDate('',null)
    this.coreService.postInputs(`brokerservice/vehicledetails/updateVehicleDetails`, [vehicledetails], params).subscribe(response => {
      this.coreService.postInputs(`brokerservice/insuredetails/addinsure`,
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

  emiratesChange(value) {
    let params = {
      productId: "*",
      filterByValue: value,
      optionType: 'MOTOR_CITY'
    }
    this.coreService.getInputs('brokerservice/options/list', params).subscribe((response) => {
      this.options['city'] = response.data;
    });
  }

  getDropDownOptions(key: string, optionId: string, productId = '*') {
    this.coreService.listOptions(optionId, productId).subscribe((response: any) => {
      this.options[key] = response.data;
      if (key === 'bankName') {
        this.filteredBanks = this.additionalDetails['controls']['bankName'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value);
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
    this.coreService.getDownload(url, '').subscribe((response) => {
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
    this.coreService.mergeDocument('brokerservice/documentupload/downloadFile?fileName=' + fileName).subscribe((response: any) => {
      var link = document.createElement("a");
      link.href = URL.createObjectURL(response);
      link.download = value;
      link.click();
    });
  }

  sendMail() {
    const dialogRef = this.dialog.open(EmailPopupComponent, {
      width: '30%',
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
    this.coreService.mergeDocument(`brokerservice/quotes/quotePdfreport?quoteNumber=${this.quoteNo}`).subscribe((response: any) => {
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
    this.additionalDetails.patchValue({
      // vehicle
      colorId: this.quoteDetails.vehicleDetails['colorId'],
      noOfDoors: this.quoteDetails.vehicleDetails['noOfDoors'],
      mortgagedYN: this.quoteDetails.vehicleDetails['mortgagedYN'],
      prevPolicyExpDate: this.quoteDetails.vehicleDetails['prevPolicyExpDate'],
      bankName: this.quoteDetails.vehicleDetails['bankName'],
      registrationMark: this.quoteDetails.vehicleDetails['registrationMark'],
      regNo: this.quoteDetails.vehicleDetails['regNo'],
      engineNo: this.quoteDetails.vehicleDetails['engineNo'],
      //Insured
      // prefix: this.quoteDetails.userDetails['prefixBL'],
      fullNameBL: this.quoteDetails.userDetails['fullNameBL'],
      occupation: this.quoteDetails.userDetails['occupation'],
      nationality: this.quoteDetails.userDetails['nationality'],
      address1: this.quoteDetails.userDetails['address1'],
      address2: this.quoteDetails.userDetails['address2'],
      postBox: this.quoteDetails.userDetails['postBox'],
      address4: this.quoteDetails.userDetails['address4'],
      taxId: this.quoteDetails.userDetails['taxId'],
      city: this.quoteDetails.userDetails['city'],
      // country: this.quoteDetails.userDetails['country']
    });
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
    this.coreService.postInputs('brokerservice/documentupload/getUploadDocName', {}, params).subscribe((response: any) => {
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
      })
      // }
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
    this.coreService.getInputs('brokerservice/documentupload/uploadedDocs', params).subscribe((result: any) => {
      if (result.length > 0) {
        let sortedArray: any[] = result.sort((n1, n2) => n1.docId - n2.docId);
        sortedArray.forEach((element, index) => {
          this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
          this.fileContainer.push(
            {
              id: element.docId,
              controlName: `documentName${index + 1}`,
              value: element.fileName || null
            }
          )
        });

      }
      else {
        this.getDocuments()
      }



    });
  }

  selectFile(event, docId, i) {
    this.spinner.show();
    let selectedFileName = event.srcElement.files[0].name;
    const formData = new FormData();
    formData.append('files', event.target.files[0], selectedFileName);
    formData.append('doctypeid', docId);
    formData.append('docDesc', selectedFileName);
    formData.append('quotenumber', this.quoteDetails['quoteNumber']);
    this.coreService.postInputs('brokerservice/documentupload/uploadMultipleFiles', formData, null).subscribe(response => {
      this.spinner.hide();
      this.fileContainer[i].value = response[0].docDesc;
    }, err => {
      this.spinner.hide();
    })

  }

  // get mandatory docs
  getDocuments() {
    let body = {
      quoteId: this.quoteDetails['quoteId'],
      loadAllDocs: "N"
    }
    this.coreService.postInputs('brokerservice/documentupload/getUploadDocName', {}, body).subscribe((response: any) => {
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
      value = 'Vehicle Registration Card or Vehicle Transfer Certificate or Vehicle Customs Certificate';
    }
    let dialogRef = this.dialog.open(ScanAndUpload, {
      panelClass: 'my-class',
      data: { docId: docId, fileName: value, quoteNo: this.quoteDetails['quoteNumber'] }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
      this.fileContainer[i].value = result[0].docDesc;
      this.DocUploadForm.controls[controlName] = result[0].docDesc;
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
    this.coreService.postInputs('brokerservice/documentupload/uploadMultipleFiles', formData, null).subscribe(response => {
      this.spinner.hide();
      this.fileContainer[i].value = filename;
    }, err => {
      this.spinner.hide();
    })
  }

  bankSelected(event: any) {
    this.selectedBank = event.option.value;
  }
}
