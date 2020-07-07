import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from 'src/app/core/services/core.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from 'src/app/core/services/app.service';
import { Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'chooseProduct',
  templateUrl: './product-selection.component.html',
  styles: [`
   .closeicon_css {
    position: relative;
      cursor: pointer;
  }`],

})
export class chooseProduct {

  dialogeDetails: any;
  public quoteForm: FormGroup;
  dropdownOptions: any;
  public radioError: boolean;
  public invalidChassisNo: boolean;

  constructor(
    public dialogRef: MatDialogRef<chooseProduct>,
    private coreService: CoreService,
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private dataService: DataService,
    private router: Router,
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

    this.coreService.getInputs("brokerservice/vehicledetails/productType", '').subscribe((response: any) => {
      this.dropdownOptions = response.data;
    });
  }

  getPlans() {
    if (this.quoteForm.status === 'INVALID') {
      if (this.quoteForm.controls.type.status === 'INVALID') {
        this.radioError = true;
      }
      return;
    } else {
      this.spinner.show();
      this.coreService.getInputsDbsync('insured/findByUserId', '').subscribe(res => {
        res['productType'] = this.quoteForm.get('type').value
        this.dataService.setUserDetails(res);
        console.log(this.dataService.getUserDetails());
        this.router.navigate(['/new-motor-info']);
        this.dialogRef.close();
      this.spinner.hide();
      }, err => {
        this.dialogRef.close();
      this.spinner.hide();
      });
    }
  }

  selectOption() {
    this.radioError = false;
  }
}