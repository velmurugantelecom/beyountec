import { Component, OnInit } from '@angular/core';
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
  menus = [];
  userType: any;
  routerurl;
  username: string
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
    this.userType = localStorage.getItem("isLoggedIn");
    this.username = localStorage.getItem("Username")
    if (localStorage.getItem("isLoggedIn") == "false" && this.routerurl != 'Login') {

      if (this.routerurl != 'home' && this.routerurl != '') {
        this.menus = [
          { label: 'Home', value: 'home' },
          { label: 'Login/Signup', value: 'Login' },
        ];
      } else {
        this.menus = [
          { label: 'Login/Signup', value: 'Login' }
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
        localStorage.clear();
        localStorage.setItem('isLoggedIn', 'false');
        this.router.navigate([`/Login`])
      }
    })
  }

  changeLanguage(value) {
    console.log(value)
    if (value === 'en') {
      this.selectedLanguage = 'English';
      this.languageFlag = './assets/sharedimg/en-flag.png';
      this.translate.use(value);
    } else if (value === 'fa') {
      this.selectedLanguage = 'Arabic';
      this.languageFlag = './assets/sharedimg/en-flag.png';
      this.translate.use(value);
    }
  }
}
