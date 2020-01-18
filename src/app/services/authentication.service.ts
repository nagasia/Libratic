import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { auth } from 'firebase';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    user;

    constructor(public fbAuth: AngularFireAuth) {
        this.user = this.fbAuth.authState.pipe(map(authState => {
            if (authState) {
                return authState;
            } else {
                return null;
            }
        }));
    }

    mailLogin(email: string, password: string) {
        this.fbAuth.auth.signInWithEmailAndPassword(email, password)
            .then(user => this.user = user.user)
            .catch(error => console.log(error));
    }

    googleLogin() {
        this.fbAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
            .then(user => this.user = user.user)
            .catch(error => console.log(error));
    }

    logout() {
        this.fbAuth.auth.signOut();
        this.user = null;
    }

}
