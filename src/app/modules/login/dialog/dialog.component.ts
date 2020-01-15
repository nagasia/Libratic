import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AuthenticationService } from '../authentication.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-login-dialog',
    templateUrl: './dialog.component.html',
})
export class LoginDialogComponent {
    user;
    form: FormGroup;

    constructor(private formBuilder: FormBuilder,
        private authService: AuthenticationService,
        public dialogRef: MatDialogRef<LoginDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    loginGoogle() {
        this.authService.googleLogin();
        if (this.authService.user) {
            this.user = this.authService.user;
        }
    }

    loginMail() {
        console.log(this.form);
        //this.authService.mailLogin();
        //if (this.authService.user) {
        //    this.user = this.authService.user;
        //}
    }

    logout() {
        this.authService.logout();
        this.user = null;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
