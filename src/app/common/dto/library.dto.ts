export interface Library {
    id: string;
    name: string;
    adress: string;
    usersID: string[];
    booksID: string[];
    moviesID: string[];
    bookLendings: [{
        bookId: string;
        startDate: string;
        endDate: string;
    }];
    movieLendings: [{
        movieId: string;
        startDate: string;
        endDate: string;
    }];
}
