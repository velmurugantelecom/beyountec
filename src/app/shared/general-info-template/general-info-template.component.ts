import { Component, OnInit, Input } from '@angular/core';
import { AppService } from 'src/app/core/services/app.service';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';

@Component({
  selector: 'app-general-info-template',
  templateUrl: './general-info-template.component.html',
  styleUrls: ['./general-info-template.component.scss']
})
export class GeneralInfoTemplateComponent implements OnInit {
  @Input()
  public generalDetails;
  public generalInfo;
  constructor(public runtimeConfigService: RuntimeConfigService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.generalDetails != undefined) {
      this.generalInfo = this.generalDetails;
    }
  }
}
