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
    punishment?: boolean;
}
