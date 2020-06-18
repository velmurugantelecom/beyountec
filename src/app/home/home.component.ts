import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../core/services/core.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { EmailPopupComponent } from '../modal/email-popup/email-popup.component';
import { AuthService } from '../core/services/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  selectedcard: boolean = false;
  constructor(private router: Router, private commonService: CoreService, public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private coreService: CoreService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    localStorage.clear();
    this.guestUserCall();
  }

  guestUserCall() {
    localStorage.clear();
    let value = {
      guestUser: true
    }
    this.commonService.postInputs('login/signIn', value, {}).subscribe(response => {
      let data = response.data;
      localStorage.setItem('guesttokenDetails', data.token);
      localStorage.setItem('isLoggedIn', 'false');
      this.authService.isGuestUser.next(true);
    });
  }

  navigate(url: string, params) {
    if (params) {
      this.router.navigate([`/${url}`], { queryParams: { Type: params } });
    }
  }

  selectPlan(value) {
    this.selectedcard = !value;
  }

  openDialog(Type: string, Title: string): void {
    let dialogRef = this.dialog.open(QuoteDialog, {
      width: '350px',
      data: { QType: Type, QTitle: Title }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate([`/additional-details`], { 
          queryParams: { quoteNo: result,
                         retrieveQuote: true } });
      }
    });
  }
}


// dialoguecomponent

@Component({
  selector: 'Quotedialog',
  templateUrl: './Quotedialog.html',
  styles: [`
 
.closeicon_css {
  position: relative;
  
  cursor: pointer;
}


  `],

})
export class QuoteDialog {
  dialogeDetails: any;
  public quoteForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<QuoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data,
    private builder: FormBuilder,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.quoteForm = this.builder.group({
      type: ['', Validators.required]
    });
  }
}