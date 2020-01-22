export interface User {
    id: string;
    name?: string;
    adress?: string;
    email: string;
    phone?: string;
    dni?: string;
    userLevel: string;
    libraryID: string;
    favourites?: string[];
    wished?: string[];
}
