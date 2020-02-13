import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviesComponent } from './movies.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { MovieDialogComponent } from '../../dialogs/movie/movieDialog.component';
import { MovieDialogModule } from '../../dialogs/movie/movieDialog.module';
import { CommonFunctions } from '../../common/commonFunctions';

@NgModule({
    declarations: [MoviesComponent],
    imports: [
        CommonModule,
        CommonMaterialModules,
        MovieDialogModule
    ],
    entryComponents: [MovieDialogComponent],
    providers: [CommonFunctions]
})
export class MoviesModule { }
