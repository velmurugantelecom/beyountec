import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validator,FormControl } from '@angular/forms'
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class PolicyExpDateValidator {
  constructor(
    private runtimeConfigService: RuntimeConfigService) {}
    PolicyExpDateValidator(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        if (control.value != '') {
          const givenDate = new Date(control.value);
          const date = givenDate.getDate();
          const month = givenDate.getMonth();
          const year = givenDate.getFullYear();
          const momentDate = moment({ year: year, month: month, day: date }).startOf('day');
          const now = moment().startOf('day');
          const yearsDiff = momentDate.diff(now, 'days');
          if (yearsDiff < 0) {
            return { younger: true };
          } else if (yearsDiff > this.runtimeConfigService.config.PrevPolExpiryDate) {
            return { moreThan60Days: true };
          } else {
            return null;
          }
        }
      }
    }
}
