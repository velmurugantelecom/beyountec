import { Component, OnInit } from '@angular/core';
import { Customer360Service } from '../customer360/customer360.service';
import { Router, NavigationExtras } from '@angular/router';
import { DropDownService } from 'src/app/core/services/dropdown.service';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent implements OnInit {

  flipped = false;


  tableData = [];
  displayedColumns: string[] = ['policyNo', 'quoteNo', 'mobileNo', 'startDate', 'endDate', 'productId', 'status'];
  constructor(private customerService: Customer360Service,
    private dropdownservice: DropDownService,
     private router: Router) { }

  ngOnInit() {
    this.getpolicy();
  }

  getpolicy() {
    let params = {
      quoteType: 'p',
      page: 0,
      pageSize: 5,
    };
    this.dropdownservice.getpolicy(params).subscribe((data: any) => {
      this.tableData = data.data;
    })
  }

  showDetails(value) {
    // const navigationExtras: NavigationExtras = { state: { policyDetails: value } };
    this.router.navigate([`/Customer360`], { queryParams: { policyNo: value.policyNo } });
  }

  flipIt() {
    this.flipped = !this.flipped;
  }

}
