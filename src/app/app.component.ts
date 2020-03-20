import { Component, OnDestroy } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AuthenticationService } from './services/authentication.service';
import { LoginDialogComponent } from './dialogs/login/loginDialog.component';
import { LibraryDialogComponent } from './dialogs/library/libraryDialog.component';
import { Router } from '@angular/router';
import { CommonFunctions } from './common/commonFunctions';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy {
    isLoged = false;
    isAdmin = false;
    libraryDialog$;
    loginDialog$;

    constructor(private dialog: MatDialog,
        private authService: AuthenticationService,
        private router: Router,
        private snackBar: MatSnackBar,
        private functions: CommonFunctions) {
        this.authenticate();

        if (!this.isLoged) {
            this.router.navigate(['']);
        }
    }

    newLibrary() {
        this.libraryDialog$ = this.dialog.open(LibraryDialogComponent);

        this.libraryDialog$.afterClosed().subscribe(result => {
            if (result) {
                if (result.done) {
                    this.snackBar.open(result.motive, '', { duration: 2000 });
                    this.authenticate();
                    this.router.navigate(['books']);
                } else {
                    this.snackBar.open(result, '', { duration: 2000 });
                }
            }
        },
            error => console.log(error));
    }

    editLibrary() {
        this.libraryDialog$ = this.dialog.open(LibraryDialogComponent, {
            data: true,
        });

        this.libraryDialog$.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    logIn() {
        this.loginDialog$ = this.dialog.open(LoginDialogComponent);

        this.loginDialog$.afterClosed().subscribe(result => {
            if (result) {
                if (result.user) {
                    this.snackBar.open(result.motive, '', { duration: 2000 });
                    this.authenticate();
                    this.router.navigate(['books']);
                } else {
                    this.snackBar.open(result, '', { duration: 2000 });
                }
            }
        },
            error => console.log(error));
    }

    private authenticate() {
        this.isLoged = this.functions.isLoged(this.authService.authUser);
        if (this.isLoged) {
            this.isAdmin = this.functions.isAdmin(this.authService.authUser);
        }
    }

    logOut() {
        this.authService.logout();
        this.isLoged = false;
        this.isAdmin = false;
        this.router.navigate(['']);
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
