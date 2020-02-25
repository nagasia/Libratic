import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TvSearchDialogComponent } from './tvSearchDialog.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { TvListDialogModule } from '../tvList/tvListDialog.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TvListDialogComponent } from '../tvList/tvListDialog.component';

@NgModule({
    imports: [
        CommonModule,
        CommonMaterialModules,
        TvListDialogModule,
        ReactiveFormsModule
    ],
    declarations: [TvSearchDialogComponent],
    entryComponents: [TvListDialogComponent]
})
export class TvSearchDialogModule { }
