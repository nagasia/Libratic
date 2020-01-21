import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonMaterialModules } from './common/commonMaterialModules';
import { environment } from '../environments/environment';
import { UsersModule } from './modules/users/users.module';
import { BooksModule } from './modules/books/books.module';
import { LendingsModule } from './modules/lendings/lendings.module';
import { MoviesModule } from './modules/movies/movies.module';
import { TvshowsModule } from './modules/tvshows/tvshows.module';
import { FavouritesModule } from './modules/favourites/favourites.module';
import { LoginDialogModule } from './dialogs/login/loginDialog.module';
import { LoginDialogComponent } from './dialogs/login/loginDialog.component';
import { LibraryDialogModule } from './dialogs/library/libraryDialog.module';
import { LibraryDialogComponent } from './dialogs/library/libraryDialog.component';
import { UserDialogModule } from './dialogs/user/userDialog.module';
import { UserDialogComponent } from './dialogs/user/userDialog.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        CommonMaterialModules,
        UsersModule,
        BooksModule,
        LendingsModule,
        MoviesModule,
        TvshowsModule,
        FavouritesModule,
        LoginDialogModule,
        LibraryDialogModule,
        UserDialogModule,
        AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        AngularFireDatabaseModule
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        LoginDialogComponent,
        LibraryDialogComponent,
        UserDialogComponent,
    ]
})
export class AppModule { }
