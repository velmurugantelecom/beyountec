import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../core/services/app.service';
import { CoreService } from '../core/services/core.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../core/services/data.service';

export interface KeyValue<K, V> {
  key: K;
  value: V;
}

@Component({
  selector: "app-compare-plans",
  templateUrl: "./compare-plans.component.html",
  styleUrls: ["./compare-plans.component.scss"]
})

export class ComparePlansComponent implements OnInit {

  public mandatoryCovers = {};
  public optionalCovers = {};
  public isPlanAvailable: boolean;
  public isPlanSelected: boolean;
  public planOb = {};
  public selectedPlan = {};
  public selectedPlanAmount = '0';
  public reviseDetails = 'false';
  public discounts: any = {};
  public promoDiscounts: any = {};
  public loadings: any = {};
  public charges: any = {};
  public excess: any = {};
  public VatPercentage = '';
  showPromoDiscount = false
  selectAlert: any;
  ratingError: any;
  demo1TabIndex;
  disableDisctFld;
  @ViewChild('tabGroup', {
    static: false
  }) tabGroup;
  constructor(private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private appService: AppService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private dataService: DataService) {
    this.route.queryParams
      .subscribe(params => {
        if (params['reviseDetails']) {
          this.reviseDetails = params['reviseDetails'];
        }
      });
  }

  originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  }

  ngOnInit() {
    this.planOb = this.dataService.getPlanDetails();
    // to test hard coded data
    // this.planOb = { "quoteNo": "2285", "status": "WIP", "quoteId": 2285, "amndVerNo": 0, "productId": "1113", "premiumCurrencyId": "AED", "plans": [{ "prodID": "1113", "planDetails": [{ "planId": "111302", "totalPremium": "4292.15", "grossPremium": "4087.76", "txnPremium": 5065.95, "vat": "204.39", "currency": "AED", "planName": "PLAN 1", "rating": 1, "sgsID": 2285, "coverageDetails": [{ "mandatoryCoverages": [{ "pcmCoverageId": "111301", "pcmCoverageDesc": "Own Damage in Comprehensive", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111302", "pcmCoverageDesc": "Third Party in Comprehensive", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111303", "pcmCoverageDesc": "RAC for TP Vehicle", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111304", "pcmCoverageDesc": "TP & Family Passenger Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111305", "pcmCoverageDesc": "Ambulance Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111307", "pcmCoverageDesc": "Total Loss for Chassis Repair", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111308", "pcmCoverageDesc": "TPPD Limit 2Million", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111309", "pcmCoverageDesc": "Compulsory Agency repair for 1st Year", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111314", "pcmCoverageDesc": "Roadside Assistance", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111313", "pcmCoverageDesc": "STF Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111312", "pcmCoverageDesc": "Oman Territories Inside UAE Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }], "optionalCoverages": [] }], "policyForms": [], "loading": [], "discounts": [], "excess": [], "charges": [] }], "quoteNumber": "2285", "quoteId": 2285, "confirmed": false, "brResults": [], "loading": [{ "sgsId": null, "amndVerNo": null, "id": "106", "description": "NCD Discount", "ratePer": 100, "rate": 20, "amount": 1013.19, "companyId": null, "productId": null, "riskType": null, "type": "DI", "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }], "discounts": [], "excess": [{ "sgsId": null, "amndVerNo": null, "id": "1001", "description": "Excess", "ratePer": null, "rate": null, "amount": 700, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }], "charges": [{ "sgsId": null, "amndVerNo": null, "id": "05", "description": "EVG FEES", "ratePer": 1, "rate": 30, "amount": 30, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }, { "sgsId": null, "amndVerNo": null, "id": "07", "description": "EVG NIPS FEES", "ratePer": 1, "rate": 5, "amount": 5, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }, { "sgsId": null, "amndVerNo": null, "id": "OUTPUT_VAT", "description": "Premium VAT", "ratePer": 100, "rate": 5, "amount": 204.39, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }] }, { "prodID": "1113", "planDetails": [{ "planId": "111303", "totalPremium": "4142.25", "grossPremium": "3945", "txnPremium": 4887.5, "vat": "197.25", "currency": "AED", "planName": "PLAN 2", "rating": 2, "sgsID": 2285, "coverageDetails": [{ "mandatoryCoverages": [{ "pcmCoverageId": "111301", "pcmCoverageDesc": "Own Damage in Comprehensive", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111302", "pcmCoverageDesc": "Third Party in Comprehensive", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111303", "pcmCoverageDesc": "RAC for TP Vehicle", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111304", "pcmCoverageDesc": "TP & Family Passenger Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111305", "pcmCoverageDesc": "Ambulance Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111307", "pcmCoverageDesc": "Total Loss for Chassis Repair", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111308", "pcmCoverageDesc": "TPPD Limit 2Million", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111309", "pcmCoverageDesc": "Compulsory Agency repair for 1st Year", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111314", "pcmCoverageDesc": "Roadside Assistance", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111313", "pcmCoverageDesc": "STF Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111311", "pcmCoverageDesc": "Oman Cover (Including Oman Territories Inside UAE)", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111310", "pcmCoverageDesc": "Driver Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111320", "pcmCoverageDesc": "Nill Excess for Windscreen Damage", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111321", "pcmCoverageDesc": "Medical Expenses", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }], "optionalCoverages": [] }], "policyForms": [], "loading": [], "discounts": [], "excess": [], "charges": [] }], "quoteNumber": "2285", "quoteId": 2285, "confirmed": false, "brResults": [], "loading": [{ "sgsId": null, "amndVerNo": null, "id": "106", "description": "NCD Discount", "ratePer": 100, "rate": 20, "amount": 977.5, "companyId": null, "productId": null, "riskType": null, "type": "DI", "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }], "discounts": [], "excess": [{ "sgsId": null, "amndVerNo": null, "id": "1001", "description": "Excess", "ratePer": null, "rate": null, "amount": 700, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }], "charges": [{ "sgsId": null, "amndVerNo": null, "id": "05", "description": "EVG FEES", "ratePer": 1, "rate": 30, "amount": 30, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }, { "sgsId": null, "amndVerNo": null, "id": "07", "description": "EVG NIPS FEES", "ratePer": 1, "rate": 5, "amount": 5, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }, { "sgsId": null, "amndVerNo": null, "id": "OUTPUT_VAT", "description": "Premium VAT", "ratePer": 100, "rate": 5, "amount": 197.25, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }] }, { "prodID": "1113", "planDetails": [{ "planId": "111304", "totalPremium": "4402.65", "grossPremium": "4193", "txnPremium": 5197.5, "vat": "209.65", "currency": "AED", "planName": "PLAN 3", "rating": 3, "sgsID": 2285, "coverageDetails": [{ "mandatoryCoverages": [{ "pcmCoverageId": "111301", "pcmCoverageDesc": "Own Damage in Comprehensive", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111302", "pcmCoverageDesc": "Third Party in Comprehensive", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111303", "pcmCoverageDesc": "RAC for TP Vehicle", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111304", "pcmCoverageDesc": "TP & Family Passenger Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111305", "pcmCoverageDesc": "Ambulance Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111307", "pcmCoverageDesc": "Total Loss for Chassis Repair", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111308", "pcmCoverageDesc": "TPPD Limit 2Million", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111309", "pcmCoverageDesc": "Compulsory Agency repair for 1st Year", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111314", "pcmCoverageDesc": "Roadside Assistance", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111313", "pcmCoverageDesc": "STF Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111311", "pcmCoverageDesc": "Oman Cover (Including Oman Territories Inside UAE)", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111310", "pcmCoverageDesc": "Driver Cover", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111320", "pcmCoverageDesc": "Nill Excess for Windscreen Damage", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111321", "pcmCoverageDesc": "Medical Expenses", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111322", "pcmCoverageDesc": "Personal Effects", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }, { "pcmCoverageId": "111317", "pcmCoverageDesc": "Cover for Passengers (Workers on duty)", "pcmMandOptFlg": 12, "limit": 0, "lossLimit": null, "premium": null, "currency": null, "selected": true }], "optionalCoverages": [] }], "policyForms": [], "loading": [], "discounts": [], "excess": [], "charges": [] }], "quoteNumber": "2285", "quoteId": 2285, "confirmed": false, "brResults": [], "loading": [{ "sgsId": null, "amndVerNo": null, "id": "106", "description": "NCD Discount", "ratePer": 100, "rate": 20, "amount": 1039.5, "companyId": null, "productId": null, "riskType": null, "type": "DI", "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }], "discounts": [], "excess": [{ "sgsId": null, "amndVerNo": null, "id": "1001", "description": "Excess", "ratePer": null, "rate": null, "amount": 700, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }], "charges": [{ "sgsId": null, "amndVerNo": null, "id": "05", "description": "EVG FEES", "ratePer": 1, "rate": 30, "amount": 30, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }, { "sgsId": null, "amndVerNo": null, "id": "07", "description": "EVG NIPS FEES", "ratePer": 1, "rate": 5, "amount": 5, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }, { "sgsId": null, "amndVerNo": null, "id": "OUTPUT_VAT", "description": "Premium VAT", "ratePer": 100, "rate": 5, "amount": 209.65, "companyId": null, "productId": null, "riskType": null, "type": null, "subType": null, "value": null, "valuePer": null, "instMode": null, "minValue": null, "maxValue": null, "txnLevel": null, "editable": false }] }], "errorCode": null, "errorResponse": null }
    if (this.planOb) {
      this.loadVATandPremium();
      this.loadCovers();
      this.initLoading();
      this.loadExcess();
      this.isPlanAvailable = true;
      console.log(this.discounts);
      console.log(this.promoDiscounts)
    }
    else {
      this.isPlanAvailable = false;
    }
  }

  loadCovers() {
    this.planOb['plans'].forEach((plan, index) => {
      plan['bgColor'] = index;
      plan['applyPromoDiscount'] = false;
      plan['promoFieldId'] = `promo${index}`
      if (plan.confirmed) {
        this.demo1TabIndex = index;
        this.isPlanSelected = true;
        this.selectedPlan['planId'] = plan.planDetails[0].planId;
        this.selectedPlanAmount = plan.planDetails[0].grossPremium;
      }
      plan.planDetails[0].coverageDetails[0].mandatoryCoverages.forEach(
        cover => {
          if (cover['pcmCoverageDesc'] != 'Compulsory Agency repair for 1st Year'
            && cover['pcmCoverageDesc'] != 'Total Loss for Chassis Repair'
            && cover['pcmCoverageDesc'] != 'TPPD Limit 2Million'
            && cover['pcmCoverageDesc'] != 'RAC for TP Vehicle'
            && cover['pcmCoverageDesc'] != 'Rent a Car for TP Vehicle') {
            let cvrGroup = this.mandatoryCovers[cover.pcmCoverageDesc] || [];
            if (cvrGroup.length == 0)
              this.mandatoryCovers[cover.pcmCoverageDesc] = [];
            this.mandatoryCovers[cover.pcmCoverageDesc].push({
              planId: plan.planDetails[0].planId,
              cover: cover
            });
          }
        });
      plan.planDetails[0].coverageDetails[0].optionalCoverages.forEach(
        cover => {
          let cvrGroup = this.optionalCovers[cover.pcmCoverageDesc] || [];
          if (cvrGroup.length == 0)
            this.optionalCovers[cover.pcmCoverageDesc] = [];
          this.optionalCovers[cover.pcmCoverageDesc].push({
            planId: plan.planDetails[0].planId,
            cover: cover
          });
        }
      );
    });
  }

  getData(searchKey, values): boolean {
    let isAvailable = false;
    values.forEach(value => {
      if (value.planId == searchKey) {
        if (value.cover.selected) {
          isAvailable = true;
        }
      }
    });
    return isAvailable;
  }

  getOptionalData(searchKey, values): boolean {
    let isAvailable = false;
    values.forEach(value => {
      if (value) {
        if (value.planId == searchKey) {
          isAvailable = true;
        }
      }
    });
    return isAvailable;
  }

  selectPlan(selectedPlan) {
    this.isPlanSelected = true;
    this.selectedPlan['planId'] = selectedPlan.planDetails[0].planId;
    this.selectedPlanAmount = selectedPlan.planDetails[0].grossPremium
    this.planOb['plans'].filter((plan) => {
      if (plan.planDetails[0].planId === this.selectedPlan['planId']) {
        plan.confirmed = true;
      } else {
        plan.confirmed = false;
      }
    });
  }

  confirmPlan() {
    if (!this.isPlanSelected) {
      this.translate.get('Required.SelectPlan').subscribe(value => {
        this.selectAlert = value;
      });
      this.toastr.error('', this.selectAlert, {
        timeOut: 3000
      });
    }
    else if (this.selectedPlanAmount == '0' || this.selectedPlanAmount == null) {
      this.translate.get('Required.RatingError').subscribe(value => {
        this.ratingError = value;
      });
      this.toastr.error('', this.ratingError, {
        timeOut: 3000
      });
    }
    else {
      this.appService.setPlanDetails(this.planOb);
      let params = {
        quoteId: this.planOb['quoteId'],
        amndVerNo: this.planOb['amndVerNo'],
        planId: this.selectedPlan['planId']
      };

      this.coreService.saveInputs('confirmPlan', params, null).subscribe(res => {
        this.router.navigate([`/quote-summary`], { queryParams: { quoteNo: this.planOb['quoteId'], isQuickSummary: true } });
      });
    }
  }

  doCall(plan, value) {
    let selCoverage = value.filter(
      ({ planId }) => planId == plan.planDetails[0].planId
    )[0].cover;
    if (selCoverage.selected) {
      return true
    }
    return false;
  }

  toggleCoverage(plan, covers, event) {
    this.spinner.show();
    let selCoverage = covers.filter(
      ({ planId }) => planId == plan.planDetails[0].planId
    )[0].cover;
    let params = {
      coverageId: selCoverage.pcmCoverageId,
      isChecked: event.checked,
      sgsId: this.planOb['quoteId'],
      productId: this.planOb['productId'],
      planId: plan.planDetails[0].planId,
    };

    this.coreService
      .saveInputs("fetchnIndividualPlansWithRate", params, null)
      .subscribe(response => {
        plan.planDetails[0].grossPremium = response.data.grossPremium;
        if (plan.planDetails[0].planId === this.selectedPlan['planId'])
          this.selectedPlanAmount = response.data.grossPremium;
        this.spinner.hide();
      }, err => {
        this.spinner.hide();
      });
  }

  goBack() {
    if (!this.planOb) {
      this.router.navigate(['/new-motor-info']);
      return
    }
    this.router.navigate(['/new-motor-info'],
      {
        queryParams: {
          quoteNo: this.planOb['quoteNo']
        }
      });
  }

  isSelectedPlan(value) {
    if (value.confirmed)
      return true;
  }

  loadExcess() {
    this.planOb['plans'].forEach(plan => {
      let i = 0;
      plan.excess.forEach(item => {
        let group = this.excess[item.description] || [];
        if (group.length == 0) this.excess[item.description] = [];
        if (i === 0) {
          i++;
          this.excess[item.description].push({
            planId: plan.planDetails[0].planId,
            id: item.id,
            ratePer: item.ratePer,
            rate: item.rate,
            amount: item.amount
          });
        }
      });
    });
  }

  loadVATandPremium() {
    this.planOb['plans'].forEach(plan => {
      plan.planDetails[0]['premiumWithCharges'] = 0;
      plan.planDetails[0]['premiumWithVAT'] = 0;
      let premiumWithCharge = 0;
      let premiumWithVat = 0;
      plan.charges.forEach(item => {
        if (item.description === 'Premium VAT') {
          let group = this.charges[item.description] || [];
          if (group.length == 0) this.charges[item.description] = [];
          this.charges[item.description].push({
            planId: plan.planDetails[0].planId,
            id: item.id,
            ratePer: item.ratePer,
            rate: item.rate,
            amount: item.amount
          });
          premiumWithVat += item.amount;
        } else {
          premiumWithCharge += item.amount
        }
      });
      plan.planDetails[0]['premiumWithVAT'] = premiumWithVat + parseFloat(plan.planDetails[0]['grossPremium']);
      plan.planDetails[0]['premiumWithCharges'] = premiumWithCharge + plan.planDetails[0]['txnPremium'];
    });
  }

  getPremiumWithCharges(plan) {
    if (plan.premiumWithCharges) {
      return plan.premiumWithCharges.toFixed(2);
    }
    return '0.00';
  }

  getPremiumWithVat(plan) {
    if (plan.premiumWithVAT) {
      return plan.premiumWithVAT.toFixed(2);
    }
    return '0.00';
  }

  getNetPremium(plan) {
    if (plan.grossPremium) {
      return parseFloat(plan.grossPremium).toFixed(2);
    }
    return '0.00';
  }

  fetchAmount(searchKey, values, type) {
    let amount;
    let obj = values.filter(({ planId }) => planId == searchKey)[0];
    if (obj) {
      if (obj.amount == null) amount = 0;
      else amount = obj.amount;
      if (type === 'p') {
        this.VatPercentage = `(${obj.rate}%)`;
      }
      return `${amount.toFixed(2)}`;
    }
  }

  fetchAmountMobile(searchKey, values, type) {
    let amount;
    let obj = values.filter(({ planId }) => planId == searchKey)[0];
    if (obj) {
      if (obj.amount == null) amount = 0;
      else amount = obj.amount;
      if (type === 'p') {
        this.VatPercentage = `(${obj.rate}%)`;
      }
      return `${amount.toFixed(2)}`;
    }
  }

  isNotEmpty = obj => Object.keys(obj).length > 0;

  // loadDiscount() {
  //   this.planOb['plans'].forEach(plan => {
  //     plan.discounts.forEach(item => {
  //       let group = this.discounts[item.description] || [];
  //       if (group.length == 0) this.discounts[item.description] = [];
  //       this.discounts[item.description].push({
  //         planId: plan.planDetails[0].planId,
  //         id: item.id,
  //         ratePer: item.ratePer,
  //         rate: item.rate,
  //         amount: item.amount
  //       });
  //     });
  //   });
  // }

  initLoading() {
    this.planOb['plans'].forEach(plan => {
      plan.loading.forEach(item => {
        let group = this.discounts[item.description] || [];
        let pgroup = this.promoDiscounts['Promotional Discount'] || [];
        if (group.length == 0) this.discounts[item.description] = [];
        if (pgroup.length == 0) this.promoDiscounts['Promotional Discount'] = [];
        this.promoDiscounts['Promotional Discount'].push({
          planId: plan.planDetails[0].planId,
          amount: 0
        })
        if (item.type === 'DI') {
          this.discounts[item.description].push({
            planId: plan.planDetails[0].planId,
            id: item.id,
            ratePer: item.ratePer,
            rate: item.rate,
            amount: item.amount
          });
        } else {
          this.loadings[item.description].push({
            planId: plan.planDetails[0].planId,
            id: item.id,
            ratePer: item.ratePer,
            rate: item.rate,
            amount: item.amount
          });
        }
      });
    });
  }

  onTabChanged(event) {
    this.isPlanSelected = true;
    this.selectedPlan['planId'] = this.planOb['plans'][event.index].planDetails[0].planId;
    this.selectedPlanAmount = this.planOb['plans'][event.index].planDetails[0].grossPremium
    this.planOb['plans'].filter((plan) => {
      if (plan.planDetails[0].planId === this.selectedPlan['planId']) {
        plan.confirmed = true;
      } else {
        plan.confirmed = false;
      }
    });
  }

  onBlurMethod(field) {
    let x: any = (<HTMLInputElement>document.getElementById(field));
    let code = x.value;
    if (!code) {
      return
    }
    this.spinner.show();
    this.coreService.postInputs1(`discount/${this.planOb['quoteId']}/${code}`, '').subscribe((response) => {
      this.spinner.hide();
      if (response) {
        response = JSON.parse(response);
        x.disabled = true;
        this.addPromoDiscount(response)
      }
    }, err => {
      this.spinner.hide();
      x.value = '';
      this.toastr.error('', 'Discount code is not valid', {
        timeOut: 3000
      })
    })
  }


  addPromoDiscount(response) {
    this.charges['Premium VAT'].forEach((element, index) => {
      element.amount = parseFloat(response.plans[index].vat)
    });
    this.planOb['plans'].filter((plan, index) => {
      if (plan.planDetails[0].planId === response.plans[index].planId) {
        plan.planDetails[0]['grossPremium'] = response.plans[0].grossPremium;
        plan.planDetails[0]['premiumWithVAT'] = parseFloat(response.plans[index].vat) + parseFloat(response.plans[0]['grossPremium']);
        plan.applyPromoDiscount = true;
        this.promoDiscounts['Promotional Discount'].forEach((item, index) => {
          if (item.planId === response.plans[index].planId) {
            item.amount = response.plans[index].loading[1].amount
          }
        });
      }
    });
    this.showPromoDiscount = true;
  }

  removePromoDiscount(id) {
    this.showPromoDiscount = false;
    let x = (<HTMLInputElement>document.getElementById(id));
    let code = x.value;
    x.value = '';
    x.disabled = false;
    this.spinner.show();
    this.coreService.deleteInputs(`discount/${this.planOb['quoteId']}/${code}`, '').subscribe((response) => {
      this.spinner.hide();
      if (response) {
        this.charges['Premium VAT'].forEach((element, index) => {
          element.amount = parseFloat(response.plans[index].vat)
        });
        this.planOb['plans'].filter((plan, index) => {
          if (plan.planDetails[0].planId === response.plans[index].planId) {
            plan.planDetails[0]['grossPremium'] = response.plans[0].grossPremium;
            plan.planDetails[0]['premiumWithVAT'] = parseFloat(response.plans[index].vat) + parseFloat(response.plans[0]['grossPremium']);
            plan.applyPromoDiscount = true;
            this.promoDiscounts['Promotional Discount'].forEach((item, index) => {
              if (item.planId === response.plans[index].planId) {
                item.amount = response.plans[index].loading[1].amount
              }
            });
          }
        });
      }
    }, err => {
      this.spinner.hide();
    })
  }
}
