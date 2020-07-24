import { NgModule } from '@angular/core';

import { NewLoginScreen,QuoteDialog } from './login1.component';
import { AppMaterialModule } from '../app-material.module';

import { AuthGuard } from '../core/guard/auth.guard';
import { Routes, RouterModule } from '@angular/router';
import { OwlModule } from 'ngx-owl-carousel';


import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { NgxCaptchaModule } from 'ngx-captcha';

import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule, MomentDateTimeAdapter } from 'ng-pick-datetime-moment';

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
        path: '', component: NewLoginScreen, canActivate:
            [AuthGuard]
    },


]

@NgModule({
    declarations: [
        NewLoginScreen,
        QuoteDialog
    ], imports: [
        TranslateModule,
        SharedModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        CoreModule,
        NgxCaptchaModule,
        AppMaterialModule, RouterModule.forChild(routes), OwlModule,


        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        OwlMomentDateTimeModule
    ],
    entryComponents: [QuoteDialog],

    providers: [
        { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
        { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS },
    ]

})
export class NewLoginScreenModule {
    constructor() {

    }
}

