import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { auth } from 'firebase';
import { Library } from '../common/dto/library.dto';
import { User } from '../common/dto/user.dto';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    authUser: User;
    authLibrary: Library;
    user;

    constructor(private fbAuth: AngularFireAuth) {
        this.user = this.fbAuth.authState.pipe(map(authState => {
            if (authState) {
                return authState;
            } else {
                return null;
            }
        }));
    }

    async mailLogin(email: string, password: string) {
        return await this.fbAuth.auth.signInWithEmailAndPassword(email, password)
            .then(user => {
                this.user = user.user;
            });
    }

    async googleLogin() {
        return await this.fbAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
            .then(user => {
                this.user = user.user;
            });
    }

    async newUser(email: string, password: string) {
        await this.fbAuth.auth.createUserWithEmailAndPassword(email, password)
            .catch(error => console.log(error));
    }

    async reestartPassword(email: string) {
        return await this.fbAuth.auth.sendPasswordResetEmail(email);
    }

    logout() {
        this.fbAuth.auth.signOut();
        this.user = null;
        this.authUser = null;
        this.authLibrary = null;
    }
}
