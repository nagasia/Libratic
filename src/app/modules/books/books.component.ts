import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { CommonFunctions } from '../../common/commonFunctions';
import { MatDialog, MatSnackBar } from '@angular/material';
import { BookDialogComponent } from '../../dialogs/book/bookDialog.component';
import { Book } from '../../common/dto/book.dto';
import * as _ from 'lodash';
import { FilterDialogComponent } from '../../dialogs/filter/filterDialog.component';
import { Filter } from '../../common/dto/filter.dto';

@Component({
    selector: 'app-books',
    templateUrl: './books.component.html',
})
export class BooksComponent implements OnInit, OnDestroy {
    isAdmin: boolean;
    isLoged: boolean;
    books = [];
    booksList$;
    filters: Filter;
    filteredBooks = [];

    constructor(private authService: AuthenticationService,
        private db: FireDBService,
        private functions: CommonFunctions,
        private dialog: MatDialog,
        private snackBar: MatSnackBar) {
        this.isLoged = false;
        this.isAdmin = false;

        if (this.authService.authUser) {
            this.isLoged = true;
            this.isAdmin = this.functions.isAdmin(this.authService.authUser);
        }
    }

    ngOnInit() {
        if (this.isLoged) {
            this.booksList$ = this.db.getListFiltered('books/', '/owned/' + this.authService.authLibrary.id + '/id/',
                this.authService.authLibrary.id).subscribe(list => {
                    if (list.length !== 0) {
                        this.books = list;
                        this.books = _.sortBy(this.books, 'title');
                        this.filteredBooks = _.clone(this.books);
                        if (this.filters) {
                            this.filteredBooks = this.functions.filterBook(this.books, this.filteredBooks, this.filters);
                        }
                    }
                },
                    error => console.log(error));
        } else {
            this.booksList$ = this.db.getList('books')
                .subscribe(list => {
                    if (list.length !== 0) {
                        this.books = list;
                        this.books = _.sortBy(this.books, 'title');
                        this.filteredBooks = _.clone(this.books);
                        if (this.filters) {
                            this.filteredBooks = this.functions.filterBook(this.books, this.filteredBooks, this.filters);
                        }
                    }
                },
                    error => console.log(error));
        }
    }

    newBook() {
        const bookDialog = this.dialog.open(BookDialogComponent);

        bookDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteBook(book) {
        let nEjemplares = book.owned[this.authService.authLibrary.id].nEjemplares;
        nEjemplares -= 1;

        if (nEjemplares <= 0) {
            book.owned[this.authService.authLibrary.id] = null;
            _.remove(this.books, book);
            _.remove(this.filteredBooks, book);
        } else {
            book.owned[this.authService.authLibrary.id].nEjemplares = nEjemplares;
        }
        this.db.updateBook(book);
    }

    editBook(book: Book) {
        const bookDialog = this.dialog.open(BookDialogComponent, {
            data: book,
        });

        bookDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    addBookFavourite(isbn: string) {
        this.db.saveBookFavourited(isbn)
            .then(() => this.snackBar.open('Libro añadido a favoritos', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Problema al guardar libro en favoritos', '', { duration: 2000 });
            });
    }

    removeBookFavourite(book: Book) {
        book.favourites[this.authService.authUser.id] = null;
        this.db.updateBook(book)
            .then(() => this.snackBar.open('Favorito eliminado', '', { duration: 2000 }));
    }

    addBookWished(isbn: string) {
        this.db.saveBookWished(isbn, this.authService.authUser.id)
            .then(() => this.snackBar.open('Libro añadido a deseados', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Problema al guardar libro en deseados', '', { duration: 2000 });
            });
    }

    removeBookWished(book: Book) {
        book.wishes[this.authService.authUser.id] = null;
        this.db.updateBook(book)
            .then(() => this.snackBar.open('Deseado eliminado', '', { duration: 2000 }));
    }

    getNumberOfItems(item: any) {
        return item.owned[this.authService.authLibrary.id].nEjemplares;
    }

    checkExists(item: Book, key: string) {
        if (this.functions.returnDataIfNotUndefined(item[key])) {
            if (this.isAdmin) {
                return this.functions.returnDataIfNotUndefined(item[key][this.authService.authLibrary.id]);
            } else {
                return this.functions.returnDataIfNotUndefined(item[key][this.authService.authUser.id]);
            }
        } else {
            return false;
        }
    }

    filter() {
        const filterDialog = this.dialog.open(FilterDialogComponent, {
            data: {
                filterType: 'book',
                filter: this.filters,
            },
        });

        filterDialog.afterClosed().subscribe(result => {
            this.filters = result;
            if (result) {
                this.filteredBooks = this.functions.filterBook(this.books, this.filteredBooks, result);
            } else {
                this.filteredBooks = _.clone(this.books);
            }
        },
            error => console.log(error));
    }

    ngOnDestroy() {
        if (this.booksList$) {
            this.booksList$.unsubscribe();
        }
    }

}
