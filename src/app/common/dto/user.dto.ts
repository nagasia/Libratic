export interface User {
    id: string;
    name?: string;
    adress?: string;
    email: string;
    phone: string;
    dni?: string;
    userType: string;
    libraryIDs: string[];
    favourites?: string[];
}
