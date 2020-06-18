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
    this.translate.addLangs(['en', 'fa']);
    // this.translate.setDefaultLang('en');
    let browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en|fa/) ? browserLang : 'en');
    // this.translate.use('fa');
    this.appService._languageChange.next(browserLang);

    // back button
    this.locationStrategy.onPopState(() => {
      this.appService.isBackButtonClicked = true;
    });

    router.events.forEach(event => {
      if (event instanceof NavigationStart) {
        this.routerurl = event.url.slice(1);
      }
    });
  }

  ngOnInit() {
    this.userIdle.setConfigValues({
      idle: config.idle,
      timeout: config.timeout,
      ping: config.ping
    });

    this.auth.isUserLoggedIn.subscribe(value => {
      if (value) {
        this.isLoggedInUser = true;
        this.startWatching('user');
      } else {
        this.isLoggedInUser = false;
        this.stopWatching();
      }
    })

    this.auth.isGuestUser.subscribe(value => {
      if (value) {
        this.startWatching('guest');
      } else {
        this.stopWatching();
      }
    })

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
  }

  stopWatching() {
    this.userIdle.stopWatching();
  }

  startWatching(value) {
    this.userIdle.startWatching();
    if (value === 'guest') {
      this.pingSubscription = this.userIdle.ping$.subscribe(value => {
        this.auth.ocall().subscribe(() => {
          console.log("Refreshed token");
        });
      });
    }
  }

  restart() {
    this.auth.ocall().subscribe(response => {
    })
    this.userIdle.resetTimer();
  }

  LogOut() {
    this.spinner.show();
    this.auth.logout().subscribe(Response => {
      if (Response) {
        localStorage.clear();
        localStorage.setItem('isLoggedIn', 'false');
        this.router.navigate([`/Login`])
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