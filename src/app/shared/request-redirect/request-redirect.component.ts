import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from 'src/app/core/services/core.service';
import { NgxSpinner } from 'ngx-spinner/lib/ngx-spinner.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { WebCamComponent } from '../web-cam/web-cam.component';
import { MatDialog } from '@angular/material';
import { ScanAndUpload } from '../scan-and-upload/scan-and-upload.component';

@Component({
  selector: 'app-request-redirect',
  templateUrl: './request-redirect.component.html',
  styleUrls: ['./request-redirect.component.scss']
})
export class RequestRedirectComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private coreService: CoreService
  ) {
  }

  ngOnInit() {
    // this.openDialog(1,2,'temp')
  }

  openWebCam(docId, i, value, q) {
    if (i === 0) {
      value = 'Vehicle Registration Card or Vehicle Transfer Certificate or Vehicle Customs Certificate';
    }
    let dialogRef = this.dialog.open(ScanAndUpload, {
      panelClass: 'my-class',
      // data: { docId: docId, index: i, fileName: value, quoteNo: this.quoteDetails['quoteNumber'] }
      data: { docId: docId, fileName: value, quoteNo: q }

    });  
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
    })
  }

  scanUpload(blob, docId, i, filename) {
    this.spinner.show();
    const formData = new FormData();
    formData.append('files', blob, filename);
    formData.append('doctypeid', docId);
    formData.append('docDesc', `${filename}`);
    formData.append('quotenumber', 'Q/1113/3/20/0000076');
    this.coreService.postInputs('brokerservice/documentupload/uploadMultipleFiles', formData, null).subscribe(response => {
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
    })
  }
  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }
}