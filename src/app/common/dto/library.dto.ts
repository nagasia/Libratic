import { Lending } from './lendings.dto';
export interface Library {
    id: string;
    adress: string;
    city?: string;
    adminIDs: string[];
    usersIDs?: string[];
    booksIDs?: string[];
    moviesIDs?: number[];
    tvsIDs?: number[];
    bookLendings?: Lending[];
    movieLendings?: Lending[];
    tvLendings?: Lending[];
    bookWished?: string[];
    moviesWished?: number[];
    tvsWished?: number[];
}
