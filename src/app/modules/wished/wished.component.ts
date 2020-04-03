import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonFunctions } from '../../common/commonFunctions';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import * as _ from 'lodash';
import { MatSnackBar, MatDialog } from '@angular/material';
import { BookSearchDialogComponent } from '../../dialogs/bookSearch/bookSearchDialog.component';
import { MovieSearchDialogComponent } from '../../dialogs/movieSearch/movieSearchDialog.component';
import { TvSearchDialogComponent } from '../../dialogs/tvSearch/tvSearchDialog.component';
import { Movie } from '../../common/dto/movie.dto';
import { Book } from 'src/app/common/dto/book.dto';
import { TvShow } from '../../common/dto/tv.dto';

@Component({
    selector: 'app-wished',
    templateUrl: './wished.component.html',
})
export class WishedComponent implements OnInit, OnDestroy {
    isLoged: boolean;
    isAdmin: boolean;
    bookList = [];
    bookList$;
    movieList = [];
    movieList$;
    tvList = [];
    tvList$;

    constructor(private authService: AuthenticationService,
        private db: FireDBService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        public functions: CommonFunctions) {
        this.isLoged = this.functions.isLoged(this.authService.authUser);
        if (this.isLoged) {
            this.isAdmin = this.functions.isAdmin(this.authService.authUser);
        }
    }

    ngOnInit() {
        if (this.isLoged && this.isAdmin) {
            this.getData(this.authService.authLibrary.id);
        } else if (this.isLoged && !this.isAdmin) {
            this.getData(this.authService.authUser.id);
        }
    }

    private getData(id: string) {
        this.bookList$ = this.db.getListFiltered('books/', '/wishes/' + id, true)
            .subscribe(data => {
                if (data.length !== 0) {
                    this.bookList = data;
                    this.bookList = _.sortBy(this.bookList, 'title');
                }
            }, error => console.log(error));
        this.movieList$ = this.db.getListFiltered('movies/', '/wishes/' + id, true)
            .subscribe(data => {
                if (data.length !== 0) {
                    this.movieList = data;
                    this.movieList = _.sortBy(this.movieList, 'title');
                }
            }, error => console.log(error));
        this.tvList$ = this.db.getListFiltered('tvs/', '/wishes/' + id, true)
            .subscribe(data => {
                if (data.length !== 0) {
                    this.tvList = data;
                    this.tvList = _.sortBy(this.tvList, 'title');
                }
            }, error => console.log(error));
    }

    addBook() {
        const bookDialog = this.dialog.open(BookSearchDialogComponent);

        bookDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteBook(book: Book) {
        if (this.isAdmin) {
            book.wishes[this.authService.authLibrary.id] = null;
        } else {
            book.wishes[this.authService.authUser.id] = null;
        }
        this.db.updateBook(book);
    }

    addMovie() {
        const movieDialog = this.dialog.open(MovieSearchDialogComponent);

        movieDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteMovie(movie: Movie) {
        if (this.isAdmin) {
            movie.wishes[this.authService.authLibrary.id] = null;
        } else {
            movie.wishes[this.authService.authUser.id] = null;
        }
        this.db.updateMovie(movie);
    }

    addTV() {
        const tvDialog = this.dialog.open(TvSearchDialogComponent);

        tvDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteTV(tv: TvShow) {
        if (this.isAdmin) {
            tv.wishes[this.authService.authLibrary.id] = null;
        } else {
            tv.wishes[this.authService.authUser.id] = null;
        }
        this.db.updateTv(tv);
    }

    getNumberOfItems(item: any) {
        return item.owned[this.authService.authLibrary.id].nEjemplares;
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
