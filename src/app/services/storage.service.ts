import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor(private storage: AngularFireStorage) { }

    private getRef(path: string) {
        return this.storage.ref(path);
    }

    upload(path: string, item: any) {
        return this.storage.upload(path, item.target.files[0]);
    }

    delete(path: string) {
        return this.getRef(path).delete();
    }

    getUrl(path: string) {
        return this.getRef(path).getDownloadURL();
    }

}
