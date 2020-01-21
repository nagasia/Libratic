import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AuthenticationService } from './services/authentication.service';
import { LoginDialogComponent } from './dialogs/login/loginDialog.component';
import { LibraryDialogComponent } from './dialogs/library/libraryDialog.component';
import { User } from './common/dto/user.dto';
import { FireDBService } from './services/fireDB.service';
import { UserDialogComponent } from './dialogs/user/userDialog.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy {
    isLoged: boolean;
    userType: string;
    authUser;
    libraryDialog$;
    loginDialog$;
    userDialog$;
    user$;

    constructor(private dialog: MatDialog,
        private authService: AuthenticationService,
        private db: FireDBService) {
        this.isLoged = false;
    }

    newLibrary() {
        this.libraryDialog$ = this.dialog.open(LibraryDialogComponent);

        this.libraryDialog$.afterClosed().subscribe(result => {
            if (result) {
                this.authUser = result;
                this.isLoged = true;
                this.userType = 'admin';
            }
        }, error => console.log(error));
    }

    newUser() {
        this.userDialog$ = this.dialog.open(UserDialogComponent);
    }

    logIn() {
        this.loginDialog$ = this.dialog.open(LoginDialogComponent);

        this.loginDialog$.afterClosed().subscribe(result => {
            if (result) {
                this.authUser = result;
                const id = result.uid;

                this.user$ = this.db.getOne('users/' + id)
                    .subscribe((user: User) => {
                        if (user) {
                            this.isLoged = true;
                            this.userType = user.userType;
                        }
                    }, error => console.log(error));
            }
        });
    }

    logOut() {
        this.authService.logout();
        this.isLoged = false;
    }

    ngOnDestroy() {
        if (this.libraryDialog$) {
            this.libraryDialog$.unsubscribe();
        }
        if (this.loginDialog$) {
            this.loginDialog$.unsubscribe();
        }
        if (this.user$) {
            this.user$.unsubscribe();
        }
    }
}
