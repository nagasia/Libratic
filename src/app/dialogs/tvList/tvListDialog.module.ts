import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TvListDialogComponent } from './tvListDialog.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [
        CommonModule,
        CommonMaterialModules,
        HttpClientModule
    ],
    declarations: [TvListDialogComponent]
})
export class TvListDialogModule { }
