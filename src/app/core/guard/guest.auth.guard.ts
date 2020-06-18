import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from '../services/app.service';

@Injectable()
export class GuestAuthGuard implements CanActivate {

    constructor(private appService: AppService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.appService.isBackButtonClicked) {
            return true;
        } else {
            window.alert('back button disabled');
            this.appService.isBackButtonClicked = false;
            history.pushState(null, null, location.href);
            return false;
        }
    }
}