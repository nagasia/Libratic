import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginDialogComponent } from './dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonMaterialModules } from '../../../common/commonMaterialModules';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [LoginDialogComponent],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        CommonMaterialModules
    ],
})
export class LoginDialogModule { }
