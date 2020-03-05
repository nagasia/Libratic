import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LendingsComponent } from './lendings.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { LendingDialogModule } from '../../dialogs/lending/lendingDialog.module';
import { LendingDialogComponent } from '../../dialogs/lending/lendingDialog.component';
import { CommonFunctions } from '../../common/commonFunctions';



@NgModule({
    declarations: [LendingsComponent],
    imports: [
        CommonModule,
        CommonMaterialModules,
        LendingDialogModule
    ],
    entryComponents: [LendingDialogComponent],
    providers: [CommonFunctions]
})
export class LendingsModule { }
