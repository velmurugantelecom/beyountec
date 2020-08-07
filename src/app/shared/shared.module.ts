import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { AppMaterialModule } from '../app-material.module';
import { GeneralInfoTemplateComponent } from './general-info-template/general-info-template.component'
import { CoreModule } from './../core/core.module';
import { SuccessMsgComponent } from './success-msg/success-msg.component';
import { RequestRedirectComponent } from './request-redirect/request-redirect.component';
import { WebCamComponent } from './web-cam/web-cam.component';
import { WebcamModule } from 'ngx-webcam';
import { TranslateModule } from '@ngx-translate/core';
import { PrintPackageComponent } from './print-package/print-package.component';
import { MessageComponent } from './message/message.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule, MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { chooseProduct } from './product-selection/product-selection.component';
import { PaymentFailedComponent } from './payment-failed/payment-failed.component';
import { ScanAndUpload } from './scan-and-upload/scan-and-upload.component';
import { DynamicContentDialog } from './dynamic-content/dynamic-content.component';
import { NgxGaugeModule } from 'ngx-gauge';

export const MY_CUSTOM_FORMATS = {
  fullPickerInput: 'DD/MM/YYYY',
  parseInput: 'DD/MM/YYYY',
  datePickerInput: 'DD/MM/YYYY',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY'
};

@NgModule({
  declarations: [
    HeaderComponent,
    GeneralInfoTemplateComponent,
    SuccessMsgComponent,
    RequestRedirectComponent,
    WebCamComponent,
    PrintPackageComponent,
    MessageComponent,
    chooseProduct,
    PaymentFailedComponent,
    ScanAndUpload,
    DynamicContentDialog],
  imports: [
    TranslateModule,
    CommonModule,
    AppMaterialModule,
    CoreModule,
    WebcamModule,

    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OwlMomentDateTimeModule,
    NgxGaugeModule
  ],
  exports: [
    HeaderComponent,
    GeneralInfoTemplateComponent,
    PrintPackageComponent,
    MessageComponent,
    chooseProduct,
    PaymentFailedComponent,
    DynamicContentDialog
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS },
  ]
})
export class SharedModule { }
