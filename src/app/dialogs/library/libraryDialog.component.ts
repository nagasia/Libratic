import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
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
    admin: string;
    password: string;
    date: Date;
    id: string;
    user: User;
    userObservable$;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<LibraryDialogComponent>,
        private db: FireDBService,
        public authService: AuthenticationService) {
        this.form = this.formBuilder.group({
            name: [null, [Validators.required, Validators.minLength(6)]],
            adress: null,
            admin: [null, [Validators.required, Validators.email]],
            password: null,
        });
    }

    save() {
        this.name = Object.assign({}, this.form.value).name;
        this.adress = Object.assign({}, this.form.value).adress;
        this.admin = Object.assign({}, this.form.value).admin;
        this.password = Object.assign({}, this.form.value).password;
        this.date = new Date();

        this.saveUser();
    }

    private saveUser() {
        if (this.password) {
            this.authService.mailLogin(this.admin, this.password);
            this.userObservable$ = this.authService.user.subscribe(data => {
                this.id = data.uid;
                const libraryID = this.name + this.date.getTime().toString();

                this.user = {
                    id: data.uid,
                    email: this.admin,
                    phone: data.phoneNumber,
                    userType: 'admin',
                    libraryIDs: [libraryID],
                };
                this.db.save('users/' + this.id, this.user);

                this.saveLibrary();
            });
        } else {
            this.authService.googleLogin();
            this.userObservable$ = this.authService.user.subscribe(data => {
                this.id = data.uid;
                const libraryID = this.name + this.date.getTime().toString();

                this.user = {
                    id: data.uid,
                    name: data.displayName,
                    email: this.admin,
                    phone: data.phoneNumber,
                    userType: 'admin',
                    libraryIDs: [libraryID],
                };
                this.db.save('users/' + this.id, this.user);

                this.saveLibrary();
            });
        }
    }

    private saveLibrary() {
        const id = this.name + this.date.getTime().toString();

        const library: Library = {
            id,
            name: this.name,
            adress: this.adress,
            adminIDs: [this.id],
        };

        this.db.save('library/' + library.id, library);

        this.onClose();
    }

    private onClose() {
        this.dialogRef.close(this.userObservable$);
    }

    ngOnDestroy() {
        if (this.userObservable$) {
            this.userObservable$.unsubscribe();
        }
    }
}
