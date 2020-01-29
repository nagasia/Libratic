export interface Library {
    id: string;
    adress: string;
    city?: string;
    adminIDs: string[];
    usersIDs?: string[];
    booksIDs?: string[];
    moviesIDs?: string[];
    tvsIDs?: string[];
    bookLendings?: [{
        bookId: string;
        startDate: string;
        endDate: string;
    }];
    movieLendings?: [{
        movieId: string;
        startDate: string;
        endDate: string;
    }];
    tvLendings?: [{
        tvId: string;
        startDate: string;
        endDate: string;
    }];
}
