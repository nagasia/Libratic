import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { auth } from 'firebase';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    user;

    constructor(private fbAuth: AngularFireAuth) {
        this.user = this.fbAuth.authState.pipe(map(authState => {
            console.log('authState:', authState);
            if (authState) {
                return authState;
            } else {
                return null;
            }
        }));
    }

    mailLogin() { }

    googleLogin() {
        this.fbAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
            .then(user => console.log(user))
            .catch(error => console.log(error));
    }

    logout() {
        this.fbAuth.auth.signOut();
    }

}
