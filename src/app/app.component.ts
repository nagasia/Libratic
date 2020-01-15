import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { LoginDialogComponent } from './modules/login/dialog/dialog.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {
    isLoged: boolean;
    userType: string;
    authUser;

    constructor(private dialog: MatDialog) {
        this.isLoged = false;
        this.userType = 'admin';
    }

    logIn() {
        const dialogRef = this.dialog.open(LoginDialogComponent, {
            width: '250px',
        });

        dialogRef.afterClosed().subscribe(result => {
            this.authUser = result;
        });
    }

    logOut() {
        //this.authService.logout();
        this.isLoged = false;
    }
}
