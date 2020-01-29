import { Component, OnDestroy } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AuthenticationService } from './services/authentication.service';
import { LoginDialogComponent } from './dialogs/login/loginDialog.component';
import { LibraryDialogComponent } from './dialogs/library/libraryDialog.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy {
    isLoged: boolean;
    isAdmin: boolean;
    libraryDialog$;
    loginDialog$;

    constructor(private dialog: MatDialog,
        private authService: AuthenticationService,
        private router: Router,
        private snackBar: MatSnackBar) {
        this.isLoged = false;
        this.isAdmin = false;

        if (!this.isLoged) {
            this.router.navigate(['/']);
        }
    }

    newLibrary() {
        this.libraryDialog$ = this.dialog.open(LibraryDialogComponent, {
            width: '40%',
        });

        this.libraryDialog$.afterClosed().subscribe(result => {
            if (result) {
                if (result.library) {
                    this.snackBar.open(result.motive, '', { duration: 2000 });
                    this.authenticate();
                } else {
                    this.snackBar.open(result, '', { duration: 2000 });
                }
            }
        },
            error => console.log(error));
    }

    editLibrary() {
        this.libraryDialog$ = this.dialog.open(LibraryDialogComponent, {
            width: '40%',
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
                } else {
                    this.snackBar.open(result, '', { duration: 2000 });
                }
            }
        },
            error => console.log(error));
    }

    private authenticate() {
        if (this.authService.authUser) {
            this.isLoged = true;

            if (this.authService.authUser.userLevel === 'admin') {
                this.isAdmin = true;
            }

            this.router.navigate(['books']);
        }
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
        this.authService.logout();
    }
}
