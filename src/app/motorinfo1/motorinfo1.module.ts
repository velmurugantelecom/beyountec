import { NgModule } from '@angular/core';

import { NewMotorInfoScreen, VehicleBottomSheet } from './motorinfo1.component';
import { AppMaterialModule } from '../app-material.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthGuard } from '../core/guard/auth.guard';
import { Routes, RouterModule } from '@angular/router';
import { OrderByPipe } from '../shared/custom-pipe/order-by.pipe';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { NgxGaugeModule } from 'ngx-gauge';

import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule, MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
export const MY_CUSTOM_FORMATS = {
    fullPickerInput: 'DD/MM/YYYY',
    parseInput: 'DD/MM/YYYY',
    datePickerInput: localStorage.getItem("DatePickerFormat"),
    timePickerInput: 'LT',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
};

const routes: Routes = [
    {
        path: '', component: NewMotorInfoScreen, canActivate:
            [AuthGuard]
    },


]

@NgModule({
    declarations: [
        NewMotorInfoScreen,
        OrderByPipe,
        VehicleBottomSheet
    ], imports: [
        TranslateModule,
        SharedModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        CoreModule,
        NgSelectModule,
        NgxGaugeModule,
        AppMaterialModule, RouterModule.forChild(routes),


        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        OwlMomentDateTimeModule,
        MatBottomSheetModule
    ],

    providers: [
        { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
        { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS },
    ]

})
export class NewMotorInfoScreenModule {
    constructor() {

    }
}

