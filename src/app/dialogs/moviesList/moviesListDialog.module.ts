import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviesListDialogComponent } from './moviesListDialog.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [
        CommonModule,
        CommonMaterialModules,
        HttpClientModule
    ],
    declarations: [MoviesListDialogComponent]
})
export class MoviesListDialogModule { }
