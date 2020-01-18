import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    constructor(public db: AngularFireDatabase) { }

    save(path: string, data: any) {
        this.db.object(path).update(data)
            .catch(error => console.log(error));
    }

    getList(path: string) {
        return this.db.list(path).snapshotChanges();
    }

    getOne(path: string) {
        return this.db.object(path).valueChanges();
    }

    remove(path: string) {
        return this.db.object(path).remove()
            .catch(error => console.log(error));
    }
}
