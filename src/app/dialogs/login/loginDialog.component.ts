import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'app-login-dialog',
    templateUrl: './loginDialog.component.html',
})
export class LoginDialogComponent {
    form: FormGroup;
    user;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<LoginDialogComponent>,
        public authService: AuthenticationService) {
        this.form = this.formBuilder.group({
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, Validators.minLength(6)]],
        });
    }

    loginGoogle() {
        this.authService.googleLogin();
        this.user = this.authService.user;
        this.onClose();
    }

    loginMail() {
        this.authService.mailLogin(Object.assign({}, this.form.value).email,
            Object.assign({}, this.form.value).password);
        this.user = this.authService.user;
        this.onClose();
    }

    onClose() {
        this.dialogRef.close(this.user);
    }
}
