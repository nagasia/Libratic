import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { CommonMaterialModules } from '../../common/commonMaterialModules';
import { UserDialogComponent } from '../../dialogs/user/userDialog.component';
import { UserDialogModule } from '../../dialogs/user/userDialog.module';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
    declarations: [UsersComponent],
    imports: [
        CommonModule,
        CommonMaterialModules,
        UserDialogModule,
        ReactiveFormsModule
    ],
    entryComponents: [UserDialogComponent]
})
export class UsersModule { }
