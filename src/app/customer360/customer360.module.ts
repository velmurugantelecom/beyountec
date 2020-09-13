import { NgModule } from '@angular/core';

import { Customer360Component, Customer360BottomSheet } from './customer360.component';
import { VehicletabComponent } from './customer360tabs/vehicletab/vehicletab.component';
import { InsuredtabComponent } from './customer360tabs/insuredtab/insuredtab.component';
import { DrivertabComponent } from './customer360tabs/drivertab/drivertab.component';
import { Customer360Service } from './customer360.service';
import { CoverageComponent } from './customer360tabs/coverage/coverage.component';
import { ClaimdetailsComponent } from './claims/claimdetails/claimdetails.component';
import { ReqForEndorsmentComponent } from './claims/claimdetails/req-for-endorsment/req-for-endorsment.component';
import { ReqForCancellationComponent } from './claims/claimdetails/req-for-cancellation/req-for-cancellation.component';
import { ReportALOssComponent } from './claims/claimdetails/report-aloss/report-aloss.component';
import { AppMaterialModule } from '../app-material.module';

import { AuthGuard } from '../core/guard/auth.guard';
import { Routes, RouterModule } from '@angular/router';

import { PaymenttabsComponent } from './customer360tabs/paymenttabs/paymenttabs.component';

import { MatFormFieldModule, MatInputModule, MatBottomSheetModule } from '@angular/material';
import { CoreModule } from '../core/core.module'
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

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
    { path: 'ReqForEndorsment', component: ReqForEndorsmentComponent, canActivate: [AuthGuard] },
    { path: 'ReqForCancalletion', component: ReqForCancellationComponent, canActivate: [AuthGuard] },
    { path: 'ReportLoss', component: ReportALOssComponent, canActivate: [AuthGuard] },
    {
        path: '', component: Customer360Component, canActivate:
            [AuthGuard]
    },


]

@NgModule({
    declarations: [

        Customer360Component,
        VehicletabComponent,
        InsuredtabComponent,
        DrivertabComponent,
        CoverageComponent,
        ClaimdetailsComponent,
        ReqForEndorsmentComponent,
        ReqForCancellationComponent,
        ReportALOssComponent,
        PaymenttabsComponent,
        Customer360BottomSheet
    ], imports: [
        TranslateModule,
        SharedModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        CoreModule,
        AppMaterialModule, RouterModule.forChild(routes),


        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        OwlMomentDateTimeModule,
        MatBottomSheetModule
    ],
    entryComponents: [Customer360BottomSheet],
    providers: [Customer360Service,
        { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
        { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS },
    ],


})
export class Customer360Module {
    constructor() {

    }
}

