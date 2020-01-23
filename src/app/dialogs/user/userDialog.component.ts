import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { User } from 'src/app/common/dto/user.dto';
import { FireDBService } from '../../services/fireDB.service';
import { AuthenticationService } from '../../services/authentication.service';
import { FormatterService } from '../../services/formatter.service';

@Component({
    selector: 'app-user-dialog',
    templateUrl: './userDialog.component.html',
})
export class UserDialogComponent implements OnDestroy {
    form: FormGroup;
    library$;
    newUser$;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<UserDialogComponent>,
        private db: FireDBService,
        private authService: AuthenticationService,
        private formatter: FormatterService,
        private snackBar: MatSnackBar) {
        this.form = this.formBuilder.group({
            name: [null, [Validators.required, Validators.minLength(6)]],
            adress: [null, [Validators.required, Validators.minLength(6)]],
            email: [null, [Validators.required, Validators.email]],
            phone: [null, [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
            dni: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
            userType: [null, [Validators.required]]
        });
    }

    save() {
        const name = Object.assign({}, this.form.value).name;
        const adress = Object.assign({}, this.form.value).adress;
        const email = Object.assign({}, this.form.value).email;
        const phone = Object.assign({}, this.form.value).phone;
        const dni = Object.assign({}, this.form.value).dni;
        const userLevel = Object.assign({}, this.form.value).userType;
        const password = dni + new Date().getTime().toString();
        const id = this.formatter.formatEmail(email);

        this.newUser$ = this.db.getOne('users/' + id)
            .subscribe(response => {
                if (!response) {
                    const library = this.authService.authLibrary;

                    const user: User = {
                        id,
                        name,
                        adress,
                        email,
                        phone,
                        dni,
                        userLevel,
                        libraryID: library.id,
                    };

                    this.db.save('users/' + id, user)
                        .then(async data => {
                            this.snackBar.open('Usuario guardado', '', { duration: 2000 });

                            if (library.usersIDs) {
                                library.usersIDs.push(id);
                            } else {
                                library.usersIDs = [id];
                            }

                            this.db.save('libraries/' + library.id, library)
                                .catch(error => {
                                    console.log(error);
                                    this.onClose();
                                });

                            await this.authService.newUser(email, password);
                            this.authService.reestartPassword(email);
                            this.onClose();
                        })
                        .catch(error => {
                            this.snackBar.open('Problema al guardar al usuario', '', { duration: 2000 });
                            console.log(error);
                            this.onClose();
                        });
                } else {
                    this.snackBar.open('El usuario ya existe', '', { duration: 2000 });
                    this.onClose();
                }
            }, error => {
                console.log(error);
                this.onClose();
            });
    }

    onClose() {
        this.dialogRef.close();
    }

    ngOnDestroy() {
        if (this.newUser$) {
            this.newUser$.unsubscribe();
        }
        if (this.library$) {
            this.library$.unsubscribe();
        }
    }

}
