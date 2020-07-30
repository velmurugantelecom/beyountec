import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Customer360Service } from './customer360.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-customer360',
  templateUrl: './customer360.component.html',
  styleUrls: ['./customer360.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class Customer360Component implements OnInit {
  searchform: FormGroup
  public searchlist: any = [];
  public PolicyList: any = [];
  public claims: any = [];
  hidetab: any;
  public currentpolicy: any = [];
  public claimdisplay: boolean;
  searchheader: string = '';
  displayedColumns: string[] = ['Claims', 'IntimatedOn', 'lossOn', 'Reserve', 'Settled', 'Balance', 'Status'];
  dataSource: any;
  options: any = {}
  showAdvancedSearch: boolean = false;
  productid;
  navParams: any = [];
  policyNo
  constructor(private spinner: NgxSpinnerService, private customerService: Customer360Service, private router: Router, private route: ActivatedRoute) {
    this.route.queryParams
      .subscribe(params => {
        this.policyNo = params['policyNo'];

      })


  }

  ngOnInit() {
    this.spinner.show();

    this.getclaims(this.policyNo);
  }

  getclaims(policyNo) {
    let params = {
      policyNo: policyNo,
    };
    this.customerService.getclaims(params).subscribe((data: any) => {
      this.claims = data;
      this.claimdisplay = true;
      this.spinner.hide();

    }, err => {
      this.spinner.hide();
    });
    this.customerService.getItems(params)
    // setTimeout(() => {
      this.customerService.ongetpolicyno.subscribe(value => {
        this.currentpolicy = value.data;
          // if (this.currentpolicy) {
          //   this.spinner.hide();
          // }
      }, err => {
      })
    // }, 4000);
  }
  navigateclaims(url) {
    // const navigationExtras: NavigationExtras = { state: { policyNo: this.currentpolicy.policyNo, productid: this.currentpolicy.productTypeId } };
    this.router.navigate([`/${url}`], { queryParams: { policyNo: this.currentpolicy.policyNo, productid: this.currentpolicy.productTypeId } });
  }

}

