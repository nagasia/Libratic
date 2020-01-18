export interface User {
    id: string;
    name?: string;
    adress?: string;
    email: string;
    phone: string;
    dni?: string;
    userType: string;
    libraryID: string;
    favourites?: string[];
}
