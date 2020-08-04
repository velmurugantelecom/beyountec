import { NgModule } from '@angular/core';

import { AdditionalDetailsComponent } from './additional-details.component';
import { AppMaterialModule } from '../app-material.module';

import { AuthGuard } from '../core/guard/auth.guard';
import { Routes, RouterModule } from '@angular/router';
import { OwlModule } from 'ngx-owl-carousel';


import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';

import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule, MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { NgxMaskModule, IConfig } from 'ngx-mask';
export const options: Partial<IConfig> | (() => Partial<IConfig>)={};

export const MY_CUSTOM_FORMATS = {
    fullPickerInput: 'DD/MM/YYYY',
    parseInput: 'DD/MM/YYYY',
    datePickerInput: 'DD/MM/YYYY',
    timePickerInput: 'LT',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
};

const routes: Routes = [
    {
        path: '', component: AdditionalDetailsComponent, canActivate:
            [AuthGuard]
    },


]

@NgModule({
    declarations: [

        AdditionalDetailsComponent,

    ], imports: [
        TranslateModule,
        SharedModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        CoreModule,
        AppMaterialModule, RouterModule.forChild(routes), OwlModule,


        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        OwlMomentDateTimeModule,
        
        NgxMaskModule.forRoot(),
    ],

    providers: [
        { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
        { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS },
    ]

})
export class AdditionalDetailsModule {
    constructor() {

    }
}

