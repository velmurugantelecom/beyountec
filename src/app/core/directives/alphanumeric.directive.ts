import { Directive, Input, HostListener } from '@angular/core';

@Directive({
    selector: '[AlphaNumericOnly]',
    inputs: ['AlphaNumericOnly']
})
export class AlphaNumericDirective {
    @Input() AlphaNumericOnly;
    @HostListener('keypress', ['$event']) Number(e) {
        const keyCode = (e.charCode) ? e.charCode : ((e.which) ? e.which : e.keyCode);
        const symbols = ['\~', '\!', '\@', '\#', '\$', '\%', '\^', '\&', '\*',
            '\(', '\)', '\_', '\+', '\-', '\=', '\`', '\{', '\}', '\[', '\]', '\;',
            '\:', '\'', '\,', '\.', '\/', '\?', '\"', '\<', '\>', '\|', '\\',
            'Decimal', 'Multiply', 'Add', 'Del', 'Clear', 'Divide', 'Subtract', 'Separator'];
        // check key index
        const isSymbol = e.key && symbols.indexOf(e.key) >= 0 ? true : false;
        // Home key code to 35 to 37
        // 8 backspace and 9 tab.
        // 64 to 91 capital letters
        // 96 to 123 small lettes
        if (this.AlphaNumericOnly == true) {
            if ((e.code !== 'Minus' && !isSymbol)) {
                if ((keyCode > 64 && keyCode < 91) || keyCode === 8 || keyCode === 32 || (keyCode > 96 && keyCode < 123) || (keyCode >= 35 && keyCode <= 57)) {
                    return true;
                }
            }
        } else {
            return true;
        }

        e.preventDefault();
    }
    constructor() { }

}
