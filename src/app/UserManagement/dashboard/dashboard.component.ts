import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../core/services/core.service'
import { NgxSpinnerService } from "ngx-spinner";
import { DropDownService } from 'src/app/core/services/dropdown.service';

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
  public language: any;

  //policy due for renewal
  tableData = []
  isFirst = true;
  constructor(private spinner: NgxSpinnerService,
    private dropdownservice: DropDownService,
    private commonservice: CoreService) { }

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
    this.language = localStorage.getItem("language");
    if (screen.width < 768) {
      this.isFirst = false;
    }
  }

  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
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

    this.dropdownservice.getInputs('brokerservice/search/quotes/findAll', params).subscribe(result => {
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
