import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppMaterialModule } from './app-material.module';
import { SharedModule } from './shared/shared.module';


import { SuccessMsgComponent } from './shared/success-msg/success-msg.component';
import { GuestAuthGuard } from './core/guard/guest.auth.guard';
import { MessageComponent } from './shared/message/message.component';
import { PaymentFailedComponent } from './shared/payment-failed/payment-failed.component';


const routes: Routes = [

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
    loadChildren: () =>
    import("./login1/login1.module").then(m => m.NewLoginScreenModule),
    canActivate: [GuestAuthGuard]
  },
  { 
    path: 'resetPassword/:id/:type',
    loadChildren: () =>
    import("./login1/login1.module").then(m => m.NewLoginScreenModule),
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'forgotPwd',  loadChildren: () =>
    import("./login1/login1.module").then(m => m.NewLoginScreenModule),
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'contact-message/:type',
    component: MessageComponent,
    canActivate: [GuestAuthGuard]
  },
  {
    path: "new-login",
    loadChildren: () =>
      import("./login1/login1.module").then(m => m.NewLoginScreenModule),
      canActivate: [GuestAuthGuard]
  },
  {
    path: "new-motor-info",
    loadChildren: () =>
      import("./motorinfo1/motorinfo1.module").then(m => m.NewMotorInfoScreenModule),
      canActivate: [GuestAuthGuard]
  },
  {
    path: "compare-plans",
    loadChildren: () =>
      import("./compare-plans/compare-plans.module").then(m => m.ComparePlansModule),
      canActivate: [GuestAuthGuard]
  },
  {
    path: "quote-summary",
    loadChildren: () =>
      import("./quote-summary/quote-summary.module").then(m => m.QuoteSummaryModule),
      canActivate: [GuestAuthGuard]
  },
  {
    path: "additional-details",
    loadChildren: () =>
      import("./additional-details/additional-details.module").then(m => m.AdditionalDetailsModule),
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
      import("./customer360/customer360.module").then(m => m.Customer360Module)
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
