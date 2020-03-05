export interface Book {
    isbn: string;
    cdu?: string;
    publishers: string[];
    title: string;
    subtitle?: string;
    number_of_pages: string;
    cover?: string;
    subjects?: string[];
    authors?: string[];
    publish_date: string;
    publish_places: string[];
    description: string;
    physical_format: string;
    url?: string;
    owned?: any;
    favourites?: any;
    wishes?: any;
}
