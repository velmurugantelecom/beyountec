import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppMaterialModule } from './app-material.module';
import { SharedModule } from './shared/shared.module';

import { QuoteSummaryComponent } from './quote-summary/quote-summary.component';
import { ComparePlansComponent } from './compare-plans/compare-plans.component';
import { AdditionalDetailsComponent } from './additional-details/additional-details.component';
import { SuccessMsgComponent } from './shared/success-msg/success-msg.component';
import { GuestAuthGuard } from './core/guard/guest.auth.guard';
import { MessageComponent } from './shared/message/message.component';
import { PaymentFailedComponent } from './shared/payment-failed/payment-failed.component';
import { NewMotorInfoScreen } from './new screen/motorinfo1/motorinfo1.component';
import { NewLoginScreen } from './new screen/login1/login1.component';

const routes: Routes = [
  {
    path: 'new-login',
    component: NewLoginScreen,
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'new-motor-info',
    component: NewMotorInfoScreen,
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'compare-plans',
    component: ComparePlansComponent,
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'quote-summary',
    component: QuoteSummaryComponent,
    canActivate: [GuestAuthGuard]
  },
  {
    path: "additional-details",
    component: AdditionalDetailsComponent,
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'payment-succeed',
    component: SuccessMsgComponent,
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'payment-failed',
    component: PaymentFailedComponent,
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'resetPassword/:id',
    component: NewLoginScreen,
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'forgotPwd',
    component: NewLoginScreen,
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'contact-message/:type',
    component: MessageComponent,
    canActivate: [GuestAuthGuard]
  },
  {
    path: "User",
    loadChildren: () =>
      import("./UserManagement/user.module").then(m => m.userModule)
  },
  {
    path: "Customer360",
    loadChildren: () =>
      import("./UserManagement/customer360/customer360.module").then(m => m.Customer360Module)
  },
  {
    path: '',
    redirectTo: 'new-login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'new-login',
    pathMatch: 'full'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,
    scrollPositionRestoration: 'enabled'
  },
  ), AppMaterialModule,
    SharedModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
