import { Component, OnInit, Inject } from '@angular/core';
import { TvShow } from '../../common/dto/tv.dto';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { TvDb } from 'src/app/common/dto/tvDB.dto';
import * as _ from 'lodash';

@Component({
    selector: 'app-tv-list-dialog',
    templateUrl: './tvListDialog.component.html',
})
export class TvListDialogComponent implements OnInit {
    apiKey = '?api_key=e50d63dbcb5c1a6c703ea83cfed8cb7c';
    language = '&language=es';
    image = 'https://image.tmdb.org/t/p/original';
    query = '&query=';
    // discover = 'discover/';
    searchUrl = 'https://api.themoviedb.org/3/';
    credits = '&append_to_response=credits';
    tvURL = 'https://www.themoviedb.org/tv/';

    name: string;

    tv: TvShow;
    selectedtv;
    tvList;

    constructor(private dialogRef: MatDialogRef<TvListDialogComponent>,
        private http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.name = data;
    }

    ngOnInit() {
        const firstQuery = this.searchUrl + 'search/tv' + this.apiKey + this.query + this.name + this.language;
        this.http.get(firstQuery).subscribe((data: any) => this.tvList = data.results,
            error => console.log(error));
    }

    setTv(event) {
        this.selectedtv = event.value;
    }

    onClick() {
        if (this.selectedtv) {
            const secondQuery = this.searchUrl + 'tv/' + this.selectedtv.id + this.apiKey + this.language + this.credits;
            this.http.get(secondQuery).subscribe((tv: TvDb) => {
                let genres = [];
                if (tv.genres) {
                    tv.genres.forEach(element => genres.push(element.name));
                    genres = genres.sort();
                }

                let production_companies = [];
                if (tv.production_companies) {
                    tv.production_companies.forEach(element => production_companies.push(element.name));
                }

                let cast: any = [];
                if (tv.credits.cast) {
                    tv.credits.cast.forEach(element => {
                        if (element.character && !element.character.includes('(uncredited)')) {
                            cast.push({
                                character: element.character,
                                name: element.name,
                            });
                        }
                    });

                    if (cast.length > 20) {
                        cast = _.dropRight(cast, cast.length - 20);
                    }

                }

                let crew: any = [];
                if (tv.credits.crew) {
                    tv.credits.crew.forEach(element => {
                        if (!element.job.includes('Assistant')) {
                            crew.push({
                                job: element.job,
                                name: element.name,
                            });
                        }
                    });

                    if (crew.length > 20) {
                        crew = _.dropRight(crew, crew.length - 20);
                    }
                }

                let created_by = [];
                if (tv.created_by) {
                    tv.created_by.forEach(element => created_by.push(element.name));
                }

                let poster_path: string;
                if (tv.poster_path) {
                    poster_path = this.image + tv.poster_path;
                }

                let vote_average = tv.vote_average;
                if (tv.vote_average === 0) {
                    vote_average = null;
                }

                this.tv = {
                    genres,
                    homepage: tv.homepage,
                    url: this.tvURL + tv.id,
                    id: tv.id,
                    overview: tv.overview,
                    poster_path,
                    production_companies,
                    first_air_date: tv.first_air_date,
                    number_of_episodes: tv.number_of_episodes,
                    number_of_seasons: tv.number_of_seasons,
                    name: tv.name,
                    vote_average,
                    created_by,
                    cast,
                    crew,
                };
                this.onClose();
            },
                error => console.log(error)
            );
        } else {
            this.onClose();
        }
    }

    onClose() {
        this.dialogRef.close(this.tv);
    }

}
