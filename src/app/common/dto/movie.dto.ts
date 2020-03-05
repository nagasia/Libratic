export interface Movie {
    genres: string[];
    homepage: string;
    url?: string;
    id: number;
    overview: string;
    poster_path: string;
    production_companies: string[];
    release_date: string;
    runtime: number;
    tagline: string;
    title: string;
    vote_average: number;
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
