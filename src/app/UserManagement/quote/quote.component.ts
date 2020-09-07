import { Component, OnInit } from '@angular/core';
import { Customer360Service } from '../../customer360/customer360.service';
import { Router, NavigationExtras } from '@angular/router';
import { CoreService } from 'src/app/core/services/core.service';
import { DropDownService } from 'src/app/core/services/dropdown.service';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss']
})
export class QuoteComponent implements OnInit {

  flipped = false;


  tableData = [];
  displayedColumns: string[] = ['policyNo', 'quoteNo', 'mobileNo', 'startDate', 'endDate', 'productId', 'status'];
  constructor(private Service: CoreService,public runtimeConfigService: RuntimeConfigService, private router: Router,private dropdownservice: DropDownService) { }

  ngOnInit() {
    this.getpolicy();
  }

  getpolicy() {
    let params = {
      quoteType: 'FQ',
      page: 0,
      pageSize: 5,
    };

    this.dropdownservice.getInputs("brokerservice/search/quotes/findAll", params).subscribe((data: any) => {
      this.tableData = data.data;
    })
  }
  NewQuote() {
    this.router.navigate([`/motor-info`]);
  }

}
