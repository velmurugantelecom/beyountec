import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CoreService } from 'src/app/core/services/core.service';

@Component({
  selector: 'app-content-popup',
  templateUrl: './content-popup.component.html',
  styleUrls: ['./content-popup.component.scss']
})
export class ContentPopupComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<any>,
    private coreService: CoreService) {
  }

  ngOnInit() {
  }
}
