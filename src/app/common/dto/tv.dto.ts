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
    production_companies: string[];
    cast: [{
        character: string;
        name: string;
    }];
    crew: [{
        name: string;
        job: string;
    }];
}
