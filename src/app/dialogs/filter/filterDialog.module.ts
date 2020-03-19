import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterDialogComponent } from './filterDialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonMaterialModules } from '../../common/commonMaterialModules';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CommonMaterialModules
    ],
    declarations: [FilterDialogComponent]
})
export class FilterDialogModule { }
