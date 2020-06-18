import { Directive, HostListener, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup } from '@angular/forms';

@Directive({
  selector: '[CustomClass]'
})
export class CustomClassDirective {

  constructor(private el: ElementRef) {
  }


}