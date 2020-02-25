import { Component, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA, MatChipInputEvent } from '@angular/material';
import { FireDBService } from '../../services/fireDB.service';
import { StorageService } from '../../services/storage.service';
import { Book } from '../../common/dto/book.dto';
import { ENTER } from '@angular/cdk/keycodes';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { OpenLibraryShort, OpenLibraryLong } from 'src/app/common/dto/openLibrary.dto';
import { isNullOrUndefined } from 'util';
import { CommonFunctions } from '../../common/commonFunctions';

@Component({
    selector: 'app-book-dialog',
    templateUrl: './bookDialog.component.html',
})
export class BookDialogComponent implements OnDestroy {
    readonly separatorKeysCodes: number[] = [ENTER];
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;

    form: FormGroup;
    isbn: string;
    cdu: string;
    publishers: string[] = [];
    title: string;
    subtitle: string;
    number_of_pages = null;
    cover: string;
    subjects: string[] = [];
    authors: string[] = [];
    publish_date: string;
    publish_places: string[] = [];
    description: string;
    physical_format: string;
    url: string;

    formats: string[] = ['Tapa dura', 'Tapa blanda', 'Electrónico', 'Libro de bolsillo', 'Encuadernado en espiral'];
    urlStart = 'https://openlibrary.org/api/books?bibkeys=ISBN:';
    urlShortEnd = '&jscmd=details&format=json';
    urlLongEnd = '&jscmd=data&format=json';
    book: Book;
    newCover = false;
    asked = false;
    coverEvent;
    books$;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<BookDialogComponent>,
        private storage: StorageService,
        private db: FireDBService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private functions: CommonFunctions,
        @Inject(MAT_DIALOG_DATA) public editting: Book) {
        if (editting) {
            this.isbn = editting.isbn;
            this.cdu = editting.cdu;
            this.publishers = editting.publishers;
            this.title = editting.title;
            this.subtitle = editting.subtitle;
            this.number_of_pages = editting.number_of_pages;
            this.subjects = editting.subjects;
            this.authors = editting.authors;
            this.publish_date = editting.publish_date;
            this.publish_places = editting.publish_places;
            this.description = editting.description;
            this.physical_format = editting.physical_format;
            this.cover = editting.cover;
            this.url = editting.url;
        }
        this.form = this.formBuilder.group({
            isbn: [this.isbn, [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
            cdu: this.cdu,
            title: [this.title, [Validators.required]],
            subtitle: this.subtitle,
            number_of_pages: this.number_of_pages,
            publish_date: [this.publish_date, [Validators.required]],
            description: this.description,
            physical_format: this.physical_format,
            url: this.url,
        });
    }

    save() {
        this.isbn = Object.assign({}, this.form.value).isbn;
        this.cdu = Object.assign({}, this.form.value).cdu;
        this.title = Object.assign({}, this.form.value).title;
        this.subtitle = Object.assign({}, this.form.value).subtitle;
        this.number_of_pages = Object.assign({}, this.form.value).number_of_pages;
        this.publish_date = Object.assign({}, this.form.value).publish_date;
        this.description = Object.assign({}, this.form.value).description;
        this.physical_format = Object.assign({}, this.form.value).physical_format;
        this.url = Object.assign({}, this.form.value).url;
        this.asked = false;

        this.books$ = this.db.getOne('books/' + this.isbn).subscribe((books: Book) => {
            if (!books) {
                if (!this.book) {
                    this.book = {
                        isbn: this.isbn,
                        cdu: this.cdu,
                        publishers: this.publishers,
                        title: this.title,
                        subtitle: this.subtitle,
                        number_of_pages: this.number_of_pages,
                        cover: this.cover,
                        subjects: this.subjects,
                        authors: this.authors,
                        publish_date: this.publish_date,
                        publish_places: this.publish_places,
                        description: this.description,
                        physical_format: this.physical_format,
                        url: this.url,
                    };

                    this.saveBook();
                }
            } else {
                this.book = books;
                this.saveBook();
            }
        }, error => {
            console.log(error);
            this.onClose();
        });
    }

    setCover(event) {
        this.coverEvent = event;
        this.newCover = true;
    }

    async searchOpenLibrary() {
        this.asked = true;
        this.isbn = Object.assign({}, this.form.value).isbn;

        if (this.isbn) {
            await this.http.get(this.urlStart + this.isbn + this.urlShortEnd)
                .pipe(map(data => this.parseShortJson(data)))
                .subscribe(async (resultShort: OpenLibraryShort) => {
                    if (!isNullOrUndefined(resultShort)) {
                        await this.http.get(this.urlStart + this.isbn + this.urlLongEnd)
                            .pipe(map(data => this.parseLongJson(data)))
                            .subscribe(async (resultLong: OpenLibraryLong) => {
                                this.subtitle = resultShort.subtitle;
                                this.physical_format = this.translatePhysicalFormat(resultShort.physical_format);
                                this.url = resultLong.url;
                                this.title = resultShort.title;

                                if (!isNullOrUndefined(resultShort.description)) {
                                    this.description = this.returnDataIfNotUndefined(resultShort.description.value);
                                }

                                if (!isNullOrUndefined(resultLong.cover)) {
                                    this.cover = this.returnDataIfNotUndefined(resultLong.cover.medium);
                                }

                                if (resultShort.publishers) {
                                    this.publishers = resultShort.publishers.sort();
                                } else if (resultLong.publishers) {
                                    this.publishers = this.fillArray(resultLong.publishers).sort();
                                }

                                if (resultShort.number_of_pages) {
                                    this.number_of_pages = resultShort.number_of_pages;
                                } else if (resultLong.number_of_pages) {
                                    this.number_of_pages = resultLong.number_of_pages;
                                }

                                if (resultShort.publish_date) {
                                    this.publish_date = resultShort.publish_date;
                                } else if (resultLong.publish_date) {
                                    this.publish_date = resultLong.publish_date;
                                }

                                if (resultShort.authors) {
                                    this.authors = this.fillArray(resultShort.authors).sort();
                                } else if (resultLong.authors) {
                                    this.authors = this.fillArray(resultLong.authors).sort();
                                }

                                if (resultShort.subjects) {
                                    this.subjects = resultShort.subjects;
                                    this.subjects.forEach(element => element = element.toLowerCase());
                                    if (resultLong.subjects) {
                                        const temporalList = this.fillArray(resultLong.subjects);
                                        temporalList.forEach(element => {
                                            element = element.toLowerCase();
                                            if (!this.subjects.includes(element)) {
                                                this.subjects.push(element);
                                            }
                                        });
                                    }
                                    this.subjects = this.subjects.sort();
                                } else if (resultLong.subjects) {
                                    this.subjects = this.fillArray(resultLong.subjects).sort();
                                }

                                if (resultShort.publish_places) {
                                    this.publish_places = resultShort.publish_places.sort();
                                } else if (resultLong.publish_places) {
                                    this.publish_places = this.fillArray(resultShort.publish_places).sort();
                                }

                                this.form.patchValue({
                                    isbn: this.isbn,
                                    cdu: this.cdu,
                                    publishers: this.publishers,
                                    title: this.title,
                                    subtitle: this.subtitle,
                                    number_of_pages: this.number_of_pages,
                                    subjects: this.subjects,
                                    authors: this.authors,
                                    publish_date: this.publish_date,
                                    publish_places: this.publish_places,
                                    description: this.description,
                                    physical_format: this.physical_format,
                                    url: this.url,
                                });

                                this.asked = false;
                                this.snackBar.open('Libro encontrado', '', { duration: 2000 });
                            });
                    } else {
                        this.asked = false;
                        this.snackBar.open('Libro no encontrado', '', { duration: 2000 });
                    }
                });
        }
    }

    private async saveBook() {
        if (this.books$) {
            this.books$.unsubscribe();
        }

        if (this.newCover) {
            await this.storage.uploadCover('books/' + this.isbn, this.coverEvent)
                .then(() => {
                    this.book.cover = this.storage.savedPicture;
                })
                .catch(error => console.log(error));
        }

        if (this.editting) {
            this.book.cdu = this.cdu;
            this.book.title = this.title;
            this.book.subtitle = this.subtitle;
            this.book.number_of_pages = this.number_of_pages;
            this.book.publish_date = this.publish_date;
            this.book.description = this.description;
            this.book.physical_format = this.physical_format;
            this.book.url = this.url;
            this.book = this.functions.checkKeys(this.book);

            this.db.updateBook(this.book)
                .then(() => this.onClose('Libro editado', this.book))
                .catch(error => {
                    console.log(error);
                    this.onClose('Problema al editar el libro');
                });
        } else {
            this.book = this.functions.checkKeys(this.book);

            this.db.saveBook(this.book)
                .then(() => this.onClose('Libro guardado'))
                .catch(error => {
                    console.log(error);
                    this.onClose('Problema al guardar el libro');
                });
        }
    }

    private parseShortJson(data: any): OpenLibraryShort {
        const dataKeys = Object.keys(data);
        const [firstKey] = dataKeys;
        return data[firstKey].details;
    }

    private parseLongJson(data: any): OpenLibraryLong {
        const dataKeys = Object.keys(data);
        const [firstKey] = dataKeys;
        return data[firstKey];
    }

    private fillArray(data: any) {
        let result;
        if (data !== undefined) {
            result = [];
            data.forEach(element => result.push(element.name));
        }
        return result;
    }

    private returnDataIfNotUndefined(data: any) {
        if (!isNullOrUndefined(data)) {
            return data;
        } else {
            return null;
        }
    }

    private translatePhysicalFormat(fortmat: string): string {
        let result;
        switch (fortmat) {
            case 'Paperback': case 'Mass Market Paperback':
                result = this.formats[3];
                break;
            case 'Hardcover':
                result = this.formats[0];
                break;
            case 'Spiral-bound':
                result = this.formats[4];
                break;
        }
        return result;
    }

    addItem(event: MatChipInputEvent, list: string) {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            switch (list) {
                case 'subjects':
                    this.subjects.push(value.trim());
                    break;
                case 'publishers':
                    this.publishers.push(value.trim());
                    break;
                case 'authors':
                    this.authors.push(value.trim());
                    break;
                case 'publish_places':
                    this.publish_places.push(value.trim());
                    break;
            }
        }

        if (input) {
            input.value = '';
        }

    }

    removeItem(item: string, list: string) {
        switch (list) {
            case 'subjects':
                _.remove(this.subjects, (currentSubject: string) => currentSubject === item);
                break;
            case 'publishers':
                _.remove(this.publishers, (currentPublisher: string) => currentPublisher === item);
                break;
            case 'authors':
                _.remove(this.authors, (currentAuthor: string) => currentAuthor === item);
                break;
            case 'publish_places':
                _.remove(this.publish_places, (currentPlace: string) => currentPlace === item);
                break;
        }
    }

    onClose(motive?: string, book?: Book) {
        this.newCover = false;
        this.asked = false;
        if (book) {
            this.dialogRef.close({ motive, book });
        } else if (motive) {
            this.dialogRef.close(motive);
        } else {
            this.dialogRef.close();
        }
    }

    ngOnDestroy() {
        if (this.books$) {
            this.books$.unsubscribe();
        }
    }

}
