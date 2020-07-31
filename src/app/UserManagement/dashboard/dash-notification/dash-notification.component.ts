import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { CoreService } from 'src/app/core/services/core.service';
import { Customer360Service } from '../../../customer360/customer360.service';
import { Router } from '@angular/router';
import { chooseProduct } from 'src/app/shared/product-selection/product-selection.component';
import { AppService } from 'src/app/core/services/app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownService } from 'src/app/core/services/dropdown.service';

@Component({
  selector: 'app-dash-notification',
  templateUrl: './dash-notification.component.html',
  styleUrls: ['./dash-notification.component.scss']
})
export class DashNotificationComponent implements OnInit {
  displayedColumns: string[] =['PolicyNo', 'QuoteNo', 'startDate', 'endDate', 'product', 'status'];
  selectedColumns: any = [];
  tableData: any = [];
  subscription: Subscription;
  dataSource: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  panelOpenState = true;
  activeQuotes: String = 'Policy';
  notificationType: Number = 267;
  notificationCount: any;
  quoteCount: any;
  renewalCount: any;
  paymentCount: any;
  quoteData: any;
  renewalData: any;
  paymentData: any;
  inputData: any = {};
  public autoDataURL = '';


  constructor(private postService: CoreService,
    private router: Router, public dialog: MatDialog, private customerService: Customer360Service,
    private dropdownservice: DropDownService,
    private appService: AppService, private service: CoreService, private spinner: NgxSpinnerService) {
    this.selectedColumns['Quotes'] = ['quoteNo', 'insuredName', 'product', 'emailId', 'status'];
    this.selectedColumns['Renewal'] = ['quoteNo', 'insuredName', 'product', 'startDate', 'endDate', 'status'];
    this.selectedColumns['Payment'] = ['refNo', 'insuredName', 'dueDate', 'amount'];
    this.selectedColumns['Policy'] = ['PolicyNo', 'QuoteNo', 'startDate', 'endDate', 'product', 'status'];


    // this.selectedColumns['Comments'] =['quote_number', 'client', 'product', 'email_address', 'status'];
  }


  ngOnInit() {
    // this.getQuoteList('FQ');
    this.getPolicy();
  }
  getQuoteList(quoteType) {
    let params = {
      'page': 0,
      'pageSize': 4,
      'quoteType': quoteType
    };
    this.dropdownservice.getInputs('brokerservice/search/quotes/findAll', params).subscribe(result => {
      if (!result || result.length === 0) {
        return;
      }
      let tempArray = [];
      result.data.forEach((quote) => {
        let sgsId = quote.sgsId + '';
        if (quote.quoteNo != sgsId) {
          tempArray.push(quote);
        }
      })
      this.tableData = tempArray;
      this.dataSource = new MatTableDataSource<any>(this.tableData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      // this.dataSource.filterPredicate = function (data, filter: string): boolean {
      //   return data.quoteType.includes(filter);
      // };
    }, err => {
      /* this.noResults = true; */
    });
  }
  getPaymentDetail() {
    this.dataSource = null;
    this.activeQuotes = 'Payment';
    // tslint:disable-next-line: no-string-literal
    this.displayedColumns = this.selectedColumns['Payment'];
    let params = {
      'page': 0,
      'pageSize': 4,
    };
    this.postService.getInputs('brokerservice/dashboard/outstandingDueAmount', params).subscribe((result: any) => {
      this.dataSource = new MatTableDataSource<any>(result);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  fetchData(type) {
    this.activeQuotes = type;
    this.tableData = {};
    this.dataSource = null;
    this.displayedColumns = this.selectedColumns[type];
    switch (type) {
      case 'Quotes':
        this.getQuoteList('FQ');
        // this.dataSource.sort = this.sort;
        break;

      case 'Renewal':
        this.getQuoteList('RQ');
        // this.dataSource.sort = this.sort;
        break;
      case 'Policy':
        this.getPolicy();
        // this.dataSource.sort = this.sort;
        break;


      case 'Payment':
        this.getPaymentDetail();
        // this.dataSource.sort = this.sort;
        break;

      case 'Comments':
        return;

    }
  }

  getPolicy() {
    let params = {
      quoteType: 'p',
      page: 0,
      pageSize: 5,
    };
    this.dropdownservice.getpolicy(params).subscribe((data: any) => {
      this.tableData = data.data;
      // this.tableData = result.data;
      this.dataSource = new MatTableDataSource<any>(this.tableData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    })
  }

  navpage(element) {
    this.router.navigate([`/Customer360`], { queryParams: { policyNo: element.policyNo } });
  }

  openDialog(Type: string, Title: string): void {
    let dialogRef = this.dialog.open(chooseProduct, {
      width: '350px',
      data: { QType: Type, QTitle: Title }
    });
  }
  NewQuote() {
    this.openDialog('Product Type', 'Product Type');
  }



  showDetails(quote) {
    console.log(quote)
    if (quote.statusId === "WIP" || quote.statusId === "MR") {
      this.router.navigate(['/additional-details'], { queryParams: { quoteNo: quote.quoteNo,retrieveQuote: true } });
    } else if (quote.statusId === 'VF' || quote.statusId === "MA" || quote.statusId === "RA") {
      this.router.navigate([`/quote-summary`], { queryParams: { quoteNo: quote.quoteNo, validQuote : false } });
    }
  }


}
