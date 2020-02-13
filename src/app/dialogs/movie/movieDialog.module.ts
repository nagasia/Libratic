import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieDialogComponent } from './movieDialog.component';
import { CommonMaterialModules } from 'src/app/common/commonMaterialModules';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MoviesListDialogModule } from '../moviesList/moviesListDialog.module';
import { MoviesListDialogComponent } from '../moviesList/moviesListDialog.component';

@NgModule({
    imports: [
        CommonModule,
        CommonMaterialModules,
        ReactiveFormsModule,
        HttpClientModule,
        MoviesListDialogModule
    ],
    declarations: [MovieDialogComponent],
    entryComponents: [MoviesListDialogComponent]
})
export class MovieDialogModule { }
