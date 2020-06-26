import { Component, OnInit ,Output, EventEmitter} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/core/services/app.service';


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
  loginSignup:any;
  home:any;
  public selectedLanguage;
  public languageFlag;

  constructor(private router: Router, private commonService: AuthService,
    public translate: TranslateService,
    public appService: AppService) {
    router.events.forEach(event => {
      if (event instanceof NavigationEnd) {
      
        this.routerurl = event.url.slice(1).split("/")[0];
        console.log(this.routerurl);
        this.navbarList()
      }
    });
    

  }

  ngOnInit() {
    this.appService._languageChange.subscribe(res => {
      console.log(res)
      this.changeLanguage(res);
    })
  }

  navbarList() {
    this.translate.get('LoginSignup') .subscribe(value => { 
      this.loginSignup = value; 
    } );
    this.translate.get('Home') .subscribe(value => { 
      this.home = value; 
    } );
    this.userType = localStorage.getItem("isLoggedIn");
    this.username = localStorage.getItem("Username")
    if (localStorage.getItem("isLoggedIn") == "false" && this.routerurl != 'Login') {
     
      if (this.routerurl != 'home' && this.routerurl != '') {
        this.menus = [
          { label: this.home, value: 'home' },
          { label: this.loginSignup, value: 'Login' },
        ];
      } else {
        this.menus = [
          { label: this.loginSignup, value: 'Login' }
        ];
      }
    } else if (this.routerurl == 'User') {
      this.menus = [];
    }
  }

  navPages(value: string) {
    this.router.navigate([`/${value}`])
  }

  LogOut() {
    this.commonService.logout().subscribe(Response => {
      if (Response) {
        // localStorage.clear();
        localStorage.removeItem('tokenDetails');
        localStorage.removeItem('Username');
        localStorage.removeItem('guesttokenDetails');
        localStorage.setItem('isLoggedIn', 'false');
        this.appService._loginUserTcNumber.next({});
        this.appService._insurerDetails.next({})
        this.router.navigate([`/Login`])
      }
    })
  }

  changeLanguage(value) {
    this.languageInfoEmitter.emit(value);
    localStorage.setItem('language', value);
    if (value === 'en') {
      this.selectedLanguage = 'English';
      this.languageFlag = './assets/sharedimg/en-flag.png';
      this.translate.use(value);
      this.navbarList();
    } else if (value === 'ar') {
      this.selectedLanguage = 'Arabic';
      this.languageFlag = './assets/sharedimg/en-flag.png';
      this.translate.use(value);
      this.navbarList();
    }
  }
}
