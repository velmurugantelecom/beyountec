import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
    selector: '[AlphabetOnly]'
})

export class AlphabetsOnlyDirective {
    key;
    @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
        this.key = event.keyCode;
        if ((this.key >= 15 && this.key <= 64) || (this.key >= 123) || (this.key >= 96 && this.key <= 105)) {
            if (this.key != 32) {
                event.preventDefault();
            }
        }
    }
}
