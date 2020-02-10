import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavouritesComponent } from './favourites.component';
import { CommonMaterialModules } from 'src/app/common/commonMaterialModules';

@NgModule({
    imports: [
        CommonModule,
        CommonMaterialModules
    ],
    declarations: [FavouritesComponent]
})
export class FavouritesModule { }
