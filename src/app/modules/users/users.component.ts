import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { User } from '../../common/dto/user.dto';
import { MatDialog, MatSnackBar } from '@angular/material';
import { UserDialogComponent } from '../../dialogs/user/userDialog.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { CommonFunctions } from '../../common/commonFunctions';
import * as _ from 'lodash';

@Component({
    selector: 'app-user',
    templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isAdmin: boolean;
    isLoading: boolean;
    pictureURL: string;
    usersList = [];
    listFiltered$;
    newUser$;

    constructor(public authService: AuthenticationService,
        private db: FireDBService,
        public storage: StorageService,
        private formBuilder: FormBuilder,
        public functions: CommonFunctions,
        private dialog: MatDialog,
        private snackBar: MatSnackBar) {
        this.isAdmin = this.functions.isAdmin(this.authService.authUser);
        if (!this.isAdmin) {
            this.form = this.formBuilder.group({
                adress: [this.authService.authUser.adress, [Validators.required, Validators.minLength(6)]],
                city: [this.authService.authUser.city, [Validators.required]],
                email: [this.authService.authUser.email, [Validators.required, Validators.email]],
                phone: [this.authService.authUser.phone, [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
            });
        }
    }

    ngOnInit() {
        if (this.isAdmin) {
            this.isLoading = true;

            this.listFiltered$ = this.db.getListFiltered('users', 'libraryID', this.authService.authLibrary.id)
                .subscribe(data => {
                    if (data.length !== 0) {
                        this.usersList = data;
                        this.isLoading = false;
                        this.usersList = _.sortBy(this.usersList, 'name');
                    }
                },
                    error => console.log(error));
        }
    }

    newUser() {
        this.newUser$ = this.dialog.open(UserDialogComponent, {
            width: '50%',
        });

        this.newUser$.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        });
    }

    editUser(user: User) {
        this.newUser$ = this.dialog.open(UserDialogComponent, {
            width: '50%',
            data: user,
        });

        this.newUser$.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        });
    }

    update(user: User) {
        this.db.saveUser(user)
            .then(() => this.snackBar.open('Usuario editado', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Error al editar al usuario', '', { duration: 2000 });
            });
    }

    deleteUser(id: string) {
        this.db.deleteUser(id)
            .then(() => this.snackBar.open('Usuario borrado', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Error al borrar al usuario', '', { duration: 2000 });
            });
    }

    ngOnDestroy() {
        if (this.listFiltered$) {
            this.listFiltered$.unsubscribe();
        }
    }

}
