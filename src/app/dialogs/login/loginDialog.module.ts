import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginDialogComponent } from './loginDialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonMaterialModules } from '../../common/commonMaterialModules';

@NgModule({
    declarations: [LoginDialogComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CommonMaterialModules
    ],
})
export class LoginDialogModule { }
