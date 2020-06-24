import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-motorinfo1',
  templateUrl: './motorinfo1.component.html',
  styleUrls: ['./motorinfo1.component.scss']
})
export class Motorinfo1Component implements OnInit {
  vehicleForm: FormGroup;
  insuredForm: FormGroup;
  public options: any = {};

  items = [];
  gridDetail: any;
  selected;
  showgrid = false;
  showInfo: any = false;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.vehicleForm = this.formBuilder.group({
      chassisNo: ['24324324324', [Validators.required]],
      makeId: ['', [Validators.required]],
      modelId: ['', [Validators.required]],
      // vehicleTypeId: ['', [Validators.required]],
      ncdYears: ['', []],
      vehicleValue: ['', [Validators.required]],
      // to set usage type PRIVATE as default
      usage: ['1001', [Validators.required]],
      registeredAt: ['', [Validators.required]],
      repairType: ['', [Validators.required]],
      noOfPassengers: ['', [Validators.required]],
      makeYear: ['', [Validators.required]],
      regStatus: ['', Validators.required],
      trim: ['', Validators.required],
      tcFileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      prevPolicyExpDate: ['', []],
      branchId: ['', []],
      colorId: ['', []],
      noOfDoors: ['', []],
      mortgagedYN: ['', []],
      registrationMark: ['', []],
      regNo: ['', []],
      bankName: ['', []],
      licenseissueDate: ['', [Validators.required]]
    });

    this.insuredForm = this.formBuilder.group({
      fullName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      gender: ['', [Validators.required]],

      prefix: ['', [Validators.required]],
    });

    this.options.make = [
      {label: "AUDI", value: "167"}
    ]
    this.items = this.options.make;
    this.options.model = [
      { "label": "A3", "value": "16713101" },
      { "label": "A4", "value": "16713101" },
      { "label": "A5", "value": "16713101" },
      { "label": "A6", "value": "16713101" },
      { "label": "Q5", "value": "16713101" },
      { "label": "R8", "value": "16713101" },
      { "label": "Spyder", "value": "16713101" },
      { "label": "S3", "value": "16713101" },
      { "label": "S6", "value": "16713101" },
      { "label": "S8", "value": "16713101" },
      { "label": "S5", "value": "16713101" },
    ]

    this.options.regYear = [{ "label": "2020", "value": "2020" }, { "label": "2019", "value": "2019" },
    { "label": "2018", "value": "2018" }, { "label": "2017", "value": "2017" }
      , { "label": "2016", "value": "2016" }, { "label": "2015", "value": "2015" }]

    this.options.trim = [{ "label": "STD", "value": "LS" },
    { "label": "QUATTRO", "value": "LT1" },
    { "label": "S-Line", "value": "LTZ" }];

    this.options.type = [{ "label": "SALOON 4 CYLINDER", "value": "1001" }, { "label": "SALOON 6 CYLINDER", "value": "1002" }];

    this.options.usageType = [{ "label": "PRIVATE", "value": "1001" }, { "label": "PASENGER TRANSPORT", "value": "1000" },
    { "label": "TAXI", "value": "1002" }, { "label": "RENT A CAR (SPCL EXCESS)", "value": "1007" },
    { "label": "RENT A CAR", "value": "1004" }, { "label": "DRIVING SCHOOL", "value": "1005" },
    { "label": "TEST NUMBER PLATE", "value": "1006" }, { "label": "COMMERCIAL", "value": "1003" }]
    this.options.repairType = [{ "label": "Inside Agency", "value": "1" }, { "label": "Outside Agency", "value": "2" }, { "label": "Others", "value": "3" }];
    this.options.registeredAt = [{ "label": "Abudhabi", "value": "1101" }, { "label": "Fujairah", "value": "1106" },
    { "label": "Ajman", "value": "1104" }, { "label": "RAS AL KHAIMAH", "value": "1107" },
    { "label": "Sharjah", "value": "1103" }, { "label": "UMM AL QUWAIN", "value": "1105" },
    { "label": "Dubai", "value": "1102" }];
    this.options.regStatus = [{ label: "New", value: "N" }, { label: "Renewal", value: "03" }]
    this.options.ncdYears = [{ label: "0", value: "0" }
      , { label: "1", value: "1" }
      , { label: "2", value: "2" }
      , { label: "3", value: "3" }
      , { label: "4", value: "4" }
      , { label: "5", value: "5" }
      , { label: "6", value: "6" }
      , { label: "7", value: "7" }
      , { label: "8", value: "8" }
      , { label: "9", value: "9" }]
    this.options.gender = [{ "label": "Male", "value": "M" }, { "label": "Female", "value": "F" }]

    this.options.prefix = [{ label: "Mr", value: "Mr" },{ label: "Ms", value: "Ms" },{ label: "Mrs", value: "Mrs" }]

  }

  reset() {
    console.log("check here");
    this.showgrid = false;
    this.showInfo = false;
    this.selected = [];
    this.items = this.options.make;
  }
  onchangeLoadDropdown() {
    this.showInfo = false;
    if (this.selected.length == 1) {
      this.items = this.options.model
    } else if (this.selected.length == 2) {
      this.items = this.options.regYear
    }
    else if (this.selected.length == 3) {
      this.showgrid = true;
      this.gridDetail = this.selected;
      console.log(this.gridDetail);
    }
  }
  submitgrid(trimvalue: ElementRef) {
    this.showInfo = true;
  }

}