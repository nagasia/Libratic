import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishedComponent } from './wished.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { CommonFunctions } from '../../common/commonFunctions';
import { BookSearchDialogModule } from '../../dialogs/bookSearch/bookSearchDialog.module';
import { MovieSearchDialogModule } from '../../dialogs/movieSearch/movieSearchDialog.module';
import { TvSearchDialogModule } from '../../dialogs/tvSearch/tvSearchDialog.module';
import { BookSearchDialogComponent } from '../../dialogs/bookSearch/bookSearchDialog.component';
import { TvSearchDialogComponent } from '../../dialogs/tvSearch/tvSearchDialog.component';
import { MovieSearchDialogComponent } from '../../dialogs/movieSearch/movieSearchDialog.component';

@NgModule({
    imports: [
        CommonModule,
        CommonMaterialModules,
        BookSearchDialogModule,
        MovieSearchDialogModule,
        TvSearchDialogModule
    ],
    declarations: [WishedComponent],
    providers: [CommonFunctions],
    entryComponents: [
        BookSearchDialogComponent,
        MovieSearchDialogComponent,
        TvSearchDialogComponent
    ]
})
export class WishedModule { }
