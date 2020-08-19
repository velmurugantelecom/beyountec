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

  public allowCameraSwitch = true;
  public uploadedDoc = 'front';
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public imageSrc = null;
  public blobImage = [];
  public imageTwo = null;
  public imageOne = null;
  public videoOptions: MediaTrackConstraints = {
  };
  public videoOptions2: MediaTrackConstraints = {
  };

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  public showCapturedImage: boolean;

  constructor(private spinner: NgxSpinnerService,
    private coreService: CoreService,
    public dialogRef: MatDialogRef<ScanAndUpload>,
    @Inject(MAT_DIALOG_DATA) public data) {
    
  }
  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  showCamTwo() {
    this.showCapturedImage = false;
  }
  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    if (this.uploadedDoc === 'front') {
    this.uploadedDoc = 'back';
      this.imageOne = webcamImage
      this.imageSrc = this.imageOne.imageAsDataUrl;
    } else {
      this.imageTwo = webcamImage
      this.imageSrc = this.imageTwo.imageAsDataUrl;
    }
    this.showCapturedImage = true;
    console.log(this.imageOne)
    console.log(this.imageTwo)
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }


  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  public get nextWebcamObservable2(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  reviseImage() {
    this.imageSrc = this.imageOne.imageAsDataUrl;
    this.imageTwo = null;
  }

  close() {
    if (!this.imageTwo) {
      this.uploadedDoc = 'front'
      this.imageOne = null;
      this.showCapturedImage = false;
      this.imageSrc = null;
    } else {
      this.uploadedDoc = 'back'
      this.imageTwo = null;
      this.showCapturedImage = false;
      this.imageSrc = null; 
    }
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }
  
  uploadImage() {
    this.dataURItoBlob(this.imageOne.imageAsDataUrl, 0);
    this.dataURItoBlob(this.imageTwo.imageAsDataUrl, 1);
    setTimeout(() => {
      this.scanUpload(this.blobImage[0], this.blobImage[1], this.data.docId, this.data.fileName, this.data.quoteNo)
    },2000)
  }

  scanUpload(blob1, blob2, docId, filename, q) {
    this.spinner.show();
    const formData = new FormData();
    formData.append('files', blob1, filename);
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
    this.blobImage[side] = new Blob([ia], { type: mimeString });
  }
}