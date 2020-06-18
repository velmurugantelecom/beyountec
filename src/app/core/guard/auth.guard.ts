import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from '../services/app.service';

@Injectable()
export class AuthGuard implements CanActivate {


  constructor(private _authService: AuthService, private _router: Router, private appService: AppService) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this._authService.isLoggednIn() && !this.appService.isBackButtonClicked) {
      return true;
    }
    if (this.appService.isBackButtonClicked) {
      window.alert('back button disabled');
      this.appService.isBackButtonClicked = false;
      history.pushState(null, null, location.href);
      return false;
    }
    // navigate to Home page
    this._router.navigate(['/home']);
    // you can save redirect url so after authing we can move them back to the page they requested
    return false;
  }
}