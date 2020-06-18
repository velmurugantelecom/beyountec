import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from 'src/app/core/services/core.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from 'src/app/core/services/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scan-and-upload',
  templateUrl: './scan-and-upload.component.html',
  styleUrls: ['./scan-and-upload.component.scss']
})
export class ScanAndUpload {

    ngOnInit() {
    }
}