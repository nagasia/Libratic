import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LendingDialogComponent } from './lendingDialog.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        CommonMaterialModules,
        ReactiveFormsModule
    ],
    declarations: [LendingDialogComponent]
})
export class LendingDialogModule { }
