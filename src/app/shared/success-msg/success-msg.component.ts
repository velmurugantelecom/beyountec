import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/app/core/services/core.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { EmailPopupComponent } from 'src/app/modal/email-popup/email-popup.component';
import { AppService } from 'src/app/core/services/app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert'
import { DropDownService } from 'src/app/core/services/dropdown.service';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-success-msg',
  templateUrl: './success-msg.component.html',
  styleUrls: ['./success-msg.component.scss']
})
export class SuccessMsgComponent implements OnInit {

  public quoteNo: string;
  public policyNo: string;
  public mailId: string;
  public quoteDetails: any;
  public currency;
  public amount;
  public language: any;
  public accountActivationTokenStatus: boolean=true;
  poclicyCreated: any;
  policyId: any
  activateAccount = null;
  constructor(private coreService: CoreService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private appService: AppService,
    private spinner: NgxSpinnerService,
    private dropdownservice: DropDownService,
    private translate: TranslateService,
    private router: Router,
    private dataService: DataService) {

    this.route.queryParams
      .subscribe(params => {
        this.quoteNo = params['quoteNo'];
      });
  }

  ngOnInit() {
    this.getQuoteDetails();
    this.createPolicy();
    this.language = localStorage.getItem("language");
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }

  getQuoteDetails() {
    let url = "brokerservice/quotes/quoteDetailsSummary";
    let params = {
      quoteNumber: this.quoteNo
    }
    this.dropdownservice.getInputs(url, params).subscribe((response) => {
      if (response != null)
        this.quoteDetails = response.data.quoteSummary;
      this.currency = this.quoteDetails.premiumCurrencyId;
      this.amount = this.quoteDetails.risks[0].netPremium;
      this.mailId = this.quoteDetails.userDetails.email;
    });
  }

  createPolicy() {
    this.spinner.show();
    let SuccessPageLoader='SuccessPageLoaderContent';
    this.dataService.setMotorPageLoaderContent(SuccessPageLoader);
    let params = {
      quoteNumber: this.quoteNo,
      payMode: "PG",
      sendDocs: true
    }
    this.translate.get('PolicyCreated').subscribe(value => {
      this.poclicyCreated = value;
    });

    this.coreService.postInputs('brokerservice/policy', {}, params).subscribe(response => {
      let SuccessPageLoader='';
      this.dataService.setMotorPageLoaderContent(SuccessPageLoader);
      this.spinner.hide();
      if (response) {
        if (response['accountActivationToken']) {
          this.activateAccount = response['accountActivationToken'];
          this.accountActivationTokenStatus=false;
        }
        if (this.mailId)
          this.policyNo = response.policyNo;
        this.policyId = response.policyId;
        swal(
          '', this.poclicyCreated, 'success'
        );
      }
    }, err => {
      let SuccessPageLoader='';
      this.dataService.setMotorPageLoaderContent(SuccessPageLoader);
      this.spinner.hide();
    });
  }

  downloadDocuments() {
    let url = 'brokerservice/document/policyDocs?policyId=' + this.policyId;
    this.coreService.getDownload(url, '').subscribe((response) => {
      if (response) {
        if (window.navigator && window.navigator.msSaveBlob) {
          var newBlob = new Blob([response], {type: response.type})
          window.navigator.msSaveBlob(newBlob);
          return;
        } 
        var link = document.createElement("a");
        link.href = URL.createObjectURL(response);
        link.download = `Motor Insurance`;
        link.click();
      }

    })
  }

  autoSendMail() {
    let url = 'brokerservice/document/sendPolicyDoc?policyNo=' + this.policyNo + '&docs=' + `MOT_TPL_SCH_${this.policyId}_0.pdf,ORANGE_CARD_${this.policyId}_0.pdf,RECEIPT_${this.policyId}_0.pdf,CLAUSE_01_${this.policyId}_0.pdf,
    CLAUSE_02_${this.policyId}_0.pdf,CLAUSE_03_${this.policyId}_0.pdf,CLAUSE_04_${this.policyId}_0.pdf,CLAUSE_07_${this.policyId}_0.pdf,CLAUSE_008_${this.policyId}_0.pdf` + '&toEmailAddr=' + this.mailId;
    this.coreService.getOptions(url).subscribe((result: any) => {
      if (result.status === 200) {
      }
    });
  }

  sendMail() {
    const dialogRef = this.dialog.open(EmailPopupComponent, {
      width: '400px',
      data: {
        head: 'printpopup',
        name: 'this.name',
        mailId: this.mailId,
        docNo: this.policyNo,
        policyId: this.policyId,
        transactionType: 'policysuccess'

      },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  printDocument() {
    let url = 'brokerservice/document/policyDocs?policyId=' + this.policyId;
    this.coreService.mergeDocument(url).subscribe((response: any) => {
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

  activateProfile() {
    this.router.navigate([`/resetPassword/${this.activateAccount}`])
  }
}
