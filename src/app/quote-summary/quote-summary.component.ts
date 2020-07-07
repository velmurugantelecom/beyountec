import { Component, OnInit, Input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from '../core/services/core.service';
import { AppService } from '../core/services/app.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import * as $ from 'jquery';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { DropDownService } from '../core/services/dropdown.service';

export const MY_NATIVE_FORMATS = {
  fullPickerInput: 'DD/MM/YYYY hh:mm a',
};

@Component({
  selector: "app-quote-summary",
  templateUrl: "./quote-summary.component.html",
  styleUrls: ["./quote-summary.component.scss"],
  providers:[
    {provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS},
  ]
})
export class QuoteSummaryComponent implements OnInit {

  plandetail: any = {};
  quoteNo: any;
  quoteNumber: any;
  selectedPlan: any;
  quoteDetails: any;
  isAgreed: boolean;
  isQuickSummary = 'true';
 // pageHeader = 'Quote Summary';
  attachments: any;
  pageHeader:any;
  summaryFor:any;
  grossPremium;
  public selectedCovers = [];
  public mailId: string;
  public EffectiveDateForm: FormGroup;
  public maxEffectiveDate;
  public isValidQuote = 'true';

  constructor(private router: Router, private coreService: CoreService,
    private route: ActivatedRoute,
    private appService: AppService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private dropdownservice: DropDownService) {

    this.route.queryParams
      .subscribe(params => {
        this.quoteNo = params['quoteNo'];
        this.isQuickSummary = params['isQuickSummary'];
        this.isValidQuote = params['validQuote'];
        if (this.isValidQuote != 'false') {
          this.isValidQuote = 'true';
        }
      });
      this.translate.get('QuoteSummary') .subscribe(value => { 
        this.pageHeader = value; 
      } );
  }
  
  ngOnInit() {
    this.EffectiveDateForm = this.formBuilder.group({
      startDate: ['', []]
    });

    let url = "brokerservice/quotes/quoteDetailsSummary";
    let params = {
      quoteNumber: this.quoteNo
    }
    this.dropdownservice.getInputs(url, params).subscribe((response) => {
      this.quoteDetails = response.data.quoteSummary;
      this.mailId = this.quoteDetails.userDetails.email;
      if (this.isQuickSummary === 'false') {
        this.EffectiveDateForm.get('startDate').setValidators([Validators.required]);
        this.EffectiveDateForm.get('startDate').updateValueAndValidity();
        this.EffectiveDateForm.patchValue({
          startDate: response.data.quoteSummary.startDate
        });
        let date = moment(this.quoteDetails.startDate).add('days', 15)['_d'];
        this.maxEffectiveDate = date.toISOString();
      }
      this.coverageMakeover();
      let netPremium = response.data.quoteSummary.risks[0].netPremium
      let vat = response.data.quoteSummary.risks[0].vat
      this.grossPremium = netPremium - vat;
      let params1 = {
        quotenumber: this.quoteDetails['quoteId']
      }
      this.coreService.getInputs(`brokerservice/documentupload/uploadedDocs`, params1).subscribe(response => {
        response.forEach(file => {
          if (file.fileName.toLowerCase().includes('pdf')) {
            file['src'] = './assets/sharedimg/pdf.png'
          } else if (file.fileName.toLowerCase().includes('jpg') || file.fileName.toLowerCase().includes('png') || file.fileName.toLowerCase().includes('jpeg')){
            file['src'] = './assets/sharedimg/image-icon.png';
          } else {
            file['src'] = './assets/sharedimg/image-icon.png';
          }
        });
        this.attachments = response;
      });
    });
    if (this.isQuickSummary == 'false') {
      this.translate.get('SummaryForThe') .subscribe(value => { 
        this.summaryFor = value; 
      } );
      this.pageHeader = this.summaryFor+' ' + this.quoteNo;
    }
  }
  
  coverageMakeover() {
    this.quoteDetails.risks[0].coverages.forEach(coverage => {
      if (coverage['coverageDesc'] != 'Compulsory Agency repair for 1st Year'
      && coverage['coverageDesc'] != 'Total Loss for Chassis Repair'
      && coverage['coverageDesc'] != 'TPPD Limit 2Million'
      && coverage['coverageDesc'] != 'RAC for TP Vehicle'
      && coverage['coverageDesc'] != 'Rent a Car for TP Vehicle') {
        this.selectedCovers.push(coverage['coverageDesc'])
      }
    })
  }

  isAgreedStatus(event) {
    this.isAgreed = event.checked;
  }

  generateQuote() {
      
    this.coreService.postInputs1('generateQuote', this.quoteDetails.quoteId).subscribe(res => {
      console.log(res)
      this.quoteNumber = res;
      this.appService.setQuoteDetails(this.quoteDetails);
      this.sendMail();
      this.router.navigate(['/additional-details'], { queryParams: { quoteNo: this.quoteNumber } });
    }, err => {
    })
  }

  generatePolicy() {
    this.router.navigate([`/payment-succeed`], { queryParams: { quoteNo: this.quoteNo } })
  }

  changeEffectiveDate() {
      let params = {
        quoteId: this.quoteDetails.quoteId,
        amndVerNo: 0,
        startDate: new Date(this.EffectiveDateForm.value['startDate']).toISOString(),
        productId: this.quoteDetails.productTypeId
      }
      this.coreService.postInputs2('changeStartDate','', params).subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }

  makePayment() {
    this.spinner.show();
    this.coreService.paymentService(this.quoteNo).subscribe(response => {
      this.spinner.hide();
      if (response) {
        let form = document.createElement("form");
        form.setAttribute('method', "post");
        form.setAttribute('action', response['paymentUrl']);

        let input = document.createElement("input");
        input.type = "text";
        input.name = `TransactionID`;
        input.id = `TransactionID`;
        input.value = `${response['TransactionID']}`;

        form.appendChild(input);

        let btn = document.createElement("button");
        btn.id = `submitBtn`;
        btn.value = `submit`;
        btn.type = `submit`;
        form.appendChild(btn);

        $("body").append(form);
        $("#submitBtn").trigger("click");
      }
    }, err => {
      this.spinner.hide();
    });
  }

  goBack() {
    let value = {
      quoteNo: this.quoteNo,
      reviseDetails: true
    }
    if (this.isQuickSummary === 'true') {
      this.router.navigate(['/new-motor-info'],
      {
        queryParams: value
      });
    } else {
      this.router.navigate(['/additional-details'], {
        queryParams: value
      });
    }
  }

  openAttachment(fileName) {
    this.coreService.mergeDocument('brokerservice/documentupload/downloadFile?fileName=' + fileName).subscribe((response: any) => {
      var link = document.createElement("a");
      link.href = URL.createObjectURL(response);
      link.download = fileName;
      link.click();
    });
  }
  sendMail() {
    let docNo = this.quoteNumber;
    let url = 'brokerservice/quotes/sendquotes?quoteNumber=' + docNo + '&toEmailAddr=' + this.mailId;
    this.coreService.getOptions(url).subscribe((result: any) => {
      if (result.status === 200) {
        console.log('email sent')
      }
    })
  }

  readTermsAndCond(value) {
    console.log(value);
    let file, windowName;
    switch(value) {
      case 1: {
        file = 'Terms&Conditions.pdf';
        windowName = 'Terms & Conditions';
        break;
      }
      case 2: {
        file = 'Privacy Policy.pdf';
        windowName = 'Privacy Policy';
        break;
      }
      case 3: {
        file = 'REFUND POLICY FOR POLICY ONLINE PAYMENT.pdf';
        windowName = 'REFUND POLICY FOR POLICY ONLINE PAYMENT';
        break;
      }
    }
    let param = {
      fileName: file
    }
    console.log(file)
    this.coreService.getDownload('brokerservice/document/downloadPDF', param).subscribe(response => {
      console.log(response)
      let fileUrl = window.URL.createObjectURL(response);
      window.open(fileUrl,'_blank');
    })
  }
}
