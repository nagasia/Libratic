import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonMaterialModules } from './common/commonMaterialModules';
import { environment } from '../environments/environment';
import { LoginDialogComponent } from './modules/login/dialog/dialog.component';
import { LoginDialogModule } from './modules/login/dialog/dialog.module';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        LoginDialogModule,
        BrowserAnimationsModule,
        CommonMaterialModules,
        AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule
    ],
    bootstrap: [AppComponent],
    entryComponents: [LoginDialogComponent]
})
export class AppModule { }
