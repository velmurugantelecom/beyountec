import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorContainerComponent } from './motor-container/motor-container.component';
import { VehicleComponent } from './motor-container/vehicle/vehicle.component';
import { SharedModule } from '../shared/shared.module';
import { DriverLicenseDetailsComponent } from './motor-container/driver-license-details/driver-license-details.component';
import { AppMaterialModule } from '../app-material.module';
import { CoreModule } from '../core/core.module';
import { NgxCurrencyModule } from "ngx-currency";

import { TranslateModule } from '@ngx-translate/core';


import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule, MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
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
  declarations: [MotorContainerComponent,
    VehicleComponent,
    DriverLicenseDetailsComponent
  ],
  imports: [
    NgxGaugeModule,
    CommonModule,
    SharedModule,
    AppMaterialModule,
    CoreModule,
    NgxCurrencyModule,
    TranslateModule,

    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OwlMomentDateTimeModule
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS }
  ]
})

export class MotorModule { }
