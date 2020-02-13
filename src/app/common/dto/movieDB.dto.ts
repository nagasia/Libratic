export interface MovieDB {
    genres: [{
        name: string;
    }];
    homepage: string;
    id: number;
    overview: string;
    poster_path: string;
    production_companies: [{
        name: string;
    }];
    release_date: string;
    runtime: number;
    tagline: string;
    title: string;
    vote_average: number;
    credits: {
        cast: [{
            character: string;
            name: string;
        }];
        crew: [{
            department: string;
            job: string;
            name: string;
        }]
    };
}
