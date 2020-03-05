import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import * as _ from 'lodash';
import { Book } from '../../common/dto/book.dto';
import { Movie } from '../../common/dto/movie.dto';
import { TvShow } from '../../common/dto/tv.dto';

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
    movieList$;
    tvList$;

    constructor(private authService: AuthenticationService,
        private db: FireDBService) {
        if (this.authService.authUser) {
            this.isLoged = true;
        }
    }

    ngOnInit() {
        if (this.isLoged) {
            this.bookList$ = this.db.getListFiltered('books/', '/favourites/' + this.authService.authUser.id, true)
                .subscribe(data => {
                    if (data.length !== 0) {
                        this.bookList = data;
                        this.bookList = _.sortBy(this.bookList, 'title');
                    }
                }, error => console.log(error));
            this.movieList$ = this.db.getListFiltered('movies/', '/favourites/' + this.authService.authUser.id, true)
                .subscribe(data => {
                    if (data.length !== 0) {
                        this.movieList = data;
                        this.movieList = _.sortBy(this.movieList, 'title');
                    }
                }, error => console.log(error));
            this.tvList$ = this.db.getListFiltered('tvs/', '/favourites/' + this.authService.authUser.id, true)
                .subscribe(data => {
                    if (data.length !== 0) {
                        this.tvList = data;
                        this.tvList = _.sortBy(this.tvList, 'title');
                    }
                }, error => console.log(error));
        }
    }

    deleteBook(book: Book) {
        book.favourites[this.authService.authUser.id] = null;
        this.db.updateBook(book);
    }

    deleteMovie(movie: Movie) {
        movie.favourites[this.authService.authUser.id] = null;
        this.db.updateMovie(movie);
    }

    deleteTV(tv: TvShow) {
        tv.favourites[this.authService.authUser.id] = null;
        this.db.updateTv(tv);
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
    }
}
