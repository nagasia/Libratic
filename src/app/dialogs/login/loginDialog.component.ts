import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { FormatterService } from '../../services/formatter.service';
import { User } from '../../common/dto/user.dto';
import { Library } from '../../common/dto/library.dto';

@Component({
    selector: 'app-login-dialog',
    templateUrl: './loginDialog.component.html',
})
export class LoginDialogComponent implements OnDestroy {
    form: FormGroup;
    user: User;
    library: Library;
    library$;
    user$;

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
        await this.authService.googleLogin()
            .catch(error => console.log(error));

        if (this.authService.user) {
            this.user$ = this.db.getOne('users/' + this.formatter.formatEmail(this.authService.user.email))
                .subscribe((user: User) => {
                    if (user) {
                        this.library$ = this.db.getOne('libraries/' + user.libraryID)
                            .subscribe((library: Library) => {
                                this.user = user;
                                this.library = library;
                                this.onClose();
                            }, error => {
                                console.log(error);
                                this.onClose();
                            });
                    } else {
                        this.snackBar.open('El usuario no existe', '', { duration: 2000 });
                        this.authService.logout();
                        this.onClose();
                    }
                },
                    error => {
                        console.log(error);
                        this.onClose();
                    });
        }
    }

    loginMail() {
        const email = Object.assign({}, this.form.value).email;
        const password = Object.assign({}, this.form.value).password;
        const emailFormatted = this.formatter.formatEmail(email);

        this.user$ = this.db.getOne('users/' + emailFormatted)
            .subscribe(async (user: User) => {
                if (user) {
                    await this.authService.mailLogin(email, password).catch(error => {
                        if (error.code === 'auth/wrong-password') {
                            this.snackBar.open('Contraseña incorrecta', '', { duration: 2000 });
                            this.onClose();
                        } else if (error.code === 'auth/too-many-requests') {
                            this.snackBar.open('Demasiados intentos, intentelo en un rato', '', { duration: 2000 });
                            this.onClose();
                        } else {
                            console.log(error);
                            this.snackBar.open('Email incorrecto', '', { duration: 2000 });
                            this.onClose();
                        }
                    });

                    if (this.authService.user && this.authService.user.uid) {
                        this.library$ = this.db.getOne('libraries/' + user.libraryID)
                            .subscribe((library: Library) => {
                                this.user = user;
                                this.library = library;
                                this.onClose();
                            }, error => {
                                console.log(error);
                                this.onClose();
                            });
                    } else {
                        this.authService.logout();
                        this.onClose();
                    }
                } else {
                    this.snackBar.open('El usuario no existe', '', { duration: 2000 });
                    this.onClose();
                }
            },
                error => {
                    console.log(error);
                    this.onClose();
                });
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
        this.authService.authLibrary = this.library;
        this.dialogRef.close();
    }

    ngOnDestroy() {
        if (this.library$) {
            this.library$.unsubscribe();
        }
        if (this.user$) {
            this.user$.unsubscribe();
        }
    }
}
