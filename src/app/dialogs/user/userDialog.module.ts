import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDialogComponent } from './userDialog.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CommonMaterialModules
    ],
    declarations: [UserDialogComponent]
})
export class UserDialogModule { }
