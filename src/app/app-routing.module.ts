import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppMaterialModule } from './app-material.module';
import { SharedModule } from './shared/shared.module';

import { HomeComponent } from './home/home.component';
import { GetQuoteComponent } from './get-quote/get-quote.component';
import { MotorContainerComponent } from './motor/motor-container/motor-container.component';
import { QuoteSummaryComponent } from './quote-summary/quote-summary.component';
import { ComparePlansComponent } from './compare-plans/compare-plans.component';
import { LoginComponent } from './login/login.component';
import { AdditionalDetailsComponent } from './additional-details/additional-details.component';
import { SuccessMsgComponent } from './shared/success-msg/success-msg.component';
import { RequestRedirectComponent } from '../app/shared/request-redirect/request-redirect.component'
import { GuestAuthGuard } from './core/guard/guest.auth.guard';
import { MessageComponent } from './shared/message/message.component';
import { PaymentFailedComponent } from './shared/payment-failed/payment-failed.component';
import { Login1Component } from './changes/login1/login1.component';
import { Motorinfo1Component } from './changes/motorinfo1/motorinfo1.component';

const routes: Routes = [
  {
    path: 'test',
    component: RequestRedirectComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: 'get-qoute',
    component: GetQuoteComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: 'motor-info',
    component: MotorContainerComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: 'compare-plans',
    component: ComparePlansComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: 'quote-summary',
    component: QuoteSummaryComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: 'Login',
    component: LoginComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: 'resetPassword/:id',
    component: LoginComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: 'forgotPwd',
    component: LoginComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: "additional-details",
    component: AdditionalDetailsComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: "successMsg",
    component: SuccessMsgComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: 'payment-succeed',
    component: SuccessMsgComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: 'payment-failed',
    component: PaymentFailedComponent,
    // canActivate: [GuestAuthGuard]
  },
  {
    path: 'demo-login',
    component: Login1Component
  },
  {
    path: 'demo-motor-info',
    component: Motorinfo1Component
  },
  {
    path: 'testcomponent',
    component: RequestRedirectComponent
  },
  {
    path: 'contact-message/:type',
    component: MessageComponent
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
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home',
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
