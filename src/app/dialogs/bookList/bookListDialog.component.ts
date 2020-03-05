import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { CommonFunctions } from 'src/app/common/commonFunctions';
import { Book } from '../../common/dto/book.dto';
import { OpenLibraryRequest, OpenLibraryShort, OpenLibraryLong } from '../../common/dto/openLibrary.dto';
import { map } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import * as _ from 'lodash';

@Component({
    selector: 'app-book-list-dialog',
    templateUrl: './bookListDialog.component.html',
})
export class BookListDialogComponent implements OnInit {
    imageStart = 'http://covers.openlibrary.org/b/id/';
    imageEnd = '-M.jpg';
    queryStart = 'http://openlibrary.org/search.json?q=';
    addAuthor = 'author:';
    addSubject = 'subject:';
    addTitle = 'title:';
    addYear = 'publish_year:';
    addPublisher: 'publisher:';

    urlStart = 'https://openlibrary.org/api/books?bibkeys=ISBN:';
    urlShortEnd = '&jscmd=details&format=json';
    urlLongEnd = '&jscmd=data&format=json';

    book: Book;
    selectedBook;
    booksList;
    isbn: string;
    isbn84: string[] = [];
    finished = false;
    founded = false;

    constructor(private dialogRef: MatDialogRef<BookListDialogComponent>,
        private http: HttpClient,
        public functions: CommonFunctions,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.data = this.functions.checkKeys(data);
    }

    ngOnInit() {
        let firstQuery = this.queryStart;

        const dataKeys = Object.keys(this.data);
        dataKeys.forEach(element => {
            if (this.data[element]) {
                switch (element) {
                    case 'title':
                        if (firstQuery !== this.queryStart) {
                            firstQuery += '@';
                        }
                        firstQuery += this.addTitle + this.data.title;
                        break;
                    case 'author':
                        if (firstQuery !== this.queryStart) {
                            firstQuery += '@';
                        }
                        firstQuery += this.addAuthor + this.data.author;
                        break;
                    case 'subject':
                        if (firstQuery !== this.queryStart) {
                            firstQuery += '@';
                        }

                        this.data.subject.forEach((subject, index) => {
                            if (index === 0) {
                                firstQuery += this.addSubject + subject;
                            } else {
                                firstQuery += '@' + this.addSubject + subject;
                            }
                        });

                        break;
                    case 'year':
                        if (firstQuery !== this.queryStart) {
                            firstQuery += '@';
                        }
                        firstQuery += this.addYear + this.data.year;
                        break;
                    case 'publisher':
                        if (firstQuery !== this.queryStart) {
                            firstQuery += '@';
                        }
                        firstQuery += this.addPublisher + this.data.publisher;
                        break;
                }
            }
        });

        this.http.get(firstQuery).subscribe((data: OpenLibraryRequest) => {
            this.finished = true;
            if (data && data.docs.length > 0) {
                this.booksList = data.docs;
                this.founded = true;
            }
        },
            error => console.log(error));
    }

    setBook(event) {
        this.selectedBook = event.value;
    }

