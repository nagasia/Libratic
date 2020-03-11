import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Movie } from '../../common/dto/movie.dto';
import { HttpClient } from '@angular/common/http';
import { MovieDB } from '../../common/dto/movieDB.dto';
import * as _ from 'lodash';
import { CommonFunctions } from '../../common/commonFunctions';

@Component({
    selector: 'app-movies-list-dialog',
    templateUrl: './moviesListDialog.component.html',
})
export class MoviesListDialogComponent implements OnInit {
    apiKey = '?api_key=e50d63dbcb5c1a6c703ea83cfed8cb7c';
    language = '&language=es';
    image = 'https://image.tmdb.org/t/p/original';
    searchUrl = 'https://api.themoviedb.org/3/';
    credits = '&append_to_response=credits';
    movieURL = 'https://www.themoviedb.org/movie/';

    search = 'search/movie';
    query = '&query=';
    title: string;

    discover = 'discover/movie';
    releaseDate = '&release_date.gte=';
    runtime = '&with_runtime.gte=';
    voteAverage = '&vote_average.gte=';
    genres = '&with_genres=';
    orderBy = '&sort_by=';
    release_date: string;
    run_time: number;
    vote_average: number;
    genresSelected: string[];
    order_by: string;

    movie: Movie;
    isFinished = false;
    isFounded = false;
    selectedMovie;
    movieList;

    constructor(private dialogRef: MatDialogRef<MoviesListDialogComponent>,
        private http: HttpClient,
        public functions: CommonFunctions,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        if (typeof this.data === 'string') {
            this.title = data;
        } else {
            this.release_date = this.data.release_date;
            this.run_time = this.data.runtime;
            this.vote_average = this.data.vote_average;
            this.genresSelected = this.data.genresSelected;
            this.order_by = this.data.orderBy;
        }
    }

    ngOnInit() {
        if (typeof this.data === 'string') {
            const firstQuery = this.searchUrl + this.search + this.apiKey + this.query + this.title + this.language;
            this.http.get(firstQuery).subscribe((data: any) => {
                if (data && data.results.length > 0) {
                    this.movieList = data.results;
                    this.isFounded = true;
                }
                this.isFinished = true;
            },
                error => console.log(error));
        } else {
            let firstQuery = this.searchUrl + this.discover + this.apiKey;

            if (this.release_date) {
                firstQuery += this.releaseDate + this.release_date;
            }

            if (this.run_time) {
                firstQuery += this.runtime + this.run_time;
            }

            if (this.vote_average) {
                firstQuery += this.voteAverage + this.vote_average;
            }

            if (this.genresSelected) {
                firstQuery += this.genres + this.genresSelected.join(',');
            }

            if (this.order_by) {
                firstQuery += this.orderBy + this.order_by;
            }

            this.http.get(firstQuery + this.language).subscribe((data: any) => {
                if (data && data.results.length > 0) {
                    this.movieList = data.results;
                    this.isFounded = true;
                }
                this.isFinished = true;
            },
                error => console.log(error));
        }
    }

    setMovie(event) {
        this.selectedMovie = event.value;
    }

    onClick() {
        if (this.selectedMovie) {
            const secondQuery = this.searchUrl + 'movie/' + this.selectedMovie.id + this.apiKey + this.language + this.credits;
            this.http.get(secondQuery).subscribe((movie: MovieDB) => {
                let genres = [];
                if (movie.genres) {
                    movie.genres.forEach(element => genres.push(element.name));
                    genres = genres.sort();
                }

                let production_companies = [];
                if (movie.production_companies) {
                    movie.production_companies.forEach(element => production_companies.push(element.name));
                }

                let cast: any = [];
                if (movie.credits.cast) {
                    movie.credits.cast.forEach(element => {
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
                if (movie.credits.crew) {
                    movie.credits.crew.forEach(element => {
                        if ((element.job.includes('Producer') || element.job.includes('Director')
                            || element.job.includes('Author') || element.job.includes('Dialogue')
                            || element.job.includes('Composer') || element.job.includes('Musician'))
                            && !element.job.includes('Assistant')) {
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

                let poster_path: string;
                if (movie.poster_path) {
                    poster_path = this.image + movie.poster_path;
                }

                let vote_average = movie.vote_average;
                if (movie.vote_average === 0) {
                    vote_average = null;
                }

                let tagline: string;
                if (movie.tagline && movie.overview) {
                    if (movie.overview !== movie.tagline) {
                        tagline = movie.tagline;
                    } else {
                        tagline = null;
                    }
                }

                this.movie = {
                    genres,
                    homepage: movie.homepage,
                    url: this.movieURL + movie.id,
                    id: movie.id,
                    overview: movie.overview,
                    poster_path,
                    production_companies,
                    release_date: this.functions.reverseDate(movie.release_date),
                    runtime: movie.runtime,
                    tagline,
                    title: movie.title,
                    vote_average,
                    cast,
                    crew,
                };
                this.movie = this.functions.checkKeys(this.movie);
                this.onClose();
            },
                error => console.log(error)
            );
        } else {
            this.onClose();
        }
    }

    onClose() {
        this.dialogRef.close(this.movie);
    }

}
