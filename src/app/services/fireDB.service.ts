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
    constructor(public db: AngularFireDatabase,
        private authService: AuthenticationService) { }

    getRef(path: string) {
        return this.db.database.ref(path);
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

    // users
    saveUser(user: User) {
        if (this.authService.authLibrary.usersIDs) {
            this.authService.authLibrary.usersIDs.push(user.id);
        } else {
            this.authService.authLibrary.usersIDs = [user.id];
        }

        return this.set('/libraries/' + this.authService.authLibrary.id + '/usersIDs/',
            this.authService.authLibrary.usersIDs);
    }

    saveAdmin(user: User, library: Library) {
        if (library.adminIDs) {
            library.adminIDs.push(user.id);
        } else {
            library.adminIDs = [user.id];
        }

        this.save('/users/' + user.id, user);
        return this.set('/libraries/' + library.id + '/adminIDs/', library.adminIDs);
    }

    updateUser(user: User) {
        return this.save('users/' + user.id, user);
    }

    deleteUser(uid: string) {
        _.remove(this.authService.authLibrary.usersIDs, id => id === uid);

        this.save('/users/' + uid, null);
        return this.set('/libraries/' + this.authService.authLibrary.id + '/usersIDs/',
            this.authService.authLibrary.usersIDs);
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

    // books
    saveBook(book: Book) {
        if (this.authService.authLibrary.booksIDs) {
            this.authService.authLibrary.booksIDs.push(book.isbn);
        } else {
            this.authService.authLibrary.booksIDs = [book.isbn];
        }

        this.save('/books/' + book.isbn, book);
        return this.set('/libraries/' + this.authService.authLibrary.id + '/booksIDs/',
            this.authService.authLibrary.booksIDs);
    }

    updateBook(book: Book) {
        return this.save('/books/' + book.isbn, book);
    }

    deleteBook(isbn: number) {
        _.remove(this.authService.authLibrary.booksIDs, id => id === isbn);

        return this.set('/libraries/' + this.authService.authLibrary.id + '/booksIDs/',
            this.authService.authLibrary.booksIDs);
    }

    saveBookLending(lending: Lending, user: User) {
        if (this.authService.authLibrary.bookLendings) {
            this.authService.authLibrary.bookLendings.push(lending);
        } else {
            this.authService.authLibrary.bookLendings = [lending];
        }

        if (user.bookLendings) {
            user.bookLendings.push(lending);
        } else {
            user.bookLendings = [lending];
        }

        this.set('/libraries/' + this.authService.authLibrary.id + '/bookLendings/',
            this.authService.authLibrary.bookLendings);
        return this.set('/users/' + user.id + '/bookLendings/', user.bookLendings);
    }

    updateBookLending(lending: Lending, user: User) {
        let libraryIndex = _.findIndex(this.authService.authLibrary.bookLendings,
            { itemId: lending.itemId, userId: lending.userId, startDate: lending.startDate });
        this.authService.authLibrary.bookLendings[libraryIndex] = lending;

        let userIndex = _.findIndex(user.bookLendings,
            { itemId: lending.itemId, userId: lending.userId, startDate: lending.startDate });
        user.bookLendings[userIndex] = lending;

        this.set('/libraries/' + this.authService.authLibrary.id + '/bookLendings/',
            this.authService.authLibrary.bookLendings);
        return this.set('/users/' + user.id + '/bookLendings/', user.bookLendings);
    }

    saveBookFavourited(isbn: number) {
        if (this.authService.authUser.bookFavourited) {
            this.authService.authUser.bookFavourited.push(isbn);
        } else {
            this.authService.authUser.bookFavourited = [isbn];
        }

        return this.set('/users/' + this.authService.authUser.id + '/bookFavourited/',
            this.authService.authUser.bookFavourited);
    }

    deleteBookFavourited(isbn: number) {
        _.remove(this.authService.authUser.bookFavourited, id => id === isbn);

        return this.set('/users/' + this.authService.authUser.id + '/bookFavourited/',
            this.authService.authUser.bookFavourited);
    }

    saveUserBookWished(isbn: number) {
        if (this.authService.authUser.bookWished) {
            this.authService.authUser.bookWished.push(isbn);
        } else {
            this.authService.authUser.bookWished = [isbn];
        }

        return this.set('/users/' + this.authService.authUser.id + '/bookWished/',
            this.authService.authUser.bookWished);
    }

    deleteUserBookWished(isbn: number) {
        _.remove(this.authService.authUser.bookWished, id => id === isbn);

        return this.set('/users/' + this.authService.authUser.id + '/bookWished/',
            this.authService.authUser.bookWished);
    }

    saveLibraryBookWished(isbn: number) {
        if (this.authService.authLibrary.bookWished) {
            this.authService.authLibrary.bookWished.push(isbn);
        } else {
            this.authService.authLibrary.bookWished = [isbn];
        }

        return this.set('/libraries/' + this.authService.authLibrary.id + '/bookWished/',
            this.authService.authLibrary.bookWished);
    }

    deleteLibraryBookWished(isbn: number) {
        _.remove(this.authService.authLibrary.bookWished, id => id === isbn);

        return this.set('/libraries/' + this.authService.authLibrary.id + '/bookWished/',
            this.authService.authLibrary.bookWished);
    }

    // movies
    saveMovie(movie: Movie) {
        if (this.authService.authLibrary.moviesIDs) {
            this.authService.authLibrary.moviesIDs.push(movie.id);
        } else {
            this.authService.authLibrary.moviesIDs = [movie.id];
        }


        this.save('/movies/' + movie.id, movie);
        return this.set('/libraries/' + this.authService.authLibrary.id + '/moviesIDs/',
            this.authService.authLibrary.moviesIDs);
    }

    updateMovie(movie: Movie) {
        return this.save('/movies/' + movie.id, movie);
    }

    deleteMovie(uid: number) {
        _.remove(this.authService.authLibrary.moviesIDs, id => id === uid);

        return this.set('/libraries/' + this.authService.authLibrary.id + '/moviesIDs/',
            this.authService.authLibrary.moviesIDs);
    }

    saveMovieLending(lending: Lending, user: User) {
        if (this.authService.authLibrary.movieLendings) {
            this.authService.authLibrary.movieLendings.push(lending);
        } else {
            this.authService.authLibrary.movieLendings = [lending];
        }

        if (user.movieLendings) {
            user.movieLendings.push(lending);
        } else {
            user.movieLendings = [lending];
        }

        this.set('/libraries/' + this.authService.authLibrary.id + '/movieLendings/',
            this.authService.authLibrary.movieLendings);
        return this.set('/users/' + user.id + '/movieLendings/', user.movieLendings);
    }

    updateMovieLending(lending: Lending, user: User) {
        let libraryIndex = _.findIndex(this.authService.authLibrary.movieLendings,
            { itemId: lending.itemId, userId: lending.userId, startDate: lending.startDate });
        this.authService.authLibrary.movieLendings[libraryIndex] = lending;

        let userIndex = _.findIndex(user.movieLendings,
            { itemId: lending.itemId, userId: lending.userId, startDate: lending.startDate });
        user.movieLendings[userIndex] = lending;

        this.set('/libraries/' + this.authService.authLibrary.id + '/movieLendings/',
            this.authService.authLibrary.movieLendings);
        return this.set('/users/' + user.id + '/movieLendings/', user.movieLendings);
    }

    saveMovieFavourited(id: number) {
        if (this.authService.authUser.moviesFavourited) {
            this.authService.authUser.moviesFavourited.push(id);
        } else {
            this.authService.authUser.moviesFavourited = [id];
        }

        return this.set('/users/' + this.authService.authUser.id + '/moviesFavourited/',
            this.authService.authUser.moviesFavourited);
    }

    deleteMovieFavourited(uid: number) {
        _.remove(this.authService.authUser.moviesFavourited, id => id === uid);

        return this.set('/users/' + this.authService.authUser.id + '/moviesFavourited/',
            this.authService.authUser.moviesFavourited);
    }

    saveUserMovieWished(id: number) {
        if (this.authService.authUser.moviesWished) {
            this.authService.authUser.moviesWished.push(id);
        } else {
            this.authService.authUser.moviesWished = [id];
        }

        return this.set('/users/' + this.authService.authUser.id + '/moviesWished/',
            this.authService.authUser.moviesWished);
    }

    deleteUserMovieWished(uid: number) {
        _.remove(this.authService.authUser.moviesWished, id => id === uid);

        return this.set('/users/' + this.authService.authUser.id + '/moviesWished/',
            this.authService.authUser.moviesWished);
    }

    saveLibraryMovieWished(id: number) {
        if (this.authService.authLibrary.moviesWished) {
            this.authService.authLibrary.moviesWished.push(id);
        } else {
            this.authService.authLibrary.moviesWished = [id];
        }

        return this.set('/libraries/' + this.authService.authLibrary.id + '/moviesWished/',
            this.authService.authLibrary.moviesWished);
    }

    deleteLibraryMovieWished(uid: number) {
        _.remove(this.authService.authLibrary.moviesWished, id => id === uid);

        return this.set('/libraries/' + this.authService.authLibrary.id + '/moviesWished/',
            this.authService.authLibrary.moviesWished);
    }

    // tv
    saveTV(tv: TvShow) {
        if (this.authService.authLibrary.tvsIDs) {
            this.authService.authLibrary.tvsIDs.push(tv.id);
        } else {
            this.authService.authLibrary.tvsIDs = [tv.id];
        }

        this.save('/tvs/' + tv.id, tv);
        return this.set('/libraries/' + this.authService.authLibrary.id + '/tvsIDs/',
            this.authService.authLibrary.tvsIDs);
    }

    updateTV(tv: TvShow) {
        return this.save('/tvs/' + tv.id, tv);
    }

    deleteTV(uid: number) {
        _.remove(this.authService.authLibrary.tvsIDs, id => id === uid);

        return this.set('/libraries/' + this.authService.authLibrary.id + '/tvsIDs/',
            this.authService.authLibrary.tvsIDs);
    }

    saveTVLending(lending: Lending, user: User) {
        if (this.authService.authLibrary.tvLendings) {
            this.authService.authLibrary.tvLendings.push(lending);
        } else {
            this.authService.authLibrary.tvLendings = [lending];
        }

        if (user.tvLendings) {
            user.tvLendings.push(lending);
        } else {
            user.tvLendings = [lending];
        }

        this.set('/libraries/' + this.authService.authLibrary.id + '/tvLendings/',
            this.authService.authLibrary.tvLendings);
        return this.set('/users/' + user.id + '/tvLendings/', user.tvLendings);
    }

    updateTVLending(lending: Lending, user: User) {
        let libraryIndex = _.findIndex(this.authService.authLibrary.tvLendings,
            { itemId: lending.itemId, userId: lending.userId, startDate: lending.startDate });
        this.authService.authLibrary.tvLendings[libraryIndex] = lending;

        let userIndex = _.findIndex(user.tvLendings,
            { itemId: lending.itemId, userId: lending.userId, startDate: lending.startDate });
        user.tvLendings[userIndex] = lending;

        this.set('/libraries/' + this.authService.authLibrary.id + '/tvLendings/',
            this.authService.authLibrary.tvLendings);
        return this.set('/users/' + user.id + '/tvLendings/', user.tvLendings);
    }

    saveTVFavourited(id: number) {
        if (this.authService.authUser.tvsFavourited) {
            this.authService.authUser.tvsFavourited.push(id);
        } else {
            this.authService.authUser.tvsFavourited = [id];
        }

        return this.set('/users/' + this.authService.authUser.id + '/tvsFavourited/',
            this.authService.authUser.tvsFavourited);
    }

    deleteTVFavourited(uid: number) {
        _.remove(this.authService.authUser.tvsFavourited, id => id === uid);

        return this.set('/users/' + this.authService.authUser.id + '/tvsFavourited/',
            this.authService.authUser.tvsFavourited);
    }

    saveUserTVWished(id: number) {
        if (this.authService.authUser.tvsWished) {
            this.authService.authUser.tvsWished.push(id);
        } else {
            this.authService.authUser.tvsWished = [id];
        }

        return this.set('/users/' + this.authService.authUser.id + '/tvsWished/',
            this.authService.authUser.tvsWished);
    }

    deleteUserTVWished(uid: number) {
        _.remove(this.authService.authUser.tvsWished, id => id === uid);

        return this.set('/users/' + this.authService.authUser.id + '/tvsWished/',
            this.authService.authUser.tvsWished);
    }

    saveLibraryTVWished(id: number) {
        if (this.authService.authLibrary.tvsWished) {
            this.authService.authLibrary.tvsWished.push(id);
        } else {
            this.authService.authLibrary.tvsWished = [id];
        }

        this.set('/libraries/' + this.authService.authLibrary.id + '/tvsWished/',
            this.authService.authLibrary.tvsWished);
    }

    deleteLibraryTVWished(uid: number) {
        _.remove(this.authService.authLibrary.tvsWished, id => id === uid);

        return this.set('/libraries/' + this.authService.authLibrary.id + '/tvsWished/',
            this.authService.authLibrary.tvsWished);
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
}
