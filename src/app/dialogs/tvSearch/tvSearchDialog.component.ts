import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material';
import { FireDBService } from 'src/app/services/fireDB.service';
import { CommonFunctions } from 'src/app/common/commonFunctions';
import { TvShow } from 'src/app/common/dto/tv.dto';
import { TvListDialogComponent } from '../tvList/tvListDialog.component';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'app-tv-search-dialog',
    templateUrl: './tvSearchDialog.component.html',
})
export class TvSearchDialogComponent {
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
    genresSelected: string[] = [];
    genresWSelected: string[] = [];
    orderBy: string;
    founded = false;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<TvSearchDialogComponent>,
        private authService: AuthenticationService,
        private db: FireDBService,
        private dialog: MatDialog,
        private functions: CommonFunctions) {
        this.form = this.formBuilder.group({
            first_air_date: this.first_air_date,
            name: this.name,
            vote_average: this.vote_average,
            genresSelected: this.genresSelected,
            genresWSelected: this.genresWSelected,
            orderBy: this.orderBy,
        });
    }

    searchTMDB() {
        this.name = Object.assign({}, this.form.value).name;
        this.first_air_date = Object.assign({}, this.form.value).first_air_date;
        this.vote_average = Object.assign({}, this.form.value).vote_average;
        this.genresSelected = Object.assign({}, this.form.value).genresSelected;
        this.genresWSelected = Object.assign({}, this.form.value).genresWSelected;
        this.orderBy = Object.assign({}, this.form.value).orderBy;
        this.founded = false;

        let tvDialog;
        if (this.name) {
            tvDialog = this.dialog.open(TvListDialogComponent, {
                width: '50%',
                data: this.name,
            });
        } else if (this.first_air_date || this.vote_average || this.genresSelected || this.genresWSelected) {
            tvDialog = this.dialog.open(TvListDialogComponent, {
                width: '50%',
                data: {
                    first_air_date: this.first_air_date,
                    vote_average: this.vote_average,
                    genresSelected: this.genresSelected,
                    genresWSelected: this.genresWSelected,
                    orderBy: this.orderBy,
                },
            });
        }

        if (tvDialog) {
            tvDialog.afterClosed().subscribe((result: TvShow) => {
                if (result) {
                    this.founded = true;
                    this.tv = result;

                    this.id = result.id;
                    this.poster_path = result.poster_path;
                    this.url = result.url;
                    this.genres = result.genres;
                    this.production_companies = result.production_companies;
                    this.cast = result.cast;
                    this.crew = result.crew;
                    this.created_by = result.created_by;
                    this.homepage = result.homepage;
                    this.number_of_episodes = result.number_of_episodes;
                    this.number_of_seasons = result.number_of_seasons;
                    this.overview = result.overview;

                    this.form.patchValue({
                        first_air_date: result.first_air_date,
                        name: result.name,
                        vote_average: result.vote_average,
                    });
                }
            },
                error => console.log(error));
        }
    }

    save() {
        this.db.updateTv(this.tv)
            .then(() => {
                if (this.functions.isAdmin(this.authService.authUser)) {
                    this.db.saveTvWished(this.tv.id, this.authService.authLibrary.id)
                        .then(() => this.onClose('Serie deseada agregada'))
                        .catch(error => {
                            console.log(error);
                            this.onClose('Problema al guardar la serie deseada');
                        });
                } else {
                    this.db.saveTvWished(this.tv.id, this.authService.authUser.id)
                        .then(() => this.onClose('Serie deseada agregada'))
                        .catch(error => {
                            console.log(error);
                            this.onClose('Problema al guardar la serie deseada');
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
