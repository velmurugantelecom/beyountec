import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from 'src/app/core/services/core.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from 'src/app/core/services/app.service';
import { Router } from '@angular/router';

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
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data,
    private builder: FormBuilder,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.quoteForm = this.builder.group({
      type: ['', Validators.required],
      chassisNo: ['', Validators.required]
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
      let autoDataURL;
      if (this.quoteForm.value.type === '1113') {
        autoDataURL = 'ae/findByChassisNoWithPrice';
      } else {
        autoDataURL = 'ae/findByChassisNo'
      }
      let params = {
        chassisNo: this.quoteForm.value.chassisNo
      };
      let type = {
        productType: this.quoteForm.value.type
      }
      this.coreService.getInputsAutoData(autoDataURL, params).subscribe(res => {
        this.dialogRef.close();
        this.appService.setVehicleAutoData(res);
        this.appService.setuserDetails(type);
        this.spinner.hide();
        this.router.navigate(['/motor-info']);
      }, err => {
        this.invalidChassisNo = true;
        this.quoteForm.controls['chassisNo'].setErrors({ 'incorrect': true });
        this.spinner.hide();
      });
    }
  }

  selectOption() {
    this.radioError = false;
  }
}