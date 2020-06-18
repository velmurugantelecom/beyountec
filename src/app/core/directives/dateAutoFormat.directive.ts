import { Directive, HostListener, ElementRef } from '@angular/core';
import * as moment from 'moment';

@Directive({
    selector: '[AutoDateFormat]'
})

export class AutoDateFormatDirective {

    constructor(private el: ElementRef) {

    }
    @HostListener('blur', ['$event']) 
    onBlur() {
        const inputValue = this.el.nativeElement.value;
        if (inputValue !== '') {
            this.formatDate(inputValue);
          }
    }

    formatDate(value: string) {
        const momentDate = moment(value, ['DDMMYYYY', 'D MMMM YYYY'], 'fr-FR'); 
        const formatedValue = momentDate.isValid() ? momentDate.format('DD/MM/YYYY') : value;
        this.el.nativeElement.value = formatedValue;
      }
}
