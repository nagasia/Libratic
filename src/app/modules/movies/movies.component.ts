import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { CommonFunctions } from '../../common/commonFunctions';
import { Movie } from '../../common/dto/movie.dto';
import * as _ from 'lodash';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MovieDialogComponent } from '../../dialogs/movie/movieDialog.component';
import { FilterDialogComponent } from '../../dialogs/filter/filterDialog.component';
import { Filter } from '../../common/dto/filter.dto';

@Component({
    selector: 'app-movies',
    templateUrl: './movies.component.html',
})
export class MoviesComponent implements OnInit, OnDestroy {
    movies = [];
    isLoged = false;
    isAdmin = false;
    movies$;
    movieFilters: Filter;
    filteredMovies = [];

    constructor(private authService: AuthenticationService,
        private db: FireDBService,
        private functions: CommonFunctions,
        private dialog: MatDialog,
        private snackBar: MatSnackBar) {
        this.isLoged = this.functions.isLoged(this.authService.authUser);
        if (this.isLoged) {
            this.isAdmin = this.functions.isAdmin(this.authService.authUser);
        }
    }

    ngOnInit() {
        if (this.isLoged) {
            this.movies$ = this.db.getListFiltered('movies/', '/owned/' + this.authService.authLibrary.id + '/id/',
                this.authService.authLibrary.id).subscribe(data => {
                    if (data.length > 0) {
                        this.movies = data;
                        this.movies = _.sortBy(this.movies, 'title');
                        this.filteredMovies = _.clone(this.movies);
                        if (this.movieFilters) {
                            this.filteredMovies = this.functions.filterLending(this.movies, this.filteredMovies, this.movieFilters);
                        }
                    }
                },
                    error => console.log(error));
        } else {
            this.movies$ = this.movies$ = this.db.getList('movies/')
                .subscribe(data => {
                    if (data.length > 0) {
                        this.movies = data;
                        this.movies = _.sortBy(this.movies, 'title');
                        this.filteredMovies = _.clone(this.movies);
                        if (this.movieFilters) {
                            this.filteredMovies = this.functions.filterLending(this.movies, this.filteredMovies, this.movieFilters);
                        }
                    }
                },
                    error => console.log(error));
        }
    }

    newMovie() {
        const movieDialog = this.dialog.open(MovieDialogComponent);

        movieDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    editMovie(movie: Movie) {
        const movieDialog = this.dialog.open(MovieDialogComponent, {
            data: movie,
        });

        movieDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteMovie(movie: Movie) {
        let nEjemplares = movie.owned[this.authService.authLibrary.id].nEjemplares;
        nEjemplares -= 1;

        if (nEjemplares <= 0) {
            movie.owned[this.authService.authLibrary.id] = null;
            _.remove(this.movies, movie);
        } else {
            movie.owned[this.authService.authLibrary.id].nEjemplares = nEjemplares;
        }
        this.db.updateMovie(movie);
    }

    addMovieFavoutire(id: number) {
        this.db.saveMovieFavourited(id)
            .then(() => this.snackBar.open('Película añadida a favoritos', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Problema al guardar película en favoritos', '', { duration: 2000 });
            });
    }

    removeMovieFavoutire(movie: Movie) {
        movie.favourites[this.authService.authUser.id] = null;
        this.db.updateMovie(movie)
            .then(() => this.snackBar.open('Favorito eliminado', '', { duration: 2000 }));
    }

    addMovieWished(id: number) {
        this.db.saveMovieWished(id, this.authService.authUser.id)
            .then(() => this.snackBar.open('Película añadida a deseados', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Problema al guardar película en deseados', '', { duration: 2000 });
            });
    }

    removeMovieWished(movie: Movie) {
        movie.wishes[this.authService.authUser.id] = null;
        this.db.updateMovie(movie)
            .then(() => this.snackBar.open('Deseado eliminado', '', { duration: 2000 }));
    }

    getNumberOfItems(item: any) {
        return item.owned[this.authService.authLibrary.id].nEjemplares;
    }

    checkExists(item: Movie, key: string) {
        if (this.functions.returnDataIfNotUndefined(item[key])) {
            if (this.isAdmin) {
                return this.functions.returnDataIfNotUndefined(item[key][this.authService.authLibrary.id]);
            } else {
                return this.functions.returnDataIfNotUndefined(item[key][this.authService.authUser.id]);
            }
        } else {
            return false;
        }
    }

    filter() {
        const filterDialog = this.dialog.open(FilterDialogComponent, {
            data: {
                filterType: 'movie',
                filter: this.movieFilters,
            },
        });

        filterDialog.afterClosed().subscribe(result => {
            this.movieFilters = result;
            if (result) {
                this.filteredMovies = this.functions.filterMovie(this.movies, this.filteredMovies, result);
            } else {
                this.filteredMovies = _.clone(this.movies);
            }
        },
            error => console.log(error));
    }

    ngOnDestroy() {
        if (this.movies$) {
            this.movies$.unsubscribe();
        }
    }
}
