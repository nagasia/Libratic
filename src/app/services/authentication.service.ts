import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { auth } from 'firebase';
import { FireDBService } from './fireDB.service';
import { Library } from '../common/dto/library.dto';
import { User } from '../common/dto/user.dto';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    loadedLibrary: Library;
    user;

    constructor(private fbAuth: AngularFireAuth,
        private fbdb: FireDBService) {
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
            .then(user => {
                this.user = user.user;
                //this.loadLibrary();
            })
            .catch(error => console.log(error));
    }

    googleLogin() {
        this.fbAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
            .then(user => {
                this.user = user.user;
                //this.loadLibrary();
            })
            .catch(error => console.log(error));
    }

    logout() {
        this.fbAuth.auth.signOut();
        this.user = null;
        this.loadedLibrary = null;
    }

    reestartPassword(email: string) {
        return this.fbAuth.auth.sendPasswordResetEmail(email);
    }

    /*private loadLibrary() {
        this.fbdb.getOne('users/' + this.user.uid)
            .subscribe((user: User) => {
                this.fbdb.getOne('library/' + user.libraryID)
                    .subscribe((library: Library) => this.loadedLibrary = library);
            });
    }*/

}
