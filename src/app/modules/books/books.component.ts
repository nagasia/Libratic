import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { CommonFunctions } from '../../common/commonFunctions';
import { MatDialog, MatSnackBar } from '@angular/material';
import { BookDialogComponent } from '../../dialogs/book/bookDialog.component';
import { Book } from '../../common/dto/book.dto';
import * as _ from 'lodash';

@Component({
    selector: 'app-books',
    templateUrl: './books.component.html',
})
export class BooksComponent implements OnInit, OnDestroy {
    isAdmin: boolean;
    isLoged: boolean;
    books = [];
    booksRef$;
    booksList$;

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
            this.booksList$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/booksIDs')
                .subscribe(async list => {
                    if (list) {
                        list.forEach(element => {
                            this.booksRef$ = this.db.getOne('books/' + element).subscribe((book: Book) => {
                                const index = _.find(this.books, b => b.isbn === book.isbn);
                                if (!index) {
                                    this.books.push(book);
                                    this.books = _.sortBy(this.books, 'title');
                                }
                            });
                        });
                    }
                },
                    error => console.log(error));
        } else {
            this.booksList$ = this.db.getList('books')
                .subscribe(list => {
                    if (list) {
                        this.books = list;
                        this.books = _.sortBy(this.books, 'title');
                    }
                },
                    error => console.log(error));
        }

    }

    newBook() {
        const bookDialog = this.dialog.open(BookDialogComponent, {
            width: '50%',
        });

        bookDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteBook(isbn: number) {
        this.db.deleteBook(isbn)
            .then(() => {
                _.remove(this.books, b => b.isbn === isbn);
                this.snackBar.open('Libro borrado', '', { duration: 2000 });
            })
            .catch(error => {
                console.log(error);
                this.snackBar.open('Problema al borrar el libro', '', { duration: 2000 });
            });
    }

    editBook(book: Book) {
        const bookDialog = this.dialog.open(BookDialogComponent, {
            width: '50%',
            data: book,
        });

        bookDialog.afterClosed().subscribe(result => {
            if (result) {
                if (result.book) {
                    const index = _.findIndex(this.books, b => b.isbn === result.book.isbn);
                    this.books[index] = result.book;
                    this.snackBar.open(result.motive, '', { duration: 2000 });
                } else {
                    this.snackBar.open(result, '', { duration: 2000 });
                }
            }
        },
            error => console.log(error));
    }

    addBookFavourite(isbn: number) {
        this.db.saveBookFavourited(isbn)
        .then(() => this.snackBar.open('Libro añadido a favoritos', '', { duration: 2000 }))
        .catch(error => {
            console.log(error);
            this.snackBar.open('Problema al guardar libro en favoritos', '', { duration: 2000 });
        });
    }

    ngOnDestroy() {
        if (this.booksList$) {
            this.booksList$.unsubscribe();
        }
        if (this.booksRef$) {
            this.booksRef$.unsubscribe();
        }
    }

}
