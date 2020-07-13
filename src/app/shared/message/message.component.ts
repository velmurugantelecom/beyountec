import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from 'src/app/core/services/core.service';
import { AppService } from 'src/app/core/services/app.service';
import { MatDialogRef } from '@angular/material';
import { chooseProduct } from '../product-selection/product-selection.component';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  public type;
  text:any;
  quotationText:any;
 // public text = `Thank you for quotation request. Your request cannot be processed at this time. Our agent will contact you to finalise the policy.`;
  //public arabicText = `شكرا لك على طلب الاقتباس. لا يمكن معالجة طلبك في هذا الوقت. سيتصل بك وكيلنا لاستكمال السياسة.`;
  public icon = '';

  constructor(private route: ActivatedRoute,
    private coreService: CoreService,
    private dataService: DataService,
    private translate: TranslateService,
    ) {
    this.route.params.subscribe(params => {
      this.type = params['type']
    });
    this.translate.get('MessageAlert') .subscribe(value => { 
      this.text = value; 
    } );
  }

  ngOnInit() {
    switch (this.type) {
      case 'br-failed': {
        this.icon = 'info';
        this.text =`Thank you for your quotation request. Your request cannot be processed at this time. Our agent will contact you to finalise the policy.`;
        break;
      }
      case 'policy-failed': {
        this.icon = 'alert';
        this.text =`Thank you for your quotation request. Your request cannot be processed at this time. Our agent will contact you to finalise the policy.`;
        break;
      }
      case 'autodata-failed': {
        this.icon = 'info';
        let params = {
          ...this.dataService.getUserDetails(),
          reason:`Auto Data not Returning Value`
        }
        this.coreService.postInputs('brokerservice/document/enquiryMail', params, {}).subscribe(res => {
        });
        break;    
      }
      case 'quotation-failed': {
        this.translate.get('QuotationFailedAlert') .subscribe(value => { 
          this.quotationText = value; 
        } );
        this.icon = 'info';
      //  this.arabicText = '';
        this.text =  this.quotationText;
        let params = {
          ...this.dataService.getUserDetails(),
          reason:`Make year for the vehicle is  greater than seven years`
        }
        this.coreService.postInputs('brokerservice/document/enquiryMail', params, {}).subscribe(res => {
        });
        break;
      }
    }
  }
}
