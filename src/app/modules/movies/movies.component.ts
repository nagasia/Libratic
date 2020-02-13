import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { CommonFunctions } from '../../common/commonFunctions';
import { Movie } from '../../common/dto/movie.dto';
import * as _ from 'lodash';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MovieDialogComponent } from '../../dialogs/movie/movieDialog.component';

@Component({
    selector: 'app-movies',
    templateUrl: './movies.component.html',
})
export class MoviesComponent implements OnInit, OnDestroy {
    movies = [];
    isLoged = false;
    isAdmin = false;
    movies$;
    movieRef$;

    constructor(private authService: AuthenticationService,
        private db: FireDBService,
        private functions: CommonFunctions,
        private dialog: MatDialog,
        private snackBar: MatSnackBar) { }

    ngOnInit() {
        this.isLoged = this.functions.isLoged(this.authService.authUser);
        if (this.isLoged) {
            this.isAdmin = this.functions.isAdmin(this.authService.authUser);
        }

        if (this.isLoged) {
            this.movies$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/moviesIDs/')
                .subscribe(ids => {
                    ids.forEach(element => {
                        this.movieRef$ = this.db.getOne('movies/' + element).subscribe((movie: Movie) => {
                            const index = _.find(this.movies, b => b.id === movie.id);
                            if (!index) {
                                this.movies.push(movie);
                                this.movies = _.sortBy(this.movies, 'title');
                            }
                        });
                    });
                },
                    error => console.log(error));
        } else {
            this.movies$ = this.movies$ = this.db.getList('movies/')
                .subscribe(data => {
                    this.movies = data;
                    this.movies = _.sortBy(this.movies, 'title');
                },
                    error => console.log(error));
        }
    }

    newMovie() {
        const movieDialog = this.dialog.open(MovieDialogComponent, {
            width: '50%',
        });

        movieDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    editMovie(movie: Movie) {
        const movieDialog = this.dialog.open(MovieDialogComponent, {
            width: '50%',
            data: movie,
        });

        movieDialog.afterClosed().subscribe(result => {
            if (result.movie) {
                const index = _.findIndex(this.movies, b => b.id === result.movie.id);
                this.movies[index] = result.movie;
                this.snackBar.open(result.motive, '', { duration: 2000 });
            } else if (result) {
                this.snackBar.open(result.motive, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteMovie(id: number) {
        this.db.deleteMovie(id).then(() => {
            this.movies = _.remove(this.movies, b => b.id === id);
            this.snackBar.open('Película borrada', '', { duration: 2000 });
        }).catch(error => {
            console.log(error);
            this.snackBar.open('Problema al borrar la película', '', { duration: 2000 });
        });
    }

    addMovieFavoutire(id: number) {
        this.db.saveMovieFavourited(id)
            .then(() => this.snackBar.open('Película añadida a favoritos', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Problema al guardar película en favoritos', '', { duration: 2000 });
            });
    }

    ngOnDestroy() {
        if (this.movies$) {
            this.movies$.unsubscribe();
        }
        if (this.movieRef$) {
            this.movieRef$.unsubscribe();
        }
    }
}
