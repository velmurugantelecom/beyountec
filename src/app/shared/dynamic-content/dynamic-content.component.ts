import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dynamic-content',
  templateUrl: './dynamic-content.component.html',
  styles: [`
   .closeicon_css {
    position: relative;
      cursor: pointer;
  }`],

})
export class DynamicContentDialog {

  constructor(
    public dialogRef: MatDialogRef<DynamicContentDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }
}