import { Component, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { User } from 'src/app/common/dto/user.dto';
import { FireDBService } from '../../services/fireDB.service';
import { AuthenticationService } from '../../services/authentication.service';
import { StorageService } from 'src/app/services/storage.service';
import { CommonFunctions } from '../../common/commonFunctions';

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
    id: string;
    punishment: boolean;
    picture: string;
    pictureEvent;
    newPicture = false;
    user: User;
    newUser$;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<UserDialogComponent>,
        private db: FireDBService,
        private storage: StorageService,
        private authService: AuthenticationService,
        private functions: CommonFunctions,
        @Inject(MAT_DIALOG_DATA) public editting: User) {
        if (editting) {
            this.name = editting.name;
            this.adress = editting.adress;
            this.city = editting.city;
            this.email = editting.email;
            this.phone = editting.phone;
            this.dni = editting.dni;
            this.userLevel = editting.userLevel;
            this.id = editting.id;
            this.punishment = editting.punishment;
            this.picture = editting.picture;
        }

        this.form = this.formBuilder.group({
            name: [this.name, [Validators.required, Validators.minLength(6)]],
            adress: [this.adress, [Validators.required, Validators.minLength(6)]],
            city: [this.city, [Validators.required]],
            email: [this.email, [Validators.required, Validators.email]],
            phone: [this.phone, [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
            dni: [this.dni, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
            userLevel: [this.userLevel, [Validators.required]],
            punishment: this.punishment,
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
        this.punishment = Object.assign({}, this.form.value).punishment;

        if (this.editting) {
            this.editUser();
        } else {
            const password = this.dni + new Date().getTime().toString();

            await this.authService.newUser(this.email, password)
                .then((data: any) => {
                    this.id = data.user.uid;

                    this.checkUser();
                })
                .catch(error => {
                    console.log(error);
                    this.onClose('El usuario ya existe');
                });
        }
    }

    private checkUser() {
        this.newUser$ = this.db.getOne('users/' + this.id)
            .subscribe(response => {
                if (!response) {
                    this.newUser();
                } else {
                    this.onClose('El usuario ya existe');
                }
            }, error => {
                console.log(error);
                this.onClose();
            });
    }

    private async newUser() {
        if (this.newUser$) {
            this.newUser$.unsubscribe();
        }

        this.user = {
            id: this.id,
            name: this.name,
            adress: this.adress,
            city: this.city,
            email: this.email,
            phone: this.phone,
            dni: this.dni,
            userLevel: this.userLevel,
            libraryID: this.authService.authLibrary.id,
            punishment: this.punishment,
        };
        if (this.newPicture) {
            this.storage.delete('users/temp' + this.authService.authLibrary.id);
            await this.storage.upload('users/' + this.id, this.pictureEvent)
                .then(async () => await this.storage.getUrl('users/' + this.id)
                    .subscribe(url => this.user.picture = url))
                .catch(error => console.log(error));
        }

        this.user = this.functions.checkKeys(this.user);

        this.db.saveUser(this.user)
            .then(() => {
                this.authService.reestartPassword(this.email)
                    .catch(error => console.log(error));
                this.onClose('Usuario guardado');
            })
            .catch(error => {
                console.log(error);
                this.onClose('Problema al guardar al usuario');
            });
    }

    private editUser() {
        this.editting.name = this.name;
        this.editting.adress = this.adress;
        this.editting.city = this.city;
        this.editting.email = this.email;
        this.editting.phone = this.phone;
        this.editting.dni = this.dni;
        this.editting.userLevel = this.userLevel;
        this.editting.libraryID = this.authService.authLibrary.id;
        this.editting.punishment = this.punishment;
        this.editting.picture = this.picture;

        this.editting = this.functions.checkKeys(this.editting);

        this.db.saveUser(this.editting)
            .then(() => this.onClose('Usuario editado'))
            .catch(error => {
                console.log(error);
                this.onClose();
            });
    }

    setPicture(event: any) {
        this.pictureEvent = event;
        this.newPicture = true;

        if (this.editting) {
            this.storage.upload('users/' + this.id, this.pictureEvent)
                .then(() => this.storage.getUrl('users/' + this.id)
                    .subscribe(url => this.picture = url))
                .catch(error => console.log(error));
        } else {
            this.storage.upload('users/temp' + this.authService.authLibrary.id, this.pictureEvent)
                .then(() => this.storage.getUrl('users/temp' + this.authService.authLibrary.id)
                    .subscribe(url => this.picture = url))
                .catch(error => console.log(error));
        }
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
    }
}
