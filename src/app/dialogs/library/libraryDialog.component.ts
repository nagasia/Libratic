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
    email: string;
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
            this.name = this.authService.authLibrary.id;
            this.adress = this.authService.authLibrary.adress;
            this.city = this.authService.authLibrary.city;

            this.form = this.formBuilder.group({
                name: [this.name, [Validators.required, Validators.minLength(6)]],
                adress: this.adress,
                city: this.city,
            });
        } else {
            this.form = this.formBuilder.group({
                name: [this.name, [Validators.required, Validators.minLength(6)]],
                adress: this.adress,
                city: this.city,
                email: [this.email, [Validators.required, Validators.email]],
                password: [this.password, [Validators.required, Validators.minLength(6)]],
            });
        }
    }

    save() {
        this.name = Object.assign({}, this.form.value).name;
        this.adress = Object.assign({}, this.form.value).adress;
        this.city = Object.assign({}, this.form.value).city;
        this.email = Object.assign({}, this.form.value).email;
        this.password = Object.assign({}, this.form.value).password;
        this.date = new Date().getTime().toString();

        if (this.isEditting) {
            this.editLibrary();
        } else {
            this.library$ = this.db.getOne('libraries/' + this.name)
                .subscribe(library => {
                    if (!library) {
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
        await this.authService.newUser(this.email, this.password)
            .then((data: any) => {
                const uid = data.user.uid;

                this.user$ = this.db.getOne('users/' + uid)
                    .subscribe((user: User) => {
                        this.processUser(user, uid);
                    });
            })
            .catch(error => {
                console.log(error);
                this.onClose('El usuario ya existe');
            });
    }

    private processUser(user: User, uid: string) {
        if (!user) {
            this.newUser(uid);
        } else {
            this.onClose('El usuario ya existe');
        }
    }

    private newUser(uid: string) {
        this.user = {
            id: uid,
            email: this.email,
            userLevel: 'admin',
            libraryID: this.name,
        };

        this.db.save('users/' + this.user.id, this.user)
            .then(data => {
                this.authService.authUser = this.user;
                this.newLibrary();
            })
            .catch(error => {
                console.log(error);
                this.onClose();
            });
    }

    private newLibrary() {
        const library: Library = {
            id: this.name,
            adress: this.adress,
            city: this.city,
            adminIDs: [this.user.id],
        };

        this.db.save('libraries/' + library.id, library)
            .then(() => {
                this.authService.authLibrary = library;
                this.onClose('Biblioteca creada', library);
            })
            .catch(error => {
                console.log(error);
                this.onClose();
            });
    }

    private editLibrary() {
        const library: Library = {
            id: this.name,
            adress: this.adress,
            city: this.city,
            adminIDs: this.authService.authLibrary.adminIDs,
        };

        this.db.save('libraries/' + library.id, library)
            .then(() => {
                this.authService.authLibrary = library;
                this.onClose('Biblioteca editada');
            })
            .catch(error => {
                console.log(error);
                this.onClose();
            });
    }

    private onClose(motive?: string, library?: Library) {
        if (library) {
            this.dialogRef.close({ motive, library });
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
