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
  public brFailed:any;
  text:any;
  public icon = '';
  public language:any ;

  constructor(private route: ActivatedRoute,
    private coreService: CoreService,
    private dataService: DataService,
    private translate: TranslateService,
    ) {
    this.route.params.subscribe(params => {
      this.type = params['type']
    });

  }

  ngOnInit() {
    switch (this.type) {
      case 'br-failed': {
        this.text=  this.languageChange('BrFailed');
        this.icon = 'info';
        break;
      }
      case 'policy-failed': {
        this.text=  this.languageChange('PolicyFailed');
        this.icon = 'alert';
        break;
      }
      case 'autodata-failed': {
        this.text=  this.languageChange('MessageAlert');
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
        this.text=  this.languageChange('QuotationFailedAlert');
        this.icon = 'info';
        let params = {
          ...this.dataService.getUserDetails(),
          reason:`Make year for the vehicle is  greater than seven years`
        }
        this.coreService.postInputs('brokerservice/document/enquiryMail', params, {}).subscribe(res => {
        });
        break;
      }
      case 'imported-vehicle': {
        this.text=  this.languageChange('ImportedVehicle');
        this.icon = 'info';
        let params = {
          ...this.dataService.getUserDetails(),
          reason:`Auto Data not Returning Value`
        }
        this.coreService.postInputs('brokerservice/document/enquiryMail', params, {}).subscribe(res => {
        });
        break;  
      }
    }
    this.language=localStorage.getItem("language") ;
  }

  languageChange(urlValue){
    this.translate.get(urlValue) .subscribe(value => { 
      this.text = value; 
    } );
  return this.text;
  }
  ngDoCheck(){
    if(this.language!=localStorage.getItem("language")){
      this.language=localStorage.getItem("language");
      switch (this.type) {
        case 'br-failed': {
          this.text=  this.languageChange('BrFailed');
          break;
        }
        case 'policy-failed': {
          this.text=  this.languageChange('PolicyFailed');
          break;
        }
        case 'autodata-failed': {
          this.text=  this.languageChange('MessageAlert');
          break;    
        }
        case 'quotation-failed': {
          this.text=  this.languageChange('QuotationFailedAlert');
          break;
        }
        case 'imported-vehicle': {
          this.text=  this.languageChange('ImportedVehicle');
          break;  
        }
      }
  
    }
  }
  
}
