import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Movie } from '../../common/dto/movie.dto';
import { HttpClient } from '@angular/common/http';
import { MovieDB } from '../../common/dto/movieDB.dto';
import * as _ from 'lodash';

@Component({
    selector: 'app-movies-list-dialog',
    templateUrl: './moviesListDialog.component.html',
})
export class MoviesListDialogComponent implements OnInit {
    apiKey = '?api_key=e50d63dbcb5c1a6c703ea83cfed8cb7c';
    language = '&language=es';
    image = 'https://image.tmdb.org/t/p/original';
    query = '&query=';
    //discover = 'discover/';
    searchUrl = 'https://api.themoviedb.org/3/';
    credits = '&append_to_response=credits';
    movieURL = 'https://www.themoviedb.org/movie/';

    title: string;

    movie: Movie;
    selectedMovie;
    movieList;

    constructor(private dialogRef: MatDialogRef<MoviesListDialogComponent>,
        private http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.title = data;
    }

    ngOnInit() {
        const firstQuery = this.searchUrl + 'search/movie' + this.apiKey + this.query + this.title + this.language;
        this.http.get(firstQuery).subscribe((data: any) => this.movieList = data.results,
            error => console.log(error));
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

                this.movie = {
                    genres,
                    homepage: movie.homepage,
                    url: this.movieURL + movie.id,
                    id: movie.id,
                    overview: movie.overview,
                    poster_path,
                    production_companies,
                    release_date: movie.release_date,
                    runtime: movie.runtime,
                    tagline: movie.tagline,
                    title: movie.title,
                    vote_average,
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
        this.dialogRef.close(this.movie);
    }

}
