import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';

@Component({
  selector: 'app-product-change-popup',
  templateUrl: './product-change.component.html',
  styleUrls: ['./product-change.component.scss']
})
export class ProductChangePopupComponent implements OnInit {

    public changeProduct: boolean;
    public fullInsuranceVehicleAge:any;
    public language: any;

    constructor(public dialogRef: MatDialogRef<ProductChangePopupComponent>,
      private translate: TranslateService,
      public runtimeConfigService: RuntimeConfigService,
        @Inject(MAT_DIALOG_DATA) public data,
        public router: Router) {
        
    }

    ngOnInit() {
      this.language = localStorage.getItem("language");
      this.translate.get('FullInsuranceVehicleAge') .subscribe(value => { 
        this.fullInsuranceVehicleAge = value.replace("10", this.runtimeConfigService.config.FullInsuranceVehicleAgeGreaterThan); 
      } );
    }
    ngDoCheck() {
      if (this.language != localStorage.getItem("language")) {
        this.language = localStorage.getItem("language");
        this.translate.get('FullInsuranceVehicleAge') .subscribe(value => { 
          this.fullInsuranceVehicleAge = value.replace("10", this.runtimeConfigService.config.FullInsuranceVehicleAgeGreaterThan); 
        } );
    }
  }

    onNoClick(): void {
        this.dialogRef.close(this.changeProduct);
      }

    doChangeProduct(value) {
        this.changeProduct = value;
        this.dialogRef.close(this.changeProduct);
    }
}