export interface TvDb {
    created_by: [{
        name: string;
    }];
    first_air_date: string;
    genres: [{
        name: string;
    }];
    homepage: string;
    id: number;
    name: string;
    number_of_episodes: number;
    number_of_seasons: number;
    overview: string;
    poster_path: string;
    vote_average: number;
    production_companies: [{
        name: string;
    }];
    credits: {
        cast: [{
            character: string;
            name: string;
        }];
        crew: [{
            department: string;
            name: string;
            job: string;
        }];
    };
}
