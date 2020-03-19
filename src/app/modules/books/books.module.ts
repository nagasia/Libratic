import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksComponent } from './books.component';
import { BookDialogComponent } from '../../dialogs/book/bookDialog.component';
import { BookDialogModule } from '../../dialogs/book/bookDialog.module';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { HttpClientModule } from '@angular/common/http';
import { CommonFunctions } from '../../common/commonFunctions';
import { FilterDialogModule } from '../../dialogs/filter/filterDialog.module';
import { FilterDialogComponent } from '../../dialogs/filter/filterDialog.component';

@NgModule({
    declarations: [BooksComponent],
    imports: [
        CommonModule,
        CommonMaterialModules,
        BookDialogModule,
        FilterDialogModule,
        HttpClientModule
    ],
    entryComponents: [
        BookDialogComponent,
        FilterDialogComponent
    ],
    providers: [CommonFunctions]
})
export class BooksModule { }
