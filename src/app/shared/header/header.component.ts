import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/core/services/app.service';
import { DataService } from 'src/app/core/services/data.service';
import { BehaviorSubject } from 'rxjs';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output()
  languageInfoEmitter = new EventEmitter();
  menus = [];
  userType: any;
  routerurl;
  username: string
  loginSignup: any;
  home: any;
  public selectedLanguage;
  public languageFlag;
  public language: any;
  public loaded: BehaviorSubject<any> = new BehaviorSubject(false);

  constructor(private router: Router, private commonService: AuthService,
    public translate: TranslateService,
    public appService: AppService,
    private dataService: DataService,
    public runtimeConfigService: RuntimeConfigService) {
    router.events.forEach(event => {
      if (event instanceof NavigationEnd) {
        this.routerurl = event.url.slice(1).split("/")[0];
        this.routerurl = this.routerurl.split("?")[0]
        this.navbarList()
      }
    });


  }

  ngOnInit() {
    this.appService._languageChange.subscribe(res => {
      this.changeLanguage(res);
    })
  }

  navbarList() {
    this.translate.get('Home').subscribe(value => {
      this.home = value;
      if (this.menus.length > 0) {
        this.menus = [{
          label: this.home, value: 'new-login'
        }]
      }
    });
    this.userType = localStorage.getItem("isLoggedIn");
    this.username = localStorage.getItem("Username");
    if (localStorage.getItem("isLoggedIn") == "false" && this.routerurl != 'new-login') {

      if (this.routerurl != 'new-login' && this.routerurl != '') {
        this.menus = [
          { label: this.home, value: 'new-login' }
        ];
      } else {
        this.menus = [
          { label: this.home, value: 'new-login' }
        ];
      }
    } else if (this.routerurl == 'User') {
      this.menus = [];
    } else {
      this.menus = [];
    }
  }

  navPages(value: string) {
    this.router.navigate([`/${value}`])
  }

  LogOut() {
    this.commonService.logout().subscribe(Response => {
      if (Response) {
        this.dataService.setUserDetails({});
        localStorage.removeItem('tokenDetails');
        localStorage.removeItem('Username');
        localStorage.removeItem('guesttokenDetails');
        localStorage.setItem('isLoggedIn', 'false');
        this.appService._loginUserTcNumber.next({});
        this.appService._insurerDetails.next({})
        this.router.navigate([`/new-login`]);
      }
    })
  }


  changeLanguage(value) {
    this.language = value;
    this.languageInfoEmitter.emit(value);
    localStorage.setItem('language', value);
    if (value === 'en') {
      this.selectedLanguage = true;
      this.languageFlag = './assets/sharedimg/en-flag.png';
      this.translate.use(value);
      this.navbarList();
    } else if (value === 'ar') {
      this.selectedLanguage = false;
      this.languageFlag = './assets/sharedimg/en-flag.png';
      this.translate.use(value);
      this.navbarList();
    }
  }
}
