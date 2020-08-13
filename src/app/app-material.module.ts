import { LayoutModule } from '@angular/cdk/layout';
import {
    MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule,
    MatListModule, MatRadioModule, MatSliderModule, MatTooltipModule
} from '@angular/material';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule, MatBadgeModule, MatSelectModule, MatInputModule, MatMenuModule, MatExpansionModule, MatChipsModule, MatButtonToggleModule, DateAdapter } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FlexLayoutModule } from "@angular/flex-layout";
@NgModule({
    imports: [
        CommonModule,
        LayoutModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCardModule,
        MatNativeDateModule,
        MatInputModule,
        MatMenuModule,
        MatExpansionModule,
        MatChipsModule,
        MatButtonToggleModule,
        MatGridListModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatSortModule,
        MatCheckboxModule,
        MatStepperModule,
        MatSelectModule,
        MatDatepickerModule,
        MatRadioModule,
        MatBadgeModule,
        MatTabsModule,
        MatAutocompleteModule,
        MatTooltipModule,
        FlexLayoutModule
      
    ],
    exports: [
        CommonModule,
        LayoutModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCardModule,
        MatNativeDateModule,
        MatInputModule,
        MatMenuModule,
        MatExpansionModule,
        MatChipsModule,
        MatButtonToggleModule,
        MatGridListModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatSortModule,
        MatCheckboxModule,
        MatStepperModule,
        MatSelectModule,
        MatDatepickerModule,
        MatRadioModule,
        MatBadgeModule,
        MatTabsModule,
        MatSliderModule,
        MatAutocompleteModule,
        MatTooltipModule,
        FlexLayoutModule
    ],
})
export class AppMaterialModule { }