import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
    providedIn: 'root'
})
export class FireDBService {
    constructor(public db: AngularFireDatabase) { }

    save(path: string, data: any) {
        return this.db.object(path).update(data);
    }

    getList(path: string) {
        return this.db.list(path).snapshotChanges();
    }

    getListFiltered(path: string, child: string, value: any){
        return this.db.list(path,
            ref => ref.orderByChild(child).equalTo(value)).valueChanges();
    }

    getOne(path: string) {
        return this.db.object(path).valueChanges();
    }

    remove(path: string) {
        return this.db.object(path).remove();
    }
}
