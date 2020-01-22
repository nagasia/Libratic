import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { FormatterService } from '../../services/formatter.service';
import { User } from 'src/app/common/dto/user.dto';

@Component({
    selector: 'app-login-dialog',
    templateUrl: './loginDialog.component.html',
})
export class LoginDialogComponent implements OnDestroy {
    form: FormGroup;
    user: User;
    login$;

    constructor(private formBuilder: FormBuilder,
        private authService: AuthenticationService,
        private db: FireDBService,
        private formatter: FormatterService,
        private dialogRef: MatDialogRef<LoginDialogComponent>,
        private snackBar: MatSnackBar) {
        this.form = this.formBuilder.group({
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, Validators.minLength(6)]],
        });
    }

    async loginGoogle() {
        await this.authService.googleLogin();

        this.login$ = this.db.getOne('users/' + this.formatter.formatEmail(this.authService.user.email))
            .subscribe((user: User) => {
                if (user) {
                    this.user = user;
                    this.onClose();
                } else {
                    this.snackBar.open('El usuario no existe', '', { duration: 2000 });
                    this.onClose();
                }
            },
                error => console.log(error));

    }

    loginMail() {
        const email = Object.assign({}, this.form.value).email;
        const password = Object.assign({}, this.form.value).password;
        const emailFormatted = this.formatter.formatEmail(email);

        this.login$ = this.db.getOne('users/' + emailFormatted)
            .subscribe(async (user: User) => {
                if (user) {
                    await this.authService.mailLogin(email, password);
                    this.user = user;
                    this.onClose();
                } else {
                    this.snackBar.open('El usuario no existe', '', { duration: 2000 });
                    this.onClose();
                }
            },
                error => console.log(error));
    }

    resetPassword() {
        const email = Object.assign({}, this.form.value).email;
        if (email) {
            this.authService.reestartPassword(email)
                .then(response => this.snackBar.open('Correo enviado', '', { duration: 2000 }))
                .catch(error => this.snackBar.open('Correo no enviado', '', { duration: 2000 }));
        }
    }

    onClose() {
        this.authService.authUser = this.user;
        this.dialogRef.close();
    }

    ngOnDestroy() {
        if (this.login$) {
            this.login$.unsubscribe();
        }
    }
}
