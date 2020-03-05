import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import * as _ from 'lodash';
import { AuthenticationService } from './authentication.service';
import { User } from '../common/dto/user.dto';
import { Book } from '../common/dto/book.dto';
import { Lending } from '../common/dto/lendings.dto';
import { Movie } from '../common/dto/movie.dto';
import { TvShow } from '../common/dto/tv.dto';
import { Library } from '../common/dto/library.dto';

@Injectable({
    providedIn: 'root'
})
export class FireDBService {
    constructor(private db: AngularFireDatabase,
        private authService: AuthenticationService) { }

    getRef(path: string) {
        return this.db.database.ref(path);
    }

    getNewRefKey(path: string) {
        return this.db.database.ref(path).push().key;
    }

    save(path: string, data: any) {
        return this.db.object(path).update(data);
    }

    set(path: string, data: any) {
        return this.db.object(path).set(data);
    }

    remove(path: string) {
        return this.db.object(path).remove();
    }

    // selects
    getList(path: string) {
        return this.db.list(path).valueChanges();
    }

    getListFiltered(path: string, child: string, value: any) {
        return this.db.list(path,
            ref => ref.orderByChild(child).equalTo(value)).valueChanges();
    }

    getOne(path: string) {
        return this.db.object(path).valueChanges();
    }

    // users
    saveUser(user: User) {
        return this.save('/users/' + user.id, user);
    }

    deleteUser(uid: string) {
        return this.remove('/users/' + uid);
    }

    changePunishment(id: string, value: boolean) {
        const punishment = value;
        return this.set('/users/' + id + '/punishment/', punishment);
    }

    // library
    saveLibrary(user: User, library: Library) {
        let updates = {};
        updates['/users/' + user.id] = user;
        updates['/libraries/' + library.id] = library;

        return this.db.database.ref().update(updates);
    }

    updateLibrary(library: Library) {
        return this.save('libraries/' + library.id, library);
    }

    //lendings
    saveLending(lending: Lending) {
        const ref = this.getNewRefKey('/lendings/' + this.authService.authLibrary.id);
        lending.id = ref;

        return this.save('lendings/' + this.authService.authLibrary.id + '/' + lending.id, lending);
    }

    updateLending(lending: Lending) {
        return this.save('lendings/' + this.authService.authLibrary.id + '/' + lending.id, lending);
    }

    // books
    saveBook(book: Book, nEjemplares: number) {
        this.save('books/' + book.isbn, book);

        const element = {
            id: this.authService.authLibrary.id,
            nEjemplares,
        };
        return this.set('books/' + book.isbn + '/owned/' + this.authService.authLibrary.id, element);
    }

    updateBook(book: Book) {
        return this.save('/books/' + book.isbn, book);
    }

    saveBookFavourited(isbn: string) {
        return this.set('books/' + isbn + '/favourites/' + this.authService.authUser.id, true);
    }

    saveBookWished(isbn: string, id: string) {
        return this.set('books/' + isbn + '/wishes/' + id, true);
    }

    // movies
    saveMovie(movie: Movie, nEjemplares: number) {
        this.save('movies/' + movie.id, movie);

        const element = {
            id: this.authService.authLibrary.id,
            nEjemplares,
        };

        return this.set('movies/' + movie.id + '/owned/' + this.authService.authLibrary.id, element);
    }

    updateMovie(movie: Movie) {
        return this.save('/movies/' + movie.id, movie);
    }

    saveMovieFavourited(id: number) {
        return this.set('movies/' + id + '/favourites/' + this.authService.authUser.id, true);
    }

    saveMovieWished(id: number, userId: string) {
        return this.set('movies/' + id + '/wishes/' + userId, true);
    }

    // tv
    saveTv(tv: TvShow, nEjemplares: number) {
        this.save('tvs/' + tv.id, tv);

        const element = {
            id: this.authService.authLibrary.id,
            nEjemplares,
        };

        return this.set('tvs/' + tv.id + '/owned/' + this.authService.authLibrary.id, element);
    }

    updateTv(tv: TvShow) {
        return this.save('/tvs/' + tv.id, tv);
    }

    saveTvFavourited(id: number) {
        return this.set('tvs/' + id + '/favourites/' + this.authService.authUser.id, true);
    }

    saveTvWished(id: number, userId: string) {
        return this.set('tvs/' + id + '/wishes/' + userId, true);
    }
}
