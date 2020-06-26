import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { EmailPopupComponent } from 'src/app/modal/email-popup/email-popup.component';

import { MatDialog } from '@angular/material';
import { CoreService } from '../../core/services/core.service'
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownService } from 'src/app/core/services/dropdown.service';

@Component({
  selector: 'app-print-package',
  templateUrl: './print-package.component.html',
  styleUrls: ['./print-package.component.scss']
})
export class PrintPackageComponent implements OnInit, AfterViewInit {

  disabledButton: Boolean = true;
  formgroup: any = {};
  /* policyDetails: Observable<any>; */
  productName: any;
  policy: any;
  policyNo: any;
  policyId: any;
  // quoteNo: any;
  // insuredName: any;
  // startDate: any;
  // endDate: any;
  // approvalDate: any;
  docs: any;
  brokerName: any;
  mailId: any;
  //downloadUrl: String = 'brokerservice/document/downloadPDF/?fileName=';
  downloadUrl: String = environment.DevEndpoint + 'brokerservice/document/downloadPDF/?fileName=';
  selectedDocs: any = [];
  isSuccess: Boolean = false;
  docSpinner: string = 'docSpinner';
  @Input('policyNo') policyvalue: string;

  constructor(public dialog: MatDialog,
    private service1: CoreService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private spinner: NgxSpinnerService,
    private dropdownservice: DropDownService,
    private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.formgroup = this.formBuilder.group({
      cb_1: [''],
      cb_2: [''],
      cb_3: ['']
    });
  }


  ngAfterViewInit() {
    if (this.policyvalue != undefined) {
      this.policyNo = this.policyvalue;
      this.getDocs();
      this.getPolicyDetails(this.policyNo);
    } else {
      this.getPolicy();
    }

  }

  getPolicy() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.policyNo = params['policyNo'];
      this.getDocs();
      this.getPolicyDetails(this.policyNo);
      this.isSuccess = params['isSuccess'];
    });
  }

  getPolicyDetails(policyNo) {
    let value = {
      policyNo: this.policyNo
    }
    this.service1.getInputs('brokerservice/policy/policySummary', value).subscribe((result: any) => {
      this.policy = result.data;
      this.policyId = result.data.policyId;
      this.mailId = result.data.userDetails.email;
    }, err => {
    });
  }

  getDocs() {
    this.spinner.show('sp1');
    let value = {
      documentNo: this.policyNo,
      versionNo: "0"
    }
    this.dropdownservice.getInputs('brokerservice/document/generated', value).subscribe((result: any) => {
      this.docs = result.data;
      this.docs.forEach(n => {
        n.thumbnail = (n.thumbnail) ? this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64, ' + n.thumbnail) : './assets/img/file-icon.png';
      });
      setTimeout(() => {
        this.spinner.hide('sp1');
      }, 500);
    }, err => {
      setTimeout(() => {
        this.spinner.hide('sp1');
      }, 500);
    });
  }

  downloadDoc(doc) {
    this.service1.getDownload('brokerservice/document/downloadPDF/?fileName=' + doc.fileName, '').subscribe(n => {
    }, err => {
    });
  }


  emailDocument() {
    const dialogRef = this.dialog.open(EmailPopupComponent, {
      width: '30%',
      // height: '46%',
      data: {
        head: 'printpopup',
        name: 'this.name',
        mailId: this.mailId,
        docNo: this.policyNo,
        selectedDocs: this.selectedDocs,
        transactionType: 'P'
      },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }





  changeCheck(event, fileName) {
    let formValue = this.formgroup.value;
    if (event.checked == true) {
      this.selectedDocs.push(fileName);
    } else {
      var index = this.selectedDocs.indexOf(fileName);
      if (index > -1) {
        this.selectedDocs.splice(index, 1);
      }
    }
    this.disabledButton = !(this.selectedDocs.length > 0);
  }

  openDocument(doc) {
    this.service1.mergeDocument('brokerservice/document/downloadPDF/?fileName=' + doc.fileName).subscribe((response: any) => {
      var blob = new Blob([response], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.style.display = 'none';
      link.target = "_blank";
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.download = doc.fileName;
      window.open(URL.createObjectURL(blob), doc.fileName);
    }, err => {
    });
  }

  printDocument() {
    this.service1.mergeDocument('brokerservice/document/mergeDocuments?policyId=' + this.policyId + '&fileNames=' + this.selectedDocs).subscribe((response: any) => {
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
}
