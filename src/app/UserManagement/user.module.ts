import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AppMaterialModule } from '../app-material.module';
import { Routes, RouterModule } from '@angular/router';

import { DashNotificationComponent } from './dashboard/dash-notification/dash-notification.component';
import { PolicyComponent } from './policy/policy.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManageprofileComponent } from './manageprofile/manageprofile.component';
import { AuthGuard } from "../core/guard/auth.guard";
import { ChangePasswordComponent } from './change-password/change-password.component'
import { QuoteComponent } from './quote/quote.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],

    },
    {
        path: "policy",
        component: PolicyComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'Quote',
        component: QuoteComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'profile',
        component: ManageprofileComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'changepassword',
        component: ChangePasswordComponent,
        canActivate: [AuthGuard],
    },

]

@NgModule({
    declarations: [PolicyComponent, DashboardComponent, ManageprofileComponent, DashNotificationComponent, ChangePasswordComponent,
        QuoteComponent],
    imports: [
        CommonModule,
        SharedModule,
        AppMaterialModule,
        RouterModule.forChild(routes),
        TranslateModule
    ]
})
export class userModule { }
