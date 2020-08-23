import { Component, OnInit, Inject } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import { config } from './core/config';
import { AuthService } from './core/services/auth.service';
import { Subscription } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocationStrategy } from '@angular/common';
import { AppService } from './core/services/app.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  pingSubscription: Subscription;
  routerurl: any;
  isLoggedInUser: boolean;
  isPingStarted: boolean;
  isWatchStarted: boolean;

  constructor(private userIdle: UserIdleService,
    private auth: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private locationStrategy: LocationStrategy,
    private appService: AppService,
    public translate: TranslateService
  ) {
    // multi language 
    this.translate.addLangs(['en', 'ar']);
    let browserLang = (localStorage.getItem('language')) ? localStorage.getItem('language') : 'en';
    this.appService._languageChange.next(browserLang);

    // back button disable
    this.locationStrategy.onPopState(() => {
      this.appService.isBackButtonClicked = true;
    });

    router.events.forEach(event => {
      if (event instanceof NavigationStart) {
        this.routerurl = event.url.slice(1);
        
        if (this.routerurl === '' || this.routerurl === 'new-login' || this.routerurl === 'resetPassword' || this.routerurl === 'forgotPwd' || localStorage.getItem('guesttokenDetails')) {
          if (localStorage.getItem('isLoggedIn') === 'true') {
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('tokenDetails');
            localStorage.removeItem('Username');
            localStorage.removeItem('email');
          }
          this.stopWatching();
        } else {
          if (!this.isWatchStarted)
            this.startWatching();
        }
      }
    });

  }

  ngOnInit() {
    this.userIdle.setConfigValues({
      idle: config.idle,
      timeout: config.timeout,
      ping: config.ping
    });

    this.auth.isUserLoggedIn.subscribe(val => {
      if (val)
        this.isLoggedInUser = true;
    });

    this.userIdle.onTimerStart().subscribe(count => {
      if (this.isLoggedInUser)
        if (count === 1) {
          let dialogRef = this.dialog.open(TimeoutDialogComponent, {
            width: '400px',
            data: {}
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result || result === undefined) {
              this.LogOut();
            } else {
              this.restart();
            }
          });
        }
    });
    localStorage.setItem('maxValue', '0');
    localStorage.setItem('minValue', '0');
  }

  stopWatching() {
    this.isWatchStarted = false;
    this.userIdle.stopWatching();
    if (this.isPingStarted) {
      this.isPingStarted = false;
      this.pingSubscription.unsubscribe();
    }
  }

  bodyStyleChange(value) {
    let body = document.getElementsByTagName('body')[0];
    if (value === 'en') {
      body.dir = "ltr";
    }
    else {
      body.dir = "rtl";
    }
  }

  startWatching() {
    this.userIdle.startWatching();
    this.isWatchStarted = true;
    this.isPingStarted = true;
    this.pingSubscription = this.userIdle.ping$.subscribe(value => {
      console.log(value)
      this.auth.ocall().subscribe((val) => {
      });
    });
  }

  restart() {
    this.auth.ocall().subscribe(response => {
    })
    this.userIdle.resetTimer();
  }

  LogOut() {
    this.spinner.show();
    this.isWatchStarted = false;
    this.auth.logout().subscribe(Response => {
      if (Response) {
        localStorage.removeItem('tokenDetails');
        localStorage.removeItem('Username');
        localStorage.removeItem('guesttokenDetails');
        localStorage.setItem('isLoggedIn', 'false');
        this.router.navigate([`/new-login`])
        this.spinner.hide();
      }
    });
  }
}

@Component({
  selector: 'timeout-dialog',
  templateUrl: './timeout-component.html',
  styleUrls: []
})
export class TimeoutDialogComponent {

  public doTimeout: boolean = false;
  public minutes = 5;
  public seconds = 0;
  public totalMs = 300000;

  constructor(public dialogRef: MatDialogRef<TimeoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit() {
    this.showTimer();
  }

  showTimer() {
    setInterval(() => {
      this.minutes = Math.floor((this.totalMs % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((this.totalMs % (1000 * 60)) / 1000);
      this.totalMs = this.totalMs - 1000;
      if (this.totalMs === 0) {
        this.doTimeout = true;
        this.dialogRef.close();
      }
    }, 1000)
  }

  stopTimer() {
    this.doTimeout = false;
  }

  logout() {
    this.doTimeout = true;
    this.dialogRef.close();
  }
}