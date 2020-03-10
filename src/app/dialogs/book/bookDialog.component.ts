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
import { AuthenticationService } from '../../services/authentication.service';

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
    //cover: string;
    cover;
    subjects: string[] = [];
    authors: string[] = [];
    publish_date: string;
    publish_places: string[] = [];
    description: string;
    physical_format: string;
    url: string;
    nEjemplares: number;

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
        private authService: AuthenticationService,
        private db: FireDBService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private functions: CommonFunctions,
        @Inject(MAT_DIALOG_DATA) public editting: Book) {
        if (editting) {
            this.setData();
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
            nEjemplares: [this.nEjemplares, [Validators.required]],
        });
    }

    private setData() {
        this.isbn = this.editting.isbn;
        this.cdu = this.editting.cdu;
        this.publishers = this.editting.publishers;
        this.title = this.editting.title;
        this.subtitle = this.editting.subtitle;
        this.number_of_pages = this.editting.number_of_pages;
        this.subjects = this.editting.subjects;
        this.authors = this.editting.authors;
        this.publish_date = this.editting.publish_date;
        this.publish_places = this.editting.publish_places;
        this.description = this.editting.description;
        this.physical_format = this.editting.physical_format;
        this.cover = this.editting.cover;
        this.url = this.editting.url;
        this.nEjemplares = this.editting.owned[this.authService.authLibrary.id].nEjemplares;
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
        this.nEjemplares = Object.assign({}, this.form.value).nEjemplares;
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

        if (this.editting) {
            this.storage.upload('books/' + this.isbn, this.coverEvent)
                .then(() => this.storage.getUrl('books/' + this.isbn)
                    .subscribe(url => this.cover = url))
                .catch(error => console.log(error));
        } else {
            this.storage.upload('books/temp' + this.authService.authLibrary.id, this.coverEvent)
                .then(() => this.storage.getUrl('books/temp' + this.authService.authLibrary.id)
                    .subscribe(url => this.cover = url))
                .catch(error => console.log(error));
        }
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
                                this.physical_format = this.functions.translatePhysicalFormat(resultShort.physical_format);
                                this.url = resultLong.url;
                                this.title = resultShort.title;

                                if (!isNullOrUndefined(resultShort.description)) {
                                    if (typeof resultShort.description === 'string') {
                                        this.description = this.functions.returnDataIfNotUndefined(resultShort.description);
                                    } else {
                                        this.description = this.functions.returnDataIfNotUndefined(resultShort.description.value);
                                    }
                                }

                                if (!isNullOrUndefined(resultLong.cover)) {
                                    this.cover = this.functions.returnDataIfNotUndefined(resultLong.cover.medium);
                                }

                                if (resultShort.publishers) {
                                    this.publishers = resultShort.publishers.sort();
                                } else if (resultLong.publishers) {
                                    this.publishers = this.functions.fillArray(resultLong.publishers).sort();
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
                                    this.authors = this.functions.fillArray(resultShort.authors).sort();
                                } else if (resultLong.authors) {
                                    this.authors = this.functions.fillArray(resultLong.authors).sort();
                                }

                                if (resultShort.subjects) {
                                    this.subjects = resultShort.subjects;
                                    this.subjects.forEach(element => element = element.toLowerCase());
                                    if (resultLong.subjects) {
                                        const temporalList = this.functions.fillArray(resultLong.subjects);
                                        temporalList.forEach(element => {
                                            element = element.toLowerCase();
                                            if (!this.subjects.includes(element)) {
                                                this.subjects.push(element);
                                            }
                                        });
                                    }
                                    this.subjects = this.subjects.sort();
                                } else if (resultLong.subjects) {
                                    this.subjects = this.functions.fillArray(resultLong.subjects).sort();
                                }

                                if (resultShort.publish_places) {
                                    this.publish_places = resultShort.publish_places.sort();
                                } else if (resultLong.publish_places) {
                                    this.publish_places = this.functions.fillArray(resultShort.publish_places).sort();
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

        if (this.editting) {
            this.editting.cdu = this.cdu;
            this.editting.title = this.title;
            this.editting.subtitle = this.subtitle;
            this.editting.number_of_pages = this.number_of_pages;
            this.editting.publish_date = this.publish_date;
            this.editting.description = this.description;
            this.editting.physical_format = this.physical_format;
            this.editting.url = this.url;
            this.editting.publishers = this.publishers;
            this.editting.subjects = this.subjects;
            this.editting.authors = this.authors;
            this.editting.cover = this.cover;
            this.editting.owned[this.authService.authLibrary.id].nEjemplares = this.nEjemplares;

            this.editting = this.functions.checkKeys(this.editting);

            this.db.updateBook(this.editting)
                .then(() => this.onClose('Libro editado'))
                .catch(error => {
                    console.log(error);
                    this.onClose('Problema al editar el libro');
                });
        } else {
            if (this.newCover) {
                this.storage.delete('books/temp' + this.authService.authLibrary.id);
                await this.storage.upload('books/' + this.isbn, this.coverEvent)
                    .then(async () => await this.storage.getUrl('books/' + this.isbn)
                        .subscribe(url => this.book.cover = url))
                    .catch(error => console.log(error));
            }

            this.book = this.functions.checkKeys(this.book);

            this.db.saveBook(this.book, this.nEjemplares)
                .then(() => this.onClose('Libro guardado'))
                .catch(error => {
                    console.log(error);
                    this.onClose('Problema al guardar el libro');
                });
        }
    }

    private parseShortJson(data: any): OpenLibraryShort {
        const dataKeys = Object.keys(data);
        if (dataKeys.length > 0) {
            const [firstKey] = dataKeys;
            return data[firstKey].details;
        } else {
            return null;
        }
    }

    private parseLongJson(data: any): OpenLibraryLong {
        const dataKeys = Object.keys(data);
        const [firstKey] = dataKeys;
        return data[firstKey];
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

    onClose(motive?: string) {
        this.newCover = false;
        this.asked = false;
        if (motive) {
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
