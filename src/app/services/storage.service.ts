import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { FireDBService } from './fireDB.service';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    url = of('');
    thumb: string;
    savedPicture: string;
    task;

    constructor(private storage: AngularFireStorage,
        private authService: AuthenticationService,
        private db: FireDBService) {
        this.thumb = '_100x100';
    }

    upload(event: any) {
        const path = 'images/' + this.authService.authUser.id;
        this.task = this.storage.upload(path, event.target.files[0]);
        this.task.snapshotChanges().pipe(finalize(() => {
            this.authService.authUser.picture = 'gs://libratic-7153b.appspot.com/images/'
                + this.authService.authUser.id + this.thumb;

            this.db.save('users/' + this.authService.authUser.id, this.authService.authUser);
        })).subscribe();
    }

    async uploadCover(path: string, event: any) {
        this.task = this.storage.upload(path, event.target.files[0]);
        await this.task.snapshotChanges().pipe(finalize(() => {
            this.savedPicture = 'gs://libratic-7153b.appspot.com/' + path + this.thumb;
        })).subscribe();
    }

    loadImage(url: string) {
        return this.storage.storage.refFromURL(url).getDownloadURL()
            .catch(error => console.log(error));
    }

}
