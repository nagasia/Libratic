import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonFunctions } from '../../common/commonFunctions';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import * as _ from 'lodash';
import { Book } from 'src/app/common/dto/book.dto';
import { Movie } from 'src/app/common/dto/movie.dto';
import { TvShow } from 'src/app/common/dto/tv.dto';
import { MatSnackBar, MatDialog } from '@angular/material';
import { BookSearchDialogComponent } from '../../dialogs/bookSearch/bookSearchDialog.component';
import { MovieSearchDialogComponent } from '../../dialogs/movieSearch/movieSearchDialog.component';
import { TvSearchDialogComponent } from '../../dialogs/tvSearch/tvSearchDialog.component';

@Component({
    selector: 'app-wished',
    templateUrl: './wished.component.html',
})
export class WishedComponent implements OnInit, OnDestroy {
    isLoged: boolean;
    isAdmin: boolean;
    bookList = [];
    bookList$;
    bookRef$;
    movieList = [];
    movieList$;
    movieRef$;
    tvList = [];
    tvList$;
    tvRef$;

    constructor(private authService: AuthenticationService,
        private db: FireDBService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private functions: CommonFunctions) {
        this.isLoged = this.functions.isLoged(this.authService.authUser);
        if (this.isLoged) {
            this.isAdmin = this.functions.isAdmin(this.authService.authUser);
        }
    }

    ngOnInit() {
        if (this.isLoged && this.isAdmin) {
            this.bookList$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/bookWished/')
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
            this.movieList$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/moviesWished/')
                .subscribe(data => {
                    if (data) {
                        data.forEach(id => {
                            this.bookRef$ = this.db.getOne('movies/' + id).subscribe((movie: Movie) => {
                                const index = _.find(this.movieList, b => b.id === movie.id);
                                if (!index) {
                                    this.movieList.push(movie);
                                    this.movieList = _.sortBy(this.movieList, 'title');
                                }
                            });
                        });
                    }
                },
                    error => console.log(error));
            this.tvList$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/tvsWished/')
                .subscribe(data => {
                    if (data) {
                        data.forEach(id => {
                            this.bookRef$ = this.db.getOne('tvs/' + id).subscribe((tv: TvShow) => {
                                const index = _.find(this.tvList, b => b.id === tv.id);
                                if (!index) {
                                    this.tvList.push(tv);
                                    this.tvList = _.sortBy(this.tvList, 'title');
                                }
                            });
                        });

                    }
                },
                    error => console.log(error));
        } else if (this.isLoged && !this.isAdmin) {
            this.bookList$ = this.db.getList('users/' + this.authService.authUser.id + '/bookWished/')
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
            this.movieList$ = this.db.getList('users/' + this.authService.authUser.id + '/moviesWished/')
                .subscribe(data => {
                    if (data) {
                        data.forEach(id => {
                            this.bookRef$ = this.db.getOne('movies/' + id).subscribe((movie: Movie) => {
                                const index = _.find(this.movieList, b => b.id === movie.id);
                                if (!index) {
                                    this.movieList.push(movie);
                                    this.movieList = _.sortBy(this.movieList, 'title');
                                }
                            });
                        });
                    }
                },
                    error => console.log(error));
            this.tvList$ = this.db.getList('users/' + this.authService.authUser.id + '/tvsWished/')
                .subscribe(data => {
                    if (data) {
                        data.forEach(id => {
                            this.bookRef$ = this.db.getOne('tvs/' + id).subscribe((tv: TvShow) => {
                                const index = _.find(this.tvList, b => b.id === tv.id);
                                if (!index) {
                                    this.tvList.push(tv);
                                    this.tvList = _.sortBy(this.tvList, 'title');
                                }
                            });
                        });

                    }
                },
                    error => console.log(error));
        }
    }

    addBook() {
        const bookDialog = this.dialog.open(BookSearchDialogComponent, {
            width: '50%',
        });

        bookDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteBook(isbn: string) {
        if (this.isAdmin) {
            this.db.deleteLibraryBookWished(isbn)
                .then(() => _.remove(this.bookList, b => b.isbn === isbn));
        } else {
            this.db.deleteUserBookWished(isbn)
                .then(() => _.remove(this.bookList, b => b.isbn === isbn));
        }
    }

    addMovie() {
        const movieDialog = this.dialog.open(MovieSearchDialogComponent, {
            width: '50%',
        });

        movieDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteMovie(id: number) {
        if (this.isAdmin) {
            this.db.deleteLibraryMovieWished(id)
                .then(() => _.remove(this.movieList, b => b.id === id));
        } else {
            this.db.deleteUserMovieWished(id)
                .then(() => _.remove(this.movieList, b => b.id === id));
        }
    }

    addTV() {
        const tvDialog = this.dialog.open(TvSearchDialogComponent, {
            width: '50%',
        });

        tvDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteTV(id: number) {
        if (this.isAdmin) {
            this.db.deleteLibraryTVWished(id)
                .then(() => _.remove(this.tvList, b => b.id === id));
        } else {
            this.db.deleteUserTVWished(id)
                .then(() => _.remove(this.tvList, b => b.id === id));
        }
    }

    ngOnDestroy() {
        if (this.bookList$) {
            this.bookList$.unsubscribe();
        }
        if (this.bookRef$) {
            this.bookRef$.unsubscribe();
        }
        if (this.movieList$) {
            this.movieList$.unsubscribe();
        }
        if (this.movieRef$) {
            this.movieRef$.unsubscribe();
        }
        if (this.tvList$) {
            this.tvList$.unsubscribe();
        }
        if (this.tvRef$) {
            this.tvRef$.unsubscribe();
        }
    }

}
