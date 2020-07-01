// angularLib modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { BrowserModule } from '@angular/platform-browser'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from "ngx-spinner";
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { UserIdleModule } from 'angular-user-idle';
import { MAT_DATE_LOCALE, } from '@angular/material/core';

// modules
import { AppRoutingModule } from './app-routing.module';
import { AppMaterialModule } from './app-material.module';
import { SharedModule } from './shared/shared.module';
import { MotorModule } from './motor/motor.module';
import { CoreModule } from './core/core.module';

// components
import { AppComponent, TimeoutDialogComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { GetQuoteComponent } from './get-quote/get-quote.component';
import { QuoteSummaryComponent } from './quote-summary/quote-summary.component';
import { ComparePlansComponent } from './compare-plans/compare-plans.component';
import { AppHttpInterceptor } from './app.interceptor';
import { LoginComponent } from './login/login.component';
import { AdditionalDetailsComponent } from './additional-details/additional-details.component';
import { QuoteDialog } from './home/home.component';
import { AuthGuard } from './core/guard/auth.guard';
import { AuthService } from './core/services/auth.service';
import { CoreService } from './core/services/core.service';
import { EmailPopupComponent } from './modal/email-popup/email-popup.component';
import { WebCamComponent } from './shared/web-cam/web-cam.component';
import { WebcamModule } from 'ngx-webcam';

import { NgSelectModule } from '@ng-select/ng-select';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxCurrencyModule } from "ngx-currency";
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule, MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { MessagePopupComponent } from './modal/message-popup/message-popup.component';
import { ContentPopupComponent } from './modal/content-popup/content-popup.component';
import { GuestAuthGuard } from './core/guard/guest.auth.guard';
import { chooseProduct } from './shared/product-selection/product-selection.component';
import { ProductChangePopupComponent } from './modal/product-change/product-change.component';
import { Login1Component } from './changes/login1/login1.component';
import { Motorinfo1Component } from './changes/motorinfo1/motorinfo1.component';
import { ScanAndUpload } from './shared/scan-and-upload/scan-and-upload.component';
import { DropDownService } from './core/services/dropdown.service';
import { NewLoginScreen } from './new screen/login1/login1.component';
import { NewMotorInfoScreen } from './new screen/motorinfo1/motorinfo1.component';
const userIdleConfig = {
  idle: 540,
  timeout: 1,
  ping: 0
};

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

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
    AppComponent,
    HomeComponent,
    GetQuoteComponent,
    QuoteSummaryComponent,
    ComparePlansComponent,
    LoginComponent,
    AdditionalDetailsComponent,
    QuoteDialog,
    TimeoutDialogComponent,
    EmailPopupComponent,
    MessagePopupComponent,
    ProductChangePopupComponent,
    ContentPopupComponent,
    Motorinfo1Component,
    Login1Component,
    NewLoginScreen,
    NewMotorInfoScreen
  ],
  imports: [
    //angularLib
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,  
    NgSelectModule,
    NgxSpinnerModule,
    HttpClientModule,
    NgxCurrencyModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-right',
      preventDuplicates: true
    }),
    UserIdleModule.forRoot(userIdleConfig),

    //angularModules
    AppRoutingModule,
    AppMaterialModule,
    SharedModule,
    MotorModule,
    CoreModule,
    WebcamModule,
    
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OwlMomentDateTimeModule,
  ],
  entryComponents: [QuoteDialog, chooseProduct, EmailPopupComponent, WebCamComponent, TimeoutDialogComponent
  ,MessagePopupComponent, ProductChangePopupComponent,ContentPopupComponent, ScanAndUpload],
  providers: [
    CoreService,
    AuthGuard,
    GuestAuthGuard,
    DropDownService,
    AuthService,

    { provide: HTTP_INTERCEPTORS, useClass: AppHttpInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
