import { Component, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FireDBService } from '../../services/fireDB.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from '../../common/dto/user.dto';
import { Library } from 'src/app/common/dto/library.dto';

@Component({
    selector: 'app-library-dialog',
    templateUrl: './libraryDialog.component.html',
})
export class LibraryDialogComponent implements OnDestroy {
    form: FormGroup;
    name: string;
    adress: string;
    city: string;
    phone: number;
    emailLibrary: string;
    emailAdmin: string;
    password: string;
    date: string;
    user: User;
    user$;
    library$;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<LibraryDialogComponent>,
        private db: FireDBService,
        public authService: AuthenticationService,
        @Inject(MAT_DIALOG_DATA) public isEditting: boolean) {
        if (isEditting) {
            this.name = this.authService.authLibrary.name;
            this.adress = this.authService.authLibrary.adress;
            this.city = this.authService.authLibrary.city;
            this.phone = this.authService.authLibrary.phone;
            this.emailLibrary = this.authService.authLibrary.email;

            this.form = this.formBuilder.group({
                name: [this.name, [Validators.required, Validators.minLength(6)]],
                adress: this.adress,
                city: this.city,
                emailLibrary: this.emailLibrary,
                phone: this.phone,
            });
        } else {
            this.form = this.formBuilder.group({
                name: [this.name, [Validators.required, Validators.minLength(6)]],
                adress: this.adress,
                city: this.city,
                emailLibrary: [this.emailLibrary, [Validators.email]],
                phone: this.phone,
                emailAdmin: [this.emailAdmin, [Validators.required, Validators.email]],
                password: [this.password, [Validators.required, Validators.minLength(6)]],
            });
        }
    }

    save() {
        this.name = Object.assign({}, this.form.value).name;
        this.adress = Object.assign({}, this.form.value).adress;
        this.city = Object.assign({}, this.form.value).city;
        this.phone = Object.assign({}, this.form.value).phone;
        this.emailLibrary = Object.assign({}, this.form.value).emailLibrary;
        this.emailAdmin = Object.assign({}, this.form.value).emailAdmin;
        this.password = Object.assign({}, this.form.value).password;
        this.date = new Date().getTime().toString();

        if (this.isEditting) {
            this.saveLibrary();
        } else {
            this.library$ = this.db.getListFiltered('libraries/', 'name', this.name)
                .subscribe(library => {
                    if (library.length === 0) {
                        this.processMethod();
                    } else {
                        this.onClose('La biblioteca ya existe');
                    }
                }, error => {
                    console.log(error);
                    this.onClose();
                });
        }
    }

    private async processMethod() {
        if (this.library$) {
            this.library$.unsubscribe();
        }

        await this.authService.newUser(this.emailAdmin, this.password)
            .then((data: any) => {
                const uid = data.user.uid;

                this.user$ = this.db.getOne('users/' + uid)
                    .subscribe((user: User) => {
                        if (!user) {
                            this.newUser(uid);
                        } else {
                            this.onClose('El usuario ya existe');
                        }
                    });
            })
            .catch(error => {
                console.log(error);
                this.onClose('El usuario ya existe');
            });
    }

    private newUser(uid: string) {
        if (this.user$) {
            this.user$.unsubscribe();
        }

        this.user = {
            id: uid,
            email: this.emailAdmin,
            name: 'Admin',
            userLevel: 'admin',
            libraryID: '',
        };

        this.saveLibrary();
    }

    private saveLibrary() {
        if (this.isEditting) {
            this.authService.authLibrary.name = this.name;
            this.authService.authLibrary.adress = this.adress;
            this.authService.authLibrary.city = this.city;
            this.authService.authLibrary.phone = this.phone;
            this.authService.authLibrary.email = this.emailLibrary;

            this.db.updateLibrary(this.authService.authLibrary)
                .then(() => {
                    this.onClose('Biblioteca editada');
                })
                .catch(error => {
                    console.log(error);
                    this.onClose();
                });
        } else {
            const id = this.db.getNewRefKey('libraries');
            const library: Library = {
                id,
                name: this.name,
                adress: this.adress,
                city: this.city,
                phone: this.phone,
                email: this.emailLibrary,
            };
            this.user.libraryID = id;

            this.db.saveLibrary(this.user, library)
                .then(() => {
                    this.authService.authLibrary = library;
                    this.onClose('Biblioteca creada', true);
                })
                .catch(error => {
                    console.log(error);
                    this.onClose();
                });
        }
    }

    private onClose(motive?: string, done?: boolean) {
        if (done) {
            this.dialogRef.close({ motive, done });
        } else if (motive) {
            this.dialogRef.close(motive);
        } else {
            this.dialogRef.close();
        }
    }

    ngOnDestroy() {
        if (this.user$) {
            this.user$.unsubscribe();
        }
        if (this.library$) {
            this.library$.unsubscribe();
        }
    }
}
