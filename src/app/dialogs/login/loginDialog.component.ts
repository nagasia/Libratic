import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
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
        private dialogRef: MatDialogRef<LoginDialogComponent>) {
        this.form = this.formBuilder.group({
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, Validators.minLength(6)]],
        });
    }

    async loginGoogle() {
        await this.authService.googleLogin()
            .catch(error => console.log(error));

        this.processUser();
    }

    async loginMail() {
        const email = Object.assign({}, this.form.value).email;
        const password = Object.assign({}, this.form.value).password;

        await this.authService.mailLogin(email, password).catch(error => {
            if (error.code === 'auth/wrong-password') {
                this.onClose('Contraseña incorrecta');
            } else if (error.code === 'auth/too-many-requests') {
                this.onClose('Demasiados intentos, intentelo en un rato');
            } else {
                console.log(error);
                this.onClose('Email incorrecto');
            }
        });

        this.processUser();
    }

    private processUser() {
        if (this.authService.user) {
            this.user$ = this.db.getOne('users/' + this.authService.user.uid)
                .subscribe((user: User) => {
                    if (user) {
                        this.library$ = this.db.getOne('libraries/' + user.libraryID)
                            .subscribe((library: Library) => {
                                this.user = user;
                                this.library = library;

                                this.onClose('Conexión con éxito', user);
                            }, error => {
                                console.log(error);
                                this.onClose();
                            });
                    } else {
                        this.authService.logout();
                        this.onClose('El usuario no existe');
                    }
                },
                    error => {
                        console.log(error);
                        this.onClose();
                    });
        }
    }

    resetPassword() {
        const email = Object.assign({}, this.form.value).email;
        if (email) {
            this.authService.reestartPassword(email)
                .then(() => this.onClose('Correo enviado'))
                .catch(() => this.onClose('Correo no enviado'));
        }
    }

    onClose(motive?: string, user?: User) {
        if (user) {
            this.authService.authUser = this.user;
            this.authService.authLibrary = this.library;
            this.dialogRef.close({ motive, user });
        } else if (motive) {
            this.dialogRef.close(motive);
        } else {
            this.dialogRef.close();
        }

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
