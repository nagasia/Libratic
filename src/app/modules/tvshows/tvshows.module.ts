import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TvshowsComponent } from './tvshows.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { TvDialogModule } from 'src/app/dialogs/tv/tvDialog.module';
import { TvDialogComponent } from '../../dialogs/tv/tvDialog.component';
import { CommonFunctions } from '../../common/commonFunctions';



@NgModule({
    declarations: [TvshowsComponent],
    imports: [
        CommonModule,
        CommonMaterialModules,
        TvDialogModule
    ],
    entryComponents: [TvDialogComponent],
    providers: [CommonFunctions]
})
export class TvshowsModule { }
