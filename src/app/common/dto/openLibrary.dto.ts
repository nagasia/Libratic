export interface OpenLibraryShort {
    number_of_pages;
    title: string;
    subtitle: string;
    languages: [{
        key: string;
    }];
    publish_country: string;
    publishers: string[];
    description: {
        type: string;
        value: string;
    };
    physical_format: string;
    publish_places: string[];
    isbn_13: string[];
    isbn_10: string[];
    publish_date: string;
    authors: [{
        key: string;
        name: string;
    }];
    subjects: string[];
}

export class OpenLibraryLong {
    publishers: [{ name: string; }];
    title: string;
    url: string;
    number_of_pages;
    cover: {
        small: string;
        large: string;
        medium: string;
    };
    subjects: [{
        url: string;
        name: string;
    }];
    authors: [{
        url: string;
        name: string;
    }];
    publish_date: string;
    publish_places: [{ name: string; }];
}

export class OpenLibraryRequest {
    docs: [{
        cover_i: number;
        author_name: string;
        title: string;
        first_publish_year: number;
        isbn: string[];
    }];
}
