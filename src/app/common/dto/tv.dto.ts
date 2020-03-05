export interface TvShow {
    created_by: string[];
    first_air_date: string;
    genres: string[];
    homepage: string;
    url?: string;
    id: number;
    name: string;
    number_of_episodes: number;
    number_of_seasons: number;
    overview: string;
    poster_path: string;
    vote_average: number;
    production_companies: string[];
    cast: [{
        character: string;
        name: string;
    }];
    crew: [{
        job: string;
        name: string;
    }];
    owned?: any;
    favourites?: any;
    wishes?: any;
}
