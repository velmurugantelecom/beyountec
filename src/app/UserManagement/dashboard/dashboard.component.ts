import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../core/services/core.service'
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  //  news and announcments
  news = [];
  count: any = 0;
  //  referal quotes
  referalQuoteData = [];

  //policy due for renewal
  tableData = []
  constructor(private spinner: NgxSpinnerService,private commonservice: CoreService) { }

  ngOnInit() {
    this.spinner.show();
    this.commonservice.getInputs('brokerservice/dashboard/news', '').subscribe((result: any) => {

      this.news = [
        {
          name: 'MOST INNOVATIVE PRODUCT',
          comment: 'It Is With Great Pride That We Announce That AFNIC’s'
        },
        {
          name: 'Save More,Protect More with AFNIC Insurance',
          comment: '10% Off On Home Insurance Products '
        },
        
      ]
    })
    //  referal quotes
    this.getReferalQuoteList('R,RA,RD');

    //policy due for Renewal
    this.fetchRenewalQuotes();
  }

  nav(i) {
    this.count = this.count + (i)
  }

  //  referal quotes
  getReferalQuoteList(statusId) {
    let params = {
      "page": 0,
      "pageSize": 4,
      "statusId": statusId
    };

    this.commonservice.getInputs('brokerservice/search/quotes/findAll', params).subscribe(result => {
      this.referalQuoteData = result.data;

    })
  }


  //policy due for renwal
  fetchRenewalQuotes() {
    let params = {
      "expiredInXDays": "30",
      "page": 1,
      "pageSize": 4,
      "sortBy": "expiryDate",
      "sortOrder": "asc"
    }
    this.commonservice.getInputs('brokerservice/dashboard/dueForRenewal', params).subscribe((result: any) => {
      if (result.data)
        this.tableData = result.data;
        this.spinner.hide();
    }, err => {
      this.spinner.hide();
    });
  }


}
