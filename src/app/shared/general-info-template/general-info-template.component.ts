import { Component, OnInit, Input } from '@angular/core';
import { AppService } from 'src/app/core/services/app.service';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';

@Component({
  selector: 'app-general-info-template',
  templateUrl: './general-info-template.component.html',
  styleUrls: ['./general-info-template.component.scss']
})
export class GeneralInfoTemplateComponent implements OnInit {
  public language: any;
  @Input()
  public generalDetails;
  public generalInfo;
  constructor(public runtimeConfigService: RuntimeConfigService) { }

  ngOnInit() {
    this.language = localStorage.getItem("language");
  }

  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }
  ngOnChanges() {
    if (this.generalDetails != undefined) {
      this.generalInfo = this.generalDetails;
    }
  }
}
