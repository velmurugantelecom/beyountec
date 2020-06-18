import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from 'src/app/core/services/core.service';
import { AppService } from 'src/app/core/services/app.service';
import { MatDialogRef } from '@angular/material';
import { chooseProduct } from '../product-selection/product-selection.component';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  public type;
  public text = `Thank you for quotation request. Your request cannot be processed at this time. Our agent will contact you to finalise the policy.`;
  public arabicText = `شكرا لك على طلب الاقتباس. لا يمكن معالجة طلبك في هذا الوقت. سيتصل بك وكيلنا لاستكمال السياسة.`;
  public icon = '';

  constructor(private route: ActivatedRoute,
    private coreService: CoreService,
    private appService: AppService,
    ) {
    this.route.params.subscribe(params => {
      this.type = params['type']
    });
  }

  ngOnInit() {
    switch (this.type) {
      case 'br-failed': {
        this.icon = 'info';
        break;
      }
      case 'policy-failed': {
        this.icon = 'alert';
        break;
      }
      case 'autodata-failed': {
        this.icon = 'info';
        let params = {
          ...this.appService.getuserDetails(),
          reason:`Auto Data not Returning Value`
        }
        console.log(params);
        this.coreService.postInputs('brokerservice/document/enquiryMail', params, {}).subscribe(res => {
        });
        break;    
      }
      case 'quotation-failed': {
        this.icon = 'info';
        this.arabicText = '';
        this.text = 'Thanks for Contacting AFNIC. We need more information to issue quote, Our Customer Service Representative will contact you shortly'
        let params = {
          ...this.appService.getuserDetails(),
          reason:`Make year for the vehicle is  greater than seven years`
        }
        console.log(params);
        this.coreService.postInputs('brokerservice/document/enquiryMail', params, {}).subscribe(res => {
        });
        break;
      }
    }
  }
}
