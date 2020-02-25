import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookListDialogComponent } from './bookListDialog.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [
        CommonModule,
        CommonMaterialModules,
        HttpClientModule
    ],
    declarations: [BookListDialogComponent]
})
export class BookListDialogModule { }
