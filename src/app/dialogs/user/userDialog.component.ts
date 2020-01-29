import { Component, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { User } from 'src/app/common/dto/user.dto';
import { FireDBService } from '../../services/fireDB.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'app-user-dialog',
    templateUrl: './userDialog.component.html',
})
export class UserDialogComponent implements OnDestroy {
    form: FormGroup;
    name: string;
    adress: string;
    city: string;
    email: string;
    phone: number;
    dni: number;
    userLevel: string;
    uid: string;
    library$;
    newUser$;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<UserDialogComponent>,
        private db: FireDBService,
        private authService: AuthenticationService,
        @Inject(MAT_DIALOG_DATA) public editting: User) {
        if (editting) {
            this.name = editting.name;
            this.adress = editting.adress;
            this.city = editting.city;
            this.email = editting.email;
            this.phone = editting.phone;
            this.dni = editting.dni;
            this.userLevel = editting.userLevel;
            this.uid = editting.id;
        }

        this.form = this.formBuilder.group({
            name: [this.name, [Validators.required, Validators.minLength(6)]],
            adress: [this.adress, [Validators.required, Validators.minLength(6)]],
            city: [this.city, [Validators.required]],
            email: [this.email, [Validators.required, Validators.email]],
            phone: [this.phone, [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
            dni: [this.dni, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
            userLevel: [this.userLevel, [Validators.required]]
        });
    }

    async save() {
        this.name = Object.assign({}, this.form.value).name;
        this.adress = Object.assign({}, this.form.value).adress;
        this.city = Object.assign({}, this.form.value).city;
        this.email = Object.assign({}, this.form.value).email;
        this.phone = Object.assign({}, this.form.value).phone;
        this.dni = Object.assign({}, this.form.value).dni;
        this.userLevel = Object.assign({}, this.form.value).userLevel;

        if (this.editting) {
            this.editUser();
        } else {
            const password = this.dni + new Date().getTime().toString();

            await this.authService.newUser(this.email, password)
                .then((data: any) => {
                    this.uid = data.user.uid;

                    this.newUser();
                })
                .catch(error => {
                    console.log(error);
                    this.onClose('El usuario ya existe (save)');
                });
        }
    }

    private newUser() {
        this.newUser$ = this.db.getOne('users/' + this.uid)
            .subscribe(response => {
                if (!response) {
                    const user: User = {
                        id: this.uid,
                        name: this.name,
                        adress: this.adress,
                        city: this.city,
                        email: this.email,
                        phone: this.phone,
                        dni: this.dni,
                        userLevel: this.userLevel,
                        libraryID: this.authService.authLibrary.id,
                    };

                    this.db.save('users/' + this.uid, user)
                        .then(() => {
                            this.authService.reestartPassword(this.email)
                                .catch(error => { console.log(error); });

                            this.updateLibrary();
                        })
                        .catch(error => {
                            console.log(error);
                            this.onClose('Problema al guardar al usuario');
                        });
                } else {
                    this.onClose('El usuario ya existe (newUser)');
                }
            }, error => {
                console.log(error);
                this.onClose();
            });
    }

    private editUser() {
        const user: User = {
            id: this.uid,
            name: this.name,
            adress: this.adress,
            city: this.city,
            email: this.email,
            phone: this.phone,
            dni: this.dni,
            userLevel: this.userLevel,
            libraryID: this.authService.authLibrary.id,
        };

        this.db.save('users/' + this.uid, user)
            .then(() => this.onClose('Usuario editado'))
            .catch(error => {
                console.log(error);
                this.onClose();
            });
    }

    private updateLibrary() {
        if (this.authService.authLibrary.usersIDs) {
            this.authService.authLibrary.usersIDs.push(this.uid);
        } else {
            this.authService.authLibrary.usersIDs = [this.uid];
        }

        this.db.save('libraries/' + this.authService.authLibrary.id, this.authService.authLibrary)
            .then(() => this.onClose('Usuario guardado'))
            .catch(error => {
                console.log(error);
                this.onClose();
            });
    }

    onClose(motive?: string) {
        if (motive) {
            this.dialogRef.close(motive);
        } else {
            this.dialogRef.close();
        }
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