    async onClick() {
        this.setIsbn();

        await this.http.get(this.urlStart + this.isbn + this.urlShortEnd)
            .pipe(map(data => this.parseShortJson(data)))
            .subscribe(async (resultShort: Promise<OpenLibraryShort>) => {
                await this.http.get(this.urlStart + this.isbn + this.urlLongEnd)
                    .pipe(map(data2 => this.parseLongJson(data2)))
                    .subscribe(async (resultLong: OpenLibraryLong) => {
                        const subtitle = (await resultShort).subtitle;
                        const physical_format = this.functions.translatePhysicalFormat((await resultShort).physical_format);
                        const url = resultLong.url;
                        const title = (await resultShort).title;

                        let description;
                        if (!isNullOrUndefined((await resultShort).description)) {
                            if (typeof (await resultShort).description === 'string') {
                                description = this.returnDataIfNotUndefined((await resultShort).description);
                            } else {
                                description = this.returnDataIfNotUndefined((await resultShort).description.value);
                            }
                        }

                        let cover;
                        if (!isNullOrUndefined(resultLong.cover)) {
                            cover = this.returnDataIfNotUndefined(resultLong.cover.medium);
                        } else if (!isNullOrUndefined(this.selectedBook.cover_i)) {
                            cover = this.imageStart + this.selectedBook.cover_i + this.imageEnd;
                        }

                        let publishers;
                        if ((await resultShort).publishers) {
                            publishers = (await resultShort).publishers.sort();
                        } else if (resultLong.publishers) {
                            publishers = this.functions.fillArray(resultLong.publishers).sort();
                        }

                        let number_of_pages;
                        if ((await resultShort).number_of_pages) {
                            number_of_pages = (await resultShort).number_of_pages;
                        } else if (resultLong.number_of_pages) {
                            number_of_pages = resultLong.number_of_pages;
                        }

                        let publish_date;
                        if ((await resultShort).publish_date) {
                            publish_date = (await resultShort).publish_date;
                        } else if (resultLong.publish_date) {
                            publish_date = resultLong.publish_date;
                        }

                        let authors;
                        if ((await resultShort).authors) {
                            authors = this.functions.fillArray((await resultShort).authors).sort();
                        } else if (resultLong.authors) {
                            authors = this.functions.fillArray(resultLong.authors).sort();
                        }

                        let subjects;
                        if ((await resultShort).subjects) {
                            subjects = (await resultShort).subjects;
                            subjects.forEach(element => element = element.toLowerCase());
                            if (resultLong.subjects) {
                                const temporalList = this.functions.fillArray(resultLong.subjects);
                                temporalList.forEach(element => {
                                    element = element.toLowerCase();
                                    if (!subjects.includes(element)) {
                                        subjects.push(element);
                                    }
                                });
                            }
                            subjects = subjects.sort();
                        } else if (resultLong.subjects) {
                            subjects = this.functions.fillArray(resultLong.subjects).sort();
                        }

                        let publish_places;
                        if ((await resultShort).publish_places) {
                            publish_places = (await resultShort).publish_places.sort();
                        } else if (resultLong.publish_places) {
                            publish_places = this.functions.fillArray((await resultShort).publish_places).sort();
                        }

                        this.book = {
                            isbn: this.isbn,
                            publishers,
                            title,
                            subtitle,
                            number_of_pages,
                            cover,
                            subjects,
                            authors,
                            publish_date,
                            publish_places,
                            description,
                            physical_format,
                            url,
                        };

                        this.book = this.functions.checkKeys(this.book);
                        this.save();
                    });
            });
    }

    private setIsbn() {
        for (const element of this.selectedBook.isbn) {
            if ((element.length === 13 && element.startsWith('97884')) || element.startsWith('84')) {
                this.isbn84.push(element);
            }

            if (this.isbn84.length > 0) {
                this.isbn = this.isbn84[0];
            } else {
                this.isbn = this.selectedBook.isbn[0];
            }
        }
    }

    private async parseShortJson(data: any): Promise<OpenLibraryShort> {
        const dataKeys = Object.keys(data);

        if (dataKeys.length > 0) {
            const [firstKey] = dataKeys;
            return data[firstKey].details;
        } else {
            if (this.isbn84.length > 0) {
                const newIndex = _.indexOf(this.isbn84, this.isbn) + 1;
                if (this.isbn84.length > newIndex) {
                    this.isbn = this.isbn84[newIndex];
                }
            } else {
                this.isbn = this.selectedBook.isbn[0];
            }

            await this.http.get(this.urlStart + this.isbn + this.urlShortEnd)
                .pipe(map(data2 => this.parseShortJson(data2)));
        }
    }

    private parseLongJson(data: any): OpenLibraryLong {
        const dataKeys = Object.keys(data);
        const [firstKey] = dataKeys;
        return data[firstKey];
    }

    private returnDataIfNotUndefined(data: any) {
        if (!isNullOrUndefined(data)) {
            return data;
        } else {
            return null;
        }
    }

    private save() {
        this.onCLose();
    }

    onCLose() {
        this.dialogRef.close(this.book);
    }
}
