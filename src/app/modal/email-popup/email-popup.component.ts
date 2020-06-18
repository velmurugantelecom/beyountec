import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CoreService } from 'src/app/core/services/core.service';

@Component({
  selector: 'app-email-popup',
  templateUrl: './email-popup.component.html',
  styleUrls: ['./email-popup.component.scss']
})
export class EmailPopupComponent implements OnInit {

  emailForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<any>,
    private coreService: CoreService) {

  }

  ngOnInit() {
    this.emailForm = this.formBuilder.group({
      email: [{ value: '', disabled: true }],
      radio: ['DFLT', Validators.required]
    });
  }

  sendMail() {
    if (this.emailForm.invalid) {
      return;
    } else {
      let emailId = this.emailForm.value.radio === 'OTHERS' ? this.emailForm.value.email : this.data.mailId;
      let url;
      if (this.data.transactionType == 'P') {
        url = 'brokerservice/document/emailPolicyDocs?policyId=' + this.data.policyId + '&policyNo=' + this.data.docNo + '&toEmailAddr=' + emailId;
      } else {
        url = 'brokerservice/quotes/sendquotes?quoteNumber=' + this.data.docNo + '&toEmailAddr=' + emailId;
      }

      this.coreService.getOptions(url).subscribe((result: any) => {
        if (result.status === 200) {
          this.dialogRef.close();
          alert('Email has been sent successfully');
        }
      });
    }
  }

  selectOption(value) {
    if (value === 'DFLT') {
      this.emailForm.get('email').disable();
      this.emailForm.get('email').clearValidators();
      this.emailForm.patchValue({ 'email': '' });
      this.emailForm.get('email').updateValueAndValidity();
    } else {
      this.emailForm.get('email').enable();
      this.emailForm.get('email').setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]);
      this.emailForm.get('email').updateValueAndValidity();
    }
  }
}
