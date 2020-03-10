import { Component, Inject } from '@angular/core';
import { Movie } from '../../common/dto/movie.dto';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatChipInputEvent, MatDialog } from '@angular/material';
import { StorageService } from 'src/app/services/storage.service';
import { FireDBService } from 'src/app/services/fireDB.service';
import { ENTER } from '@angular/cdk/keycodes';
import * as _ from 'lodash';
import { MoviesListDialogComponent } from '../moviesList/moviesListDialog.component';
import { CommonFunctions } from '../../common/commonFunctions';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'app-movie-dialog',
    templateUrl: './movieDialog.component.html',
})
export class MovieDialogComponent {
    readonly separatorKeysCodes: number[] = [ENTER];
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;

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
    nEjemplares: number;

    movie: Movie;
    form: FormGroup;
    newPoster = false;
    founded = false;
    posterEvent;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<MovieDialogComponent>,
        private storage: StorageService,
        private authService: AuthenticationService,
        private db: FireDBService,
        private dialog: MatDialog,
        private functions: CommonFunctions,
        @Inject(MAT_DIALOG_DATA) public editting: Movie) {
        if (this.editting) {
            this.setData();
        }
        this.form = this.formBuilder.group({
            homepage: this.homepage,
            overview: this.overview,
            release_date: [this.release_date, [Validators.required]],
            runtime: this.runtime,
            tagline: this.tagline,
            title: [this.title, [Validators.required]],
            vote_average: this.vote_average,
            nEjemplares: [this.nEjemplares, [Validators.required]],
        });
    }

    private setData() {
        this.nEjemplares = this.editting.owned[this.authService.authLibrary.id].nEjemplares;
        this.homepage = this.editting.homepage;
        this.url = this.editting.url;
        this.id = this.editting.id;
        this.overview = this.editting.overview;
        this.poster_path = this.editting.poster_path;
        this.release_date = this.editting.release_date;
        this.runtime = this.editting.runtime;
        this.tagline = this.editting.tagline;
        this.title = this.editting.title;
        this.vote_average = this.editting.vote_average;


        if (this.editting.cast) {
            this.cast = this.editting.cast;
        } else {
            this.cast = [];
        }

        if (this.editting.crew) {
            this.crew = this.editting.crew;
        } else {
            this.crew = [];
        }

        if (this.editting.genres) {
            this.genres = this.editting.genres;
        } else {
            this.genres = [];
        }

        if (this.editting.production_companies) {
            this.production_companies = this.editting.production_companies;
        } else {
            this.production_companies = [];
        }
    }

    async save() {
        this.homepage = Object.assign({}, this.form.value).homepage;
        this.title = Object.assign({}, this.form.value).title;
        this.overview = Object.assign({}, this.form.value).overview;
        this.release_date = Object.assign({}, this.form.value).release_date;
        this.runtime = Object.assign({}, this.form.value).runtime;
        this.tagline = Object.assign({}, this.form.value).tagline;
        this.vote_average = Object.assign({}, this.form.value).vote_average;
        this.nEjemplares = Object.assign({}, this.form.value).nEjemplares;

        if (this.editting) {
            this.editting.genres = this.genres;
            this.editting.homepage = this.homepage;
            this.editting.url = this.url;
            this.editting.overview = this.overview;
            this.editting.poster_path = this.poster_path;
            this.editting.production_companies = this.production_companies;
            this.editting.release_date = this.release_date;
            this.editting.runtime = this.runtime;
            this.editting.tagline = this.tagline;
            this.editting.title = this.title;
            this.editting.vote_average = this.vote_average;
            this.editting.cast = this.cast;
            this.editting.crew = this.crew;
            this.editting.owned[this.authService.authLibrary.id].nEjemplares = this.nEjemplares;

            this.editting = this.functions.checkKeys(this.editting);

            this.db.updateMovie(this.editting)
                .then(() => this.onClose('Película editada'))
                .catch(error => {
                    console.log(error);
                    this.onClose('Problema al editar la película');
                });
        } else {
            if (!this.founded) {
                this.id = new Date().getTime();
            }

            this.movie = {
                genres: this.genres,
                homepage: this.homepage,
                url: this.url,
                id: this.id,
                overview: this.overview,
                poster_path: this.poster_path,
                production_companies: this.production_companies,
                release_date: this.release_date,
                runtime: this.runtime,
                tagline: this.tagline,
                title: this.title,
                vote_average: this.vote_average,
                cast: this.cast,
                crew: this.crew,
            };
            if (this.newPoster) {
                this.storage.delete('movies/temp' + this.authService.authLibrary.id);
                await this.storage.upload('movies/' + this.id, this.posterEvent)
                    .then(async () => await this.storage.getUrl('movies/' + this.id)
                        .subscribe(url => this.movie.poster_path = url))
                    .catch(error => console.log(error));
            }

            this.movie = this.functions.checkKeys(this.movie);

            this.db.saveMovie(this.movie, this.nEjemplares)
                .then(() => this.onClose('Película guardada'))
                .catch(error => {
                    console.log(error);
                    this.onClose('Problema al guardar la película');
                });
        }
    }

    searchTMDB() {
        this.title = Object.assign({}, this.form.value).title;
        this.release_date = Object.assign({}, this.form.value).release_date;
        this.founded = false;

        if (this.title || this.release_date) {
            const movieDialog = this.dialog.open(MoviesListDialogComponent, {
                width: '50%',
                data: this.title,
            });

            movieDialog.afterClosed().subscribe((result: Movie) => {
                if (result) {
                    this.founded = true;

                    this.id = result.id;
                    this.poster_path = result.poster_path;
                    this.url = result.url;
                    this.genres = result.genres;
                    this.production_companies = result.production_companies;
                    this.cast = result.cast;
                    this.crew = result.crew;

                    this.form.patchValue({
                        homepage: result.homepage,
                        overview: result.overview,
                        release_date: result.release_date,
                        runtime: result.runtime,
                        tagline: result.tagline,
                        title: result.title,
                        vote_average: result.vote_average,
                    });
                }
            },
                error => console.log(error));
        }
    }

    addItem(event: MatChipInputEvent, list: string) {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            switch (list) {
                case 'genres':
                    this.genres.push(value.trim());
                    break;
                case 'production_companies':
                    this.production_companies.push(value.trim());
                    break;
                case 'cast':
                    if (value.includes(':')) {
                        let element = value.split(':');
                        this.cast.push({
                            character: element[0].trim(),
                            name: element[1].trim(),
                        });
                    }
                    break;
                case 'crew':
                    if (value.includes(':')) {
                        let element = value.split(':');
                        this.crew.push({
                            job: element[0].trim(),
                            name: element[1].trim(),
                        });
                    }
                    break;
            }
        }

        if (input) {
            input.value = '';
        }

    }

    removeItem(item: any, list: string) {
        switch (list) {
            case 'genres':
                _.remove(this.genres, currentItem => currentItem === item);
                break;
            case 'production_companies':
                _.remove(this.production_companies, currentItem => currentItem === item);
                break;
            case 'cast':
                _.remove(this.cast, (currentItem: any) => currentItem.character === item.character
                    && currentItem.name === item.name);
                break;
            case 'crew':
                _.remove(this.crew, (currentItem: any) => currentItem.job === item.job
                    && currentItem.name === item.name);
                break;
        }
    }

    setPosterPath(event) {
        this.posterEvent = event;
        this.newPoster = true;

        if (this.editting) {
            this.storage.upload('movies/' + this.id, this.posterEvent)
                .then(() => this.storage.getUrl('movies/' + this.id)
                    .subscribe(url => this.poster_path = url))
                .catch(error => console.log(error));
        } else {
            this.storage.upload('movies/temp' + this.authService.authLibrary.id, this.posterEvent)
                .then(() => this.storage.getUrl('movies/temp' + this.authService.authLibrary.id)
                    .subscribe(url => this.poster_path = url))
                .catch(error => console.log(error));
        }
    }

    onClose(motive?: string) {
        if (motive) {
            this.dialogRef.close(motive);
        } else {
            this.dialogRef.close();
        }
    }

}
