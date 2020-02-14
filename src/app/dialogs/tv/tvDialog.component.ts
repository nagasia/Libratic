import { Component, Inject } from '@angular/core';
import { TvShow } from '../../common/dto/tv.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MatChipInputEvent } from '@angular/material';
import { StorageService } from 'src/app/services/storage.service';
import { FireDBService } from 'src/app/services/fireDB.service';
import { CommonFunctions } from 'src/app/common/commonFunctions';
import { ENTER } from '@angular/cdk/keycodes';
import * as _ from 'lodash';
import { TvListDialogComponent } from '../tvList/tvListDialog.component';

@Component({
    selector: 'app-tv-dialog',
    templateUrl: './tvDialog.component.html',
})
export class TvDialogComponent {
    readonly separatorKeysCodes: number[] = [ENTER];
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;

    created_by = [];
    first_air_date: string;
    genres = [];
    homepage: string;
    url: string;
    id: number;
    name: string;
    number_of_episodes: number;
    number_of_seasons: number;
    overview: string;
    poster_path: string;
    vote_average: number;
    production_companies = [];
    cast: any = [];
    crew: any = [];

    tv: TvShow;
    form: FormGroup;
    newPoster = false;
    founded = false;
    posterEvent;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<TvDialogComponent>,
        private storage: StorageService,
        private db: FireDBService,
        private dialog: MatDialog,
        private functions: CommonFunctions,
        @Inject(MAT_DIALOG_DATA) public editting: TvShow) {
        if (this.editting) {
            this.setDataFromEdit();
        }
        this.form = this.formBuilder.group({
            first_air_date: [this.first_air_date, [Validators.required]],
            homepage: this.homepage,
            name: [this.name, [Validators.required]],
            number_of_episodes: this.number_of_episodes,
            number_of_seasons: this.number_of_seasons,
            vote_average: this.vote_average,
            overview: this.overview,
        });
    }

    private setDataFromEdit() {
        this.first_air_date = this.editting.first_air_date;
        this.homepage = this.editting.homepage;
        this.url = this.editting.url;
        this.id = this.editting.id;
        this.name = this.editting.name;
        this.number_of_episodes = this.editting.number_of_episodes;
        this.number_of_seasons = this.editting.number_of_seasons;
        this.vote_average = this.editting.vote_average;
        this.overview = this.editting.overview;
        this.poster_path = this.editting.poster_path;

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

        if (this.editting.created_by) {
            this.created_by = this.editting.created_by;
        } else {
            this.created_by = [];
        }
    }

    async setDataFromForm() {
        this.first_air_date = Object.assign({}, this.form.value).first_air_date;
        this.homepage = Object.assign({}, this.form.value).homepage;
        this.name = Object.assign({}, this.form.value).name;
        this.number_of_episodes = Object.assign({}, this.form.value).number_of_episodes;
        this.number_of_seasons = Object.assign({}, this.form.value).number_of_seasons;
        this.vote_average = Object.assign({}, this.form.value).vote_average;
        this.overview = Object.assign({}, this.form.value).overview;

        if (!this.founded && !this.editting) {
            this.id = new Date().getTime();
        }

        if (this.newPoster) {
            await this.storage.uploadCover('tvs/' + this.id, this.posterEvent)
                .then(() => {
                    this.poster_path = this.storage.savedPicture;
                })
                .catch(error => console.log(error));
        }

        this.tv = {
            created_by: this.created_by,
            first_air_date: this.first_air_date,
            genres: this.genres,
            homepage: this.homepage,
            url: this.url,
            id: this.id,
            name: this.name,
            number_of_episodes: this.number_of_episodes,
            number_of_seasons: this.number_of_seasons,
            overview: this.overview,
            poster_path: this.poster_path,
            vote_average: this.vote_average,
            production_companies: this.production_companies,
            cast: this.cast,
            crew: this.crew,
        };
        this.tv = this.functions.checkKeys(this.tv);

        this.save();
    }

    private save() {
        if (this.editting) {
            this.db.updateTV(this.tv)
                .then(() => this.onClose('Serie editada', this.tv))
                .catch(error => {
                    console.log(error);
                    this.onClose('Problema al editar la serie');
                });
        } else {
            this.db.saveTV(this.tv)
                .then(() => this.onClose('Serie guardada'))
                .catch(error => {
                    console.log(error);
                    this.onClose('Problema al guardar la serie');
                });
        }
    }

    searchTMDB() {
        this.name = Object.assign({}, this.form.value).name;
        this.first_air_date = Object.assign({}, this.form.value).first_air_date;
        this.founded = false;

        if (this.name || this.first_air_date) {
            const tvDialog = this.dialog.open(TvListDialogComponent, {
                width: '50%',
                data: this.name,
            });

            tvDialog.afterClosed().subscribe((result: TvShow) => {
                if (result) {
                    this.founded = true;

                    this.id = result.id;
                    this.poster_path = result.poster_path;
                    this.url = result.url;
                    this.genres = result.genres;
                    this.production_companies = result.production_companies;
                    this.cast = result.cast;
                    this.crew = result.crew;
                    this.created_by = result.created_by;

                    this.form.patchValue({
                        first_air_date: result.first_air_date,
                        homepage: result.homepage,
                        name: result.name,
                        number_of_episodes: result.number_of_episodes,
                        number_of_seasons: result.number_of_seasons,
                        vote_average: result.vote_average,
                        overview: result.overview,
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
                case 'created_by':
                    this.created_by.push(value.trim());
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
            case 'created_by':
                _.remove(this.created_by, currentItem => currentItem === item);
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
    }

    onClose(motive?: string, tv?: TvShow) {
        if (tv) {
            this.dialogRef.close({ motive, tv });
        } else if (motive) {
            this.dialogRef.close(motive);
        } else {
            this.dialogRef.close();
        }
    }

}
