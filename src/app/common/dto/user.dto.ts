import { Lending } from './lendings.dto';

export interface User {
    id: string;
    name?: string;
    adress?: string;
    city?: string;
    email: string;
    phone?: number;
    dni?: number;
    picture?: string;
    userLevel: string;
    libraryID: string;
    bookFavourited?: string[];
    moviesFavourited?: number[];
    tvsFavourited?: number[];
    bookWished?: string[];
    moviesWished?: number[];
    tvsWished?: number[];
    bookLendings?: Lending[];
    movieLendings?: Lending[];
    tvLendings?: Lending[];
}
