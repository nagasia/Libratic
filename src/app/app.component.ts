import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AuthenticationService } from './services/authentication.service';
import { LoginDialogComponent } from './dialogs/login/loginDialog.component';
import { LibraryDialogComponent } from './dialogs/library/libraryDialog.component';
import { UserDialogComponent } from './dialogs/user/userDialog.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy {
    isLoged: boolean;
    isAdmin: boolean;
    libraryDialog$;
    loginDialog$;
    userDialog$;


    constructor(private dialog: MatDialog,
        private authService: AuthenticationService) {
        this.isLoged = false;
        this.isAdmin = false;
    }

    newLibrary() {
        this.libraryDialog$ = this.dialog.open(LibraryDialogComponent);

        this.libraryDialog$.afterClosed().subscribe(result => {
            if (this.authService.authUser) {
                this.isLoged = true;

                if (this.authService.authUser.userLevel === 'admin') {
                    this.isAdmin = true;
                }
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
                this.isLoged = true;

                if (this.authService.authUser.userLevel === 'admin') {
                    this.isAdmin = true;
                }
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
    }
}
