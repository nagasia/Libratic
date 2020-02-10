import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookDialogComponent } from './bookDialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonMaterialModules } from '../../common/commonMaterialModules';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CommonMaterialModules
    ],
    declarations: [BookDialogComponent]
})
export class BookDialogModule { }
