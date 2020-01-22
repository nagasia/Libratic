import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FireDBService } from '../../services/fireDB.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from '../../common/dto/user.dto';
import { Library } from 'src/app/common/dto/library.dto';
import { FormatterService } from '../../services/formatter.service';

@Component({
    selector: 'app-library-dialog',
    templateUrl: './libraryDialog.component.html',
})
export class LibraryDialogComponent implements OnDestroy {
    form: FormGroup;
    name: string;
    adress: string;
    email: string;
    password: string;
    date: string;
    userID: string;
    user: User;
    user$;
    library$;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<LibraryDialogComponent>,
        private db: FireDBService,
        public authService: AuthenticationService,
        private format: FormatterService,
        private snackBar: MatSnackBar) {
        this.form = this.formBuilder.group({
            name: [null, [Validators.required, Validators.minLength(6)]],
            adress: null,
            email: [null, [Validators.required, Validators.email]],
            password: null,
        });
    }

    save() {
        this.name = Object.assign({}, this.form.value).name;
        this.adress = Object.assign({}, this.form.value).adress;
        this.email = Object.assign({}, this.form.value).email;
        this.password = Object.assign({}, this.form.value).password;
        this.date = new Date().getTime().toString();

        this.library$ = this.db.getOne('libraries/' + this.name)
            .subscribe(library => {
                if (!library) {
                    this.processMethod();
                } else {
                    this.snackBar.open('La biblioteca ya existe', '', { duration: 2000 });
                    this.onClose();
                }
            }, error => {
                console.log(error);
                this.onClose();
            });
    }

    private async processMethod() {
        if (this.password) {
            this.userID = this.format.formatEmail(this.email);

            this.user$ = this.db.getOne(this.userID)
                .subscribe(async (user: User) => {
                    await this.authService.mailLogin(this.email, this.password);
                    this.processUser(user);
                },
                    error => {
                        console.log(error);
                        this.onClose();
                    });
        } else {
            await this.authService.googleLogin();
            this.userID = this.format.formatEmail(this.authService.user.email);

            this.user$ = this.db.getOne(this.userID)
                .subscribe((user: User) => this.processUser(user),
                    error => {
                        console.log(error);
                        this.onClose();
                    });
        }
    }

    private processUser(user: User) {
        if (!user) {
            this.newUser();
            this.newLibrary();
        } else {
            this.snackBar.open('El usuario ya existe', '', { duration: 2000 });
            this.onClose();
        }
    }

    private newLibrary() {
        const library: Library = {
            id: this.name,
            adress: this.adress,
            adminIDs: [this.userID],
        };

        this.db.save('libraries/' + library.id, library)
            .then(data => this.authService.authLibrary = library)
            .catch(error => {
                console.log(error);
                this.onClose();
            });

        this.onClose();
    }

    private newUser() {
        this.user = {
            id: this.userID,
            email: this.email,
            userLevel: 'admin',
            libraryID: this.name,
        };

        this.db.save('users/' + this.user.id, this.user)
            .then(data => this.authService.authUser = this.user)
            .catch(error => {
                console.log(error);
                this.onClose();
            });
    }

    private onClose() {
        this.dialogRef.close();
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
