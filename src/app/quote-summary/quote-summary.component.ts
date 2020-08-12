import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from '../core/services/core.service';
import { AppService } from '../core/services/app.service';
import { NgxSpinnerService } from "ngx-spinner";
import * as $ from 'jquery';
import swal from 'sweetalert';
import { OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { TranslateService } from '@ngx-translate/core';
import { DropDownService } from '../core/services/dropdown.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicContentDialog } from '../shared/dynamic-content/dynamic-content.component';
export const MY_NATIVE_FORMATS = {
  fullPickerInput: 'DD/MM/YYYY hh:mm a',
};

@Component({
  selector: "app-quote-summary",
  templateUrl: "./quote-summary.component.html",
  styleUrls: ["./quote-summary.component.scss"],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
  ]
})
export class QuoteSummaryComponent implements OnInit {

  public plandetail: any = {};
  public quoteNo: any;
  public quoteNumber: any;
  public selectedPlan: any;
  public quoteDetails: any;
  public isAgreed: boolean;
  public isQuickSummary = 'true';
  public attachments: any;
  public pageHeader: any;
  public summaryFor: any;
  public grossPremium;
  public selectedCovers = [];
  public mailId: string;
  public ncdDeclaration: boolean
  public isValidQuote = 'true';
  public language: any;

  constructor(private router: Router, private coreService: CoreService,
    private route: ActivatedRoute,
    private appService: AppService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private dropdownservice: DropDownService,
    public dialog: MatDialog) {

    this.route.queryParams
      .subscribe(params => {
        this.quoteNo = params['quoteNo'];
        this.isQuickSummary = params['isQuickSummary'];
        this.isValidQuote = params['validQuote'];
        if (this.isValidQuote != 'false') {
          this.isValidQuote = 'true';
        }
      });
    this.translate.get('QuoteSummary').subscribe(value => {
      this.pageHeader = value;
    });
  }

  ngOnInit() {
    let url = "brokerservice/quotes/quoteDetailsSummary";
    let params = {
      quoteNumber: this.quoteNo
    }
    this.dropdownservice.getInputs(url, params).subscribe((response) => {
      this.quoteDetails = response.data.quoteSummary;
      if (this.quoteDetails.vehicleDetails.ncdYears > 0) {
        this.ncdDeclaration = true;
      }
      this.mailId = this.quoteDetails.userDetails.email;
      this.coverageMakeover();
      let netPremium = response.data.quoteSummary.risks[0].netPremium
      let vat = response.data.quoteSummary.risks[0].vat
      this.grossPremium = netPremium - vat;
      let params1 = {
        quotenumber: this.quoteDetails['quoteId']
      }
      this.coreService.getInputs(`brokerservice/documentupload/uploadedDocs`, params1).subscribe(response => {
        response.forEach(file => {
          let nameArray = file.fileName.split('_0_');
          file.fileName = nameArray[1];
          if (file.fileName.toLowerCase().includes('pdf')) {
            file['src'] = './assets/sharedimg/pdf.png'
          } else if (file.fileName.toLowerCase().includes('jpg') || file.fileName.toLowerCase().includes('png') || file.fileName.toLowerCase().includes('jpeg')) {
            file['src'] = './assets/sharedimg/image-icon.png';
          } else {
            file['src'] = './assets/sharedimg/image-icon.png';
          }
        });
        this.attachments = response;
      });
    });
    if (this.isQuickSummary == 'false') {
      this.translate.get('SummaryForThe').subscribe(value => {
        this.summaryFor = value;
      });
      this.pageHeader = this.summaryFor + ' ' + this.quoteNo;
    }
    this.language = localStorage.getItem("language");
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
      this.translate.get('QuoteSummary').subscribe(value => {
        this.pageHeader = value;
      });
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
      reviseDetails: true,
      goTo: 3
    }
    if (this.isQuickSummary === 'true') {
      this.router.navigate(['/compare-plans']);
    } else {
      this.router.navigate(['/additional-details'], {
        queryParams: value
      });
    }
  }

  openAttachment(value) {
    console.log('called')
    let fName = `${this.quoteDetails.quoteId}_0_${value}`;
    this.coreService.mergeDocument('brokerservice/documentupload/downloadFile?fileName=' + fName).subscribe((response: any) => {
      // console.log('kaboom', response)
      // if (window.navigator && window.navigator.msSaveBlob) {
      //   console.log('boom')
      //   var newBlob = new Blob([response], {type: "application/pdf"})
      //   window.navigator.msSaveBlob(newBlob);
      //   return;
      // } 
      var link = document.createElement("a");
      link.href = URL.createObjectURL(response);
      link.download = value;
      link.click();
    });
  }
  sendMail() {
    let docNo = this.quoteNumber;
    let url = 'brokerservice/quotes/sendquotes?quoteNumber=' + docNo + '&toEmailAddr=' + this.mailId;
    this.coreService.getOptions(url).subscribe((result: any) => {
      if (result.status === 200) {
      }
    })
  }

  readTermsAndCond(value) {
    let file
    let windowName;
    switch (value) {
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
    this.spinner.show();
    this.coreService.getDownload('brokerservice/document/downloadPDF', param).subscribe(response => {
      let fileUrl = window.URL.createObjectURL(response);
      var newWindow = window.open(fileUrl, '_blank');
         setTimeout(function () {
           newWindow.document.title = windowName;
         }, 1000);
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
    })
  }

  readNCDDeclaration() {
    const dialogRef = this.dialog.open(DynamicContentDialog, {
      width: '60%'
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
