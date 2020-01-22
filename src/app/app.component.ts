import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AuthenticationService } from './services/authentication.service';
import { LoginDialogComponent } from './dialogs/login/loginDialog.component';
import { LibraryDialogComponent } from './dialogs/library/libraryDialog.component';
import { User } from './common/dto/user.dto';
import { FireDBService } from './services/fireDB.service';
import { UserDialogComponent } from './dialogs/user/userDialog.component';
import { Library } from './common/dto/library.dto';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy {
    isLoged: boolean;
    isAdmin: boolean;
    authUser: User;
    authLibrary: Library;
    libraryDialog$;
    loginDialog$;
    userDialog$;
    library$;

    constructor(private dialog: MatDialog,
        private authService: AuthenticationService,
        private db: FireDBService) {
        this.isLoged = false;
        this.isAdmin = false;
    }

    newLibrary() {
        this.libraryDialog$ = this.dialog.open(LibraryDialogComponent);

        this.libraryDialog$.afterClosed().subscribe(result => {
            this.authUser = this.authService.authUser;
            this.authLibrary = this.authService.authLibrary;

            if (this.authUser.userLevel === 'admin') {
                this.isAdmin = true;
            }
        }, error => console.log(error));
    }

    newUser() {
        this.userDialog$ = this.dialog.open(UserDialogComponent);
    }

    logIn() {
        this.loginDialog$ = this.dialog.open(LoginDialogComponent);

        this.loginDialog$.afterClosed().subscribe(result => {
            if (this.authService.authUser) {
                this.authUser = this.authService.authUser;

                this.library$ = this.db.getOne('libraries/' + this.authUser.libraryID)
                    .subscribe((library: Library) => this.authLibrary = library,
                        error => console.log(error));

                if (this.authUser.userLevel === 'admin') {
                    this.isAdmin = true;
                }
                this.isLoged = true;
            }
        });
    }

    logOut() {
        this.authService.logout();
        this.isLoged = false;
        this.isAdmin = false;
    }

    ngOnDestroy() {
        if (this.libraryDialog$) {
            this.libraryDialog$.unsubscribe();
        }
        if (this.loginDialog$) {
            this.loginDialog$.unsubscribe();
        }
        if (this.library$) {
            this.library$.unsubscribe();
        }
    }
}
