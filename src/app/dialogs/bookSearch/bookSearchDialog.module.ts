import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookSearchDialogComponent } from './bookSearchDialog.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { ReactiveFormsModule } from '@angular/forms';
import { BookListDialogModule } from '../bookList/bookListDialog.module';
import { BookListDialogComponent } from '../bookList/bookListDialog.component';

@NgModule({
    imports: [
        CommonModule,
        CommonMaterialModules,
        ReactiveFormsModule,
        BookListDialogModule
    ],
    declarations: [BookSearchDialogComponent],
    entryComponents: [BookListDialogComponent]
})
export class BookSearchDialogModule { }
