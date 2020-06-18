import { Component, OnInit, Inject } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { WebcamImage } from 'ngx-webcam';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-web-cam',
  templateUrl: './web-cam.component.html',
  styleUrls: ['./web-cam.component.scss']
})
export class WebCamComponent implements OnInit {

  private trigger: Subject<void> = new Subject<void>();
  public allowCameraSwitch = true;
  // latest snapshot
  public webcamImage: WebcamImage = null;
  constructor(
    public dialogRef: MatDialogRef<WebCamComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
  }
  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public handleImage(webcamImage: WebcamImage): void {
    console.info("received webcam image", webcamImage);
    this.webcamImage = webcamImage;
    this.doAction()
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
  doAction() {
    this.dialogRef.close({ event: 'WebcamData', data: this.webcamImage });
  }
  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
