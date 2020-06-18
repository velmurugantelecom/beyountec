import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-change-popup',
  templateUrl: './product-change.component.html',
  styleUrls: ['./product-change.component.scss']
})
export class ProductChangePopupComponent implements OnInit {

    public changeProduct: boolean;

    constructor(public dialogRef: MatDialogRef<ProductChangePopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public router: Router) {
        
    }

    ngOnInit() {

    }

    onNoClick(): void {
        this.dialogRef.close(this.changeProduct);
      }

    doChangeProduct(value) {
        this.changeProduct = value;
        this.dialogRef.close(this.changeProduct);
    }
}