

import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from "@angular/core"
import { Observable, throwError } from "rxjs";
import { tap, catchError, retry } from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { AppService } from './core/services/app.service';

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  public invalidAutoDataCount = 0;
  constructor(public toasterService: ToastrService,
    public spinner: NgxSpinnerService,
    public router: Router,
    public appService: AppService) { }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    let token: string;
    let updatedRequest;
    if (localStorage.getItem("tokenDetails") && localStorage.getItem("isLoggedIn") == 'true') {
      token = localStorage.getItem("tokenDetails");
      updatedRequest = req.clone({
        headers: req.headers.set("Authorization", token)
      });
    } else if (localStorage.getItem("guesttokenDetails") && localStorage.getItem("isLoggedIn") == 'false') {
      token = localStorage.getItem("guesttokenDetails");
      updatedRequest = req.clone({
        headers: req.headers.set("Authorization", token)
      });
    }
    else {
      updatedRequest = req.clone();
    }

    return next.handle(updatedRequest).pipe(
      tap(evt => {
        if (evt instanceof HttpResponse) {
        }
      }),
      catchError((err: any) => {
        console.log(err);
        if (err instanceof HttpErrorResponse) {
          if (err.status == 401) {
            
            this.toasterService.error('Token Expired', 'Please try again', {
              timeOut: 3000
            });
 
            return
          }
          try {
           let errorMsg = err.error.text || err.error.error || err.error ;
            this.spinner.hide();
            if (errorMsg != 'Internal Server Error') {
              if (err.url.includes('brokerservice/policy') && !err.url.includes('Summary')) {
                this.router.navigate(['/contact-message', 'policy-failed']);
              } else {
                if (errorMsg === 'Unable to fetch data from auto data') {
                    this.router.navigate(['/contact-message', 'autodata-failed']);
                  // ++this.invalidAutoDataCount;
                  // if (this.invalidAutoDataCount === 4) {
                  //   this.invalidAutoDataCount = 0;
                  //   this.router.navigate(['/contact-message', 'autodata-failed']);
                  // }
                  // this.appService._invalidChassisNumber.next('invalid');
                } else {
                  this.toasterService.error('', errorMsg, {
                    timeOut: 3000
                  });
                }   
              }
            } else {
              this.toasterService.error('', 'An error has occurred please try again', {
                timeOut: 3000
              });
            }
          } catch (e) {
            this.toasterService.error('An error occurred', '');
            this.spinner.hide();
          }
        }
        return throwError(err);
      }));
  }
}