import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamUtil } from 'ngx-webcam';
import { NgxSpinnerService } from 'ngx-spinner';
import { CoreService } from 'src/app/core/services/core.service';
import swal from 'sweetalert'

@Component({
  selector: 'app-scan-and-upload',
  templateUrl: './scan-and-upload.component.html',
  styleUrls: ['./scan-and-upload.component.scss']
})
export class ScanAndUpload {

  public title = 'Scan the Document';
  private trigger: Subject<void> = new Subject<void>();
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();
  public frontSide: WebcamImage = null;
  public backSide: WebcamImage = null;
  public previewImage = null;
  public showCamera2 = false;
  public go = false;
  public go2 = false;
  public showCapturedImage = false;
  public showCapturedImage2 = false;
  public blob = {};
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;

  constructor(public dialogRef: MatDialogRef<ScanAndUpload>,
    private spinner: NgxSpinnerService,
    private coreService: CoreService,
    @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit() {
    WebcamUtil.getAvailableVideoInputs()
    .then((mediaDevices: MediaDeviceInfo[]) => {
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
    });
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public uploadBackSide() {
    this.showCamera2 = true;
  }

  public triggerSnapshot(value): void {
    if (value) {
      this.showCapturedImage = true;
      this.trigger.next();
    } else {
      this.showCapturedImage = false;
      this.frontSide = null;
    }
  }

  public triggerSnapshot2(value) {
    if (value) {
      this.showCapturedImage2 = true;
      this.go2 = true;
      this.showCamera2 = false;
      this.trigger.next();
    } else {
      this.showCamera2 = false;
      this.showCapturedImage2 = false;
      this.go2 = false;
      this.backSide = null;
    }
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public handleFrontSideImage(webcamImage: WebcamImage): void {
    this.frontSide = webcamImage;
  }

  public handleBackSideImage(webcamImage: WebcamImage): void {
    this.backSide = webcamImage;
  }

  switchCamera() {
    this.showCamera2 = true;
    this.showCapturedImage2 = true;
  }

  public closefunc() {
    this.previewImage = null;
  }

  public uploadDocs() {
    this.dataURItoBlob(this.frontSide.imageAsDataUrl, 'front');
    if (this.backSide)
      this.dataURItoBlob(this.backSide.imageAsDataUrl, 'back');
    setTimeout(() => {
      this.scanUpload(this.blob['front'], this.blob['back'], this.data.docId, this.data.fileName, this.data.quoteNo)
    }, 1000);
  }

  dataURItoBlob(dataURI, side) {
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
    this.blob[side] = new Blob([ia], { type: mimeString });
  }
  
  scanUpload(blob1, blob2, docId, filename, q) {
    this.spinner.show();
    const formData = new FormData();
    formData.append('files', blob1, filename);
    if (blob2 != null)
      formData.append('files', blob2, 'back');
    formData.append('doctypeid', docId);
    formData.append('docDesc', `${filename}`);
    formData.append('quotenumber', q);
    this.coreService.postInputs('brokerservice/documentupload/uploadMultipleFiles', formData, null).subscribe(response => {
      this.spinner.hide();
      this.dialogRef.close(response);

    }, err => {
      this.spinner.hide();
    })
  }
  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  handleInitError(event) {
    console.log(event)
    swal(
      '', 'Camera not working', 'error'
    );
  }
}