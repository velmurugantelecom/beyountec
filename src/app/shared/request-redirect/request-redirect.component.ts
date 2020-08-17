import { Component, OnInit, Inject } from '@angular/core';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { CoreService } from 'src/app/core/services/core.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-request-redirect',
  templateUrl: './request-redirect.component.html',
  styleUrls: ['./request-redirect.component.scss']
})
export class RequestRedirectComponent implements OnInit {
  // toggle webcam on/off
  public showWebcam1 = true;
  public showWebcam2 = true;
  public allowCameraSwitch = true;
  public allowCameraSwitch2 = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public blobImage = [];
  public videoOptions: MediaTrackConstraints = {
  };
  public videoOptions2: MediaTrackConstraints = {
  };
  public errors: WebcamInitError[] = [];

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  private trigger2: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  public showCapturedImage1: boolean;
  public showCapturedImage2: boolean;
  public photoOne;
  public photoTwo;

  constructor(private spinner: NgxSpinnerService,
    private coreService: CoreService,
    public dialogRef: MatDialogRef<RequestRedirectComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    
  }
  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(): void {
    this.showCapturedImage1 = true;
    this.trigger.next();
  }

  public triggerSnapshot2(): void {
    this.showCapturedImage2 = true;
    this.trigger2.next();
  }

  public toggleWebcam1(): void {
    this.showWebcam1 = !this.showWebcam1;
  }

  public toggleWebcam2(): void {
    this.showWebcam2 = !this.showWebcam2;
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage, type): void {
    if (type === 'front')
    this.photoOne = webcamImage;
    else
    this.photoTwo = webcamImage;
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public cameraWasSwitched2(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }


  public get triggerObservable2(): Observable<void> {
    return this.trigger2.asObservable();
  }


  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  public get nextWebcamObservable2(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  uploadImage() {
    this.dataURItoBlob(this.photoOne.imageAsDataUrl, 0);
    this.dataURItoBlob(this.photoTwo.imageAsDataUrl, 1);
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