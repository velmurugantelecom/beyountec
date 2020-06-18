import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../app-material.module';
import { DecimalPipe } from '@angular/common';

import { AlphaNumericDirective } from './directives/alphanumeric.directive';
import { NumbersDirective } from './directives/numbers-only.directive';
import { UppercaseDirective } from './directives/upperCase.directive';
import { FormInvalidDirective } from './directives/invalidfocus.directive';
import { CustomClassDirective } from './directives/customClass.directive'
import { AlphabetsOnlyDirective } from './directives/alphabets.directive';
import { DateFormatPipe } from './pipes/customdate.pipe';
import { DecimalValuePipe } from './pipes/decimalPipe.pipe';
import { AutoDateFormatDirective } from './directives/dateAutoFormat.directive';
@NgModule({
    declarations: [
        AlphaNumericDirective,
        NumbersDirective,
        UppercaseDirective,
        FormInvalidDirective,
        AlphabetsOnlyDirective,
        CustomClassDirective,
        DateFormatPipe,
        DecimalValuePipe,
        AutoDateFormatDirective
    ],
    imports: [
        CommonModule,
        AppMaterialModule,
    ],
    exports: [
        AlphaNumericDirective,
        NumbersDirective,
        UppercaseDirective,
        FormInvalidDirective,
        AlphabetsOnlyDirective,
        CustomClassDirective,
        DateFormatPipe,
        DecimalValuePipe,
        AutoDateFormatDirective
    ],
    providers: [DecimalPipe],
})
export class CoreModule { }
