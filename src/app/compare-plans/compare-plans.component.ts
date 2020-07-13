import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../core/services/app.service';
import { CoreService } from '../core/services/core.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

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
  public loadings: any = {};
  public charges: any = {};
  public excess: any = {};
  public VatPercentage = '';
  selectAlert: any;
  ratingError: any;
  constructor(private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private appService: AppService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private toastr: ToastrService) {
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
    this.planOb = history.state.response;
    // to test hard coded data
    // this.planOb = 
    if (this.planOb) {
      this.loadVATandPremium();
      this.loadCovers();
      this.initLoading();
      this.loadExcess();
      console.log(this.discounts)
      this.isPlanAvailable = true;
    }
    else {
      this.isPlanAvailable = false;
    }
  }

  loadCovers() {
    this.planOb['plans'].forEach((plan, index) => {
      plan['bgColor'] = index;
      if (plan.confirmed) {
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
        // this.changeChargeAmount(plan.planDetails[0].planId);
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

  // goBack() {
  //   if (!this.planOb) {
  //     this.router.navigate(['/motor-info']);
  //     return
  //   }
  //   this.router.navigate(['/motor-info'],
  //     {
  //       queryParams: {
  //         quoteNo: this.planOb['quoteNo'],
  //         reviseDetails: true
  //       }
  //     });
  // }

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
        if (group.length == 0) this.discounts[item.description] = [];
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
}
