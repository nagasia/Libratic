import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSearchDialogComponent } from './movieSearchDialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { MoviesListDialogComponent } from '../moviesList/moviesListDialog.component';
import { MoviesListDialogModule } from '../moviesList/moviesListDialog.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CommonMaterialModules,
        MoviesListDialogModule
    ],
    declarations: [MovieSearchDialogComponent],
    entryComponents: [MoviesListDialogComponent]
})
export class MovieSearchDialogModule { }
