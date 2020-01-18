import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryDialogComponent } from './libraryDialog.component';
import { CommonMaterialModules } from 'src/app/common/commonMaterialModules';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [LibraryDialogComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CommonMaterialModules
    ],
})
export class LibraryDialogModule { }
