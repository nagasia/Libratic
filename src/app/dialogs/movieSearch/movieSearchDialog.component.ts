import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material';
import { FireDBService } from 'src/app/services/fireDB.service';
import { CommonFunctions } from 'src/app/common/commonFunctions';
import { Movie } from 'src/app/common/dto/movie.dto';
import { MoviesListDialogComponent } from '../moviesList/moviesListDialog.component';
import * as _ from 'lodash';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'app-movie-search-dialog',
    templateUrl: './movieSearchDialog.component.html',
})
export class MovieSearchDialogComponent {
    genres: string[] = [];
    homepage: string;
    url?: string;
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    production_companies: string[] = [];
    release_date: string;
    runtime: number;
    tagline: string;
    vote_average: number;
    cast: any = [];
    crew: any = [];

    movie: Movie;
    form: FormGroup;
    genresSelected: string[] = [];
    orderBy: string;
    founded = false;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<MovieSearchDialogComponent>,
        private authService: AuthenticationService,
        private db: FireDBService,
        private dialog: MatDialog,
        private functions: CommonFunctions) {
        this.form = this.formBuilder.group({
            release_date: this.release_date,
            runtime: this.runtime,
            title: this.title,
            vote_average: this.vote_average,
            genresSelected: this.genresSelected,
            orderBy: this.orderBy,
        });
    }

    searchTMDB() {
        this.title = Object.assign({}, this.form.value).title;
        this.release_date = Object.assign({}, this.form.value).release_date;
        this.runtime = Object.assign({}, this.form.value).runtime;
        this.vote_average = Object.assign({}, this.form.value).vote_average;
        this.genresSelected = Object.assign({}, this.form.value).genresSelected;
        this.orderBy = Object.assign({}, this.form.value).orderBy;
        this.founded = false;

        let movieDialog;
        if (this.title) {
            movieDialog = this.dialog.open(MoviesListDialogComponent, {
                width: '50%',
                data: this.title,
            });
        } else if (this.release_date || this.runtime || this.vote_average || this.genresSelected) {
            movieDialog = this.dialog.open(MoviesListDialogComponent, {
                width: '50%',
                data: {
                    release_date: this.release_date,
                    runtime: this.runtime,
                    vote_average: this.vote_average,
                    genresSelected: this.genresSelected,
                    orderBy: this.orderBy,
                },
            });
        }

        if (movieDialog) {
            movieDialog.afterClosed().subscribe((result: Movie) => {
                if (result) {
                    this.founded = true;
                    this.movie = result;

                    this.id = result.id;
                    this.poster_path = result.poster_path;
                    this.url = result.url;
                    this.genres = result.genres;
                    this.production_companies = result.production_companies;
                    this.cast = result.cast;
                    this.crew = result.crew;
                    this.homepage = result.homepage;
                    this.overview = result.overview;
                    this.tagline = result.tagline;

                    this.form.patchValue({
                        release_date: result.release_date,
                        runtime: result.runtime,
                        title: result.title,
                        vote_average: result.vote_average,
                    });
                }
            },
                error => console.log(error));
        }
    }

    save() {
        this.db.updateMovie(this.movie)
            .then(() => {
                if (this.functions.isAdmin(this.authService.authUser)) {
                    this.db.saveMovieWished(this.movie.id, this.authService.authLibrary.id)
                        .then(() => this.onClose('Película deseada agregada'))
                        .catch(error => {
                            console.log(error);
                            this.onClose('Problema al guardar la película deseada');
                        });
                } else {
                    this.db.saveMovieWished(this.movie.id, this.authService.authUser.id)
                        .then(() => this.onClose('Película deseada agregada'))
                        .catch(error => {
                            console.log(error);
                            this.onClose('Problema al guardar la película deseada');
                        });
                }
            })
            .catch(error => console.log(error));
    }

    onClose(motive?: string) {
        if (motive) {
            this.dialogRef.close(motive);
        } else {
            this.dialogRef.close();
        }
    }

}
