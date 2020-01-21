import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { User } from 'src/app/common/dto/user.dto';
import { FireDBService } from '../../services/fireDB.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'app-user-dialog',
    templateUrl: './userDialog.component.html',
})
export class UserDialogComponent implements OnDestroy {
    form: FormGroup;
    newUser$;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<UserDialogComponent>,
        private db: FireDBService,
        private authService: AuthenticationService) {
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
        const userType = Object.assign({}, this.form.value).userType;

        const password = dni + new Date().getTime().toString();

        /*this.authService.newUserMail(email, password);

        this.newUser$ = this.authService.newUser
            .subscribe(data => {
                if (data) {
                    const user: User = {
                        id: data.uid,
                        name,
                        adress,
                        email,
                        phone,
                        dni,
                        userType,
                        libraryID: this.authService.loadedLibrary.id,
                    };

                    this.db.save('users/' + data.uid, user);
                    this.authService.reestartPassword(email);
                    this.onClose();
                }
            })
            .catch(error => console.log(error));*/
    }

    onClose() {
        this.dialogRef.close();
    }

    ngOnDestroy() {
        if (this.newUser$) {
            this.newUser$.unsubscribe();
        }
    }

}
