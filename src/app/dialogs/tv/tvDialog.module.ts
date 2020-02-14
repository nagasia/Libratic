import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TvDialogComponent } from './tvDialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { TvListDialogModule } from '../tvList/tvListDialog.module';
import { TvListDialogComponent } from '../tvList/tvListDialog.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CommonMaterialModules,
        TvListDialogModule
    ],
    declarations: [TvDialogComponent],
    entryComponents: [TvListDialogComponent]
})
export class TvDialogModule { }
