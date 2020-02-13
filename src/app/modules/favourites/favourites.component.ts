import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import * as _ from 'lodash';
import { Book } from '../../common/dto/book.dto';

@Component({
    selector: 'app-favourites',
    templateUrl: './favourites.component.html',
})
export class FavouritesComponent implements OnInit, OnDestroy {
    isLoged = false;
    bookList = [];
    movieList = [];
    tvList = [];
    bookList$;
    bookRef$;
    movieList$;
    movieRef$;
    tvList$;
    tvRef$;

    constructor(private authService: AuthenticationService,
        private db: FireDBService) {
        if (this.authService.authUser) {
            this.isLoged = true;
        }
    }

    ngOnInit() {
        if (this.isLoged) {
            this.bookList$ = this.db.getList('users/' + this.authService.authUser.id + '/bookFavourited/')
                .subscribe(data => {
                    if (data) {
                        data.forEach(isbn => {
                            this.bookRef$ = this.db.getOne('books/' + isbn).subscribe((book: Book) => {
                                const index = _.find(this.bookList, b => b.isbn === book.isbn);
                                if (!index) {
                                    this.bookList.push(book);
                                    this.bookList = _.sortBy(this.bookList, 'title');
                                }
                            });
                        });
                    }
                },
                    error => console.log(error));
            this.movieList$ = this.db.getList('users/' + this.authService.authUser.id + '/moviesFavourited/')
                .subscribe(data => {
                    if (data) {
                        data.forEach(id => {
                            this.bookRef$ = this.db.getOne('movies/' + id)
                                .subscribe(movie => this.movieList.push(movie));
                        });
                        this.movieList = _.sortBy(this.movieList, 'title');
                    }
                },
                    error => console.log(error));
            this.tvList$ = this.db.getList('users/' + this.authService.authUser.id + '/tvsFavourited/')
                .subscribe(data => {
                    if (data) {
                        data.forEach(id => {
                            this.bookRef$ = this.db.getOne('tvs/' + id)
                                .subscribe(tv => this.tvList.push(tv));
                        });
                        this.tvList = _.sortBy(this.tvList, 'title');
                    }
                },
                    error => console.log(error));
        }
    }

    deleteBook(isbn: number) {
        this.db.deleteBookFavourited(isbn)
            .then(() => _.remove(this.bookList, b => b.isbn === isbn));
    }

    deleteMovie(id: number) {
        this.db.deleteMovieFavourited(id)
            .then(() => _.remove(this.movieList, b => b.id === id));
    }

    deleteTV(id: number) {
        this.db.deleteTVFavourited(id)
            .then(() => _.remove(this.tvList, b => b.id === id));
    }

    ngOnDestroy() {
        if (this.bookList$) {
            this.bookList$.unsubscribe();
        }
        if (this.movieList$) {
            this.movieList$.unsubscribe();
        }
        if (this.tvList$) {
            this.tvList$.unsubscribe();
        }
        if (this.bookRef$) {
            this.bookRef$.unsubscribe();
        }
        if (this.movieRef$) {
            this.movieRef$.unsubscribe();
        }
        if (this.tvRef$) {
            this.tvRef$.unsubscribe();
        }
    }
}
