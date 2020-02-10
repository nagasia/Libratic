import { Lending } from './lendings.dto';
export interface Library {
    id: string;
    adress: string;
    city?: string;
    adminIDs: string[];
    usersIDs?: string[];
    booksIDs?: number[];
    moviesIDs?: number[];
    tvsIDs?: number[];
    bookLendings?: Lending[];
    movieLendings?: Lending[];
    tvLendings?: Lending[];
    bookWished?: number[];
    moviesWished?: number[];
    tvsWished?: number[];
}
