import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Lending } from '../../common/dto/lendings.dto';
import { User } from '../../common/dto/user.dto';
import * as _ from 'lodash';
import { Book } from '../../common/dto/book.dto';
import { Movie } from '../../common/dto/movie.dto';
import { TvShow } from '../../common/dto/tv.dto';

@Component({
    selector: 'app-lending-dialog',
    templateUrl: './lendingDialog.component.html',
})
export class LendingDialogComponent implements OnInit, OnDestroy {
    form: FormGroup;
    items: any;
    users: User;

    itemList: any[] = [];
    userList: User[];
    newLending: Lending;
    lendings: any[];
    showItemList: any[];
    itemList$;
    userList$;
    myItems$;
    myLended$;

    constructor(private dialogRef: MatDialogRef<LendingDialogComponent>,
        private authService: AuthenticationService,
        private db: FireDBService,
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public itemType: string) {

        this.form = this.formBuilder.group({
            items: [this.items, [Validators.required]],
            users: [this.users, [Validators.required]],
        });
    }

    ngOnInit() {
        this.userList$ = this.db.getListFiltered('users/', 'libraryID', this.authService.authLibrary.id)
            .subscribe((users: User[]) => {
                if (users.length !== 0) {
                    this.userList = _.sortBy(users, 'name');
                    _.remove(this.userList, { punishment: true });
                }
            },
                error => console.log(error));

        switch (this.itemType) {
            case 'book':
                this.caseBook();
                break;
            case 'movie':
                this.caseMovie();
                break;
            case 'tv':
                this.caseTv();
                break;
        }
    }

    private caseBook() {
        this.myItems$ = this.db.getListFiltered('books/', 'owned/' + this.authService.authLibrary.id + '/id',
            this.authService.authLibrary.id).subscribe((books: Book[]) => {
                if (books.length > 0) {
                    this.myLended$ = this.db.getListFiltered('lendings/' + this.authService.authLibrary.id, 'active', true)
                        .subscribe((lendings: Lending[]) => {
                            if (lendings.length > 0) {
                                this.lendings = lendings;

                                const booksIds: string[] = [];
                                books.forEach(element => booksIds.push(element.isbn));

                                const lendingIds: string[] = [];
                                lendings.forEach(element => lendingIds.push(element.itemId));

                                let noLended = _.difference(booksIds, lendingIds);

                                const lendedIds = _.intersection(booksIds, lendingIds);
                                const lendedBooks = _.filter(books, b => lendedIds.includes(b.isbn));
                                lendedBooks.forEach(book => {
                                    const countLended = _.filter(lendings, { itemId: book.isbn }).length;
                                    if (book.owned[this.authService.authLibrary.id].nEjemplares > countLended) {
                                        noLended.push(book.isbn);
                                    }
                                });

                                this.itemList = _.filter(books, b => noLended.includes(b.isbn));
                                this.showItemList = _.clone(this.itemList);
                            } else {
                                this.itemList = books;
                                this.showItemList = _.clone(this.itemList);
                            }
                            this.itemList = _.sortBy(this.itemList, 'title');
                        }, error => console.log(error));
                }
            }, error => console.log(error));
    }

    private caseMovie() {
        this.myItems$ = this.db.getListFiltered('movies/', 'owned/' + this.authService.authLibrary.id + '/id',
            this.authService.authLibrary.id).subscribe((movies: Movie[]) => {
                if (movies.length > 0) {
                    this.myLended$ = this.db.getListFiltered('lendings/' + this.authService.authLibrary.id, 'active', true)
                        .subscribe((lendings: Lending[]) => {
                            if (lendings.length > 0) {
                                this.lendings = lendings;

                                const moviesIds: number[] = [];
                                movies.forEach(element => moviesIds.push(element.id));

                                const lendingIds: number[] = [];
                                lendings.forEach(element => lendingIds.push(element.itemId));

                                let noLended = _.difference(moviesIds, lendingIds);

                                const lendedIds = _.intersection(moviesIds, lendingIds);
                                const lendedMovies = _.filter(movies, b => lendedIds.includes(b.id));
                                lendedMovies.forEach(movie => {
                                    const countLended = _.filter(lendings, { itemId: movie.id }).length;
                                    if (movie.owned[this.authService.authLibrary.id].nEjemplares > countLended) {
                                        noLended.push(movie.id);
                                    }
                                });

                                this.itemList = _.filter(movies, b => noLended.includes(b.id));
                                this.showItemList = _.clone(this.itemList);
                            } else {
                                this.itemList = movies;
                                this.showItemList = _.clone(this.itemList);
                            }
                            this.itemList = _.sortBy(this.itemList, 'title');
                        }, error => console.log(error));
                }
            }, error => console.log(error));
    }

    private caseTv() {
        this.myItems$ = this.db.getListFiltered('tvs/', 'owned/' + this.authService.authLibrary.id + '/id',
            this.authService.authLibrary.id).subscribe((tvs: TvShow[]) => {
                if (tvs.length > 0) {
                    this.myLended$ = this.db.getListFiltered('lendings/' + this.authService.authLibrary.id, 'active', true)
                        .subscribe((lendings: Lending[]) => {
                            if (lendings.length > 0) {
                                this.lendings = lendings;

                                const tvsIds: number[] = [];
                                tvs.forEach(element => tvsIds.push(element.id));

                                const lendingIds: number[] = [];
                                lendings.forEach(element => lendingIds.push(element.itemId));

                                let noLended = _.difference(tvsIds, lendingIds);

                                const lendedIds = _.intersection(tvsIds, lendingIds);
                                const lendedTvs = _.filter(tvs, b => lendedIds.includes(b.id));
                                lendedTvs.forEach(movie => {
                                    const countLended = _.filter(lendings, { itemId: movie.id }).length;
                                    if (movie.owned[this.authService.authLibrary.id].nEjemplares > countLended) {
                                        noLended.push(movie.id);
                                    }
                                });

                                this.itemList = _.filter(tvs, b => noLended.includes(b.id));
                                this.showItemList = _.clone(this.itemList);
                            } else {
                                this.itemList = tvs;
                                this.showItemList = _.clone(this.itemList);
                            }
                            this.itemList = _.sortBy(this.itemList, 'name');
                        }, error => console.log(error));
                }
            }, error => console.log(error));
    }

    getData() {
        this.items = Object.assign({}, this.form.value).items;
        this.users = Object.assign({}, this.form.value).users;

        const startDate = new Date().getTime();
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;

        this.newLending = {
            itemId: '',
            itemName: '',
            userId: this.users.id,
            userName: this.users.name,
            startDate,
            endDate: 0,
            active: true,
            late: false,
            itemType: this.itemType,
        };

        switch (this.itemType) {
            case 'tv':
                this.newLending.itemName = this.items.name;
                this.newLending.endDate = startDate + (oneDayMilliseconds * 7);
                this.newLending.itemId = this.items.id;
                break;
            case 'book':
                this.newLending.itemName = this.items.title;
                this.newLending.endDate = startDate + (oneDayMilliseconds * 7);
                this.newLending.itemId = this.items.isbn;
                break;
            case 'movie':
                this.newLending.itemName = this.items.title;
                this.newLending.endDate = startDate + (oneDayMilliseconds * 3);
                this.newLending.itemId = this.items.id;
                break;
        }

        this.save();
    }

    filterLended(event: any) {
        this.showItemList = _.clone(this.itemList);

        const userLendings = _.filter(this.lendings, { userId: event.value.id });
        let itemsIds = [];
        userLendings.forEach(element => itemsIds.push(element.itemId));

        switch (this.itemType) {
            case 'book':
                _.remove(this.showItemList, b => itemsIds.includes(b.isbn));
                break;
            case 'movie': case 'tv':
                _.remove(this.showItemList, b => itemsIds.includes(b.id));
                break;
        }
    }

    private save() {
        this.db.saveLending(this.newLending)
            .then(() => this.onClose('Préstamo guardado'))
            .catch(error => {
                console.log(error);
                this.onClose('Problema al guardar el préstamo');
            });
    }

    onClose(motive?: string) {
        if (motive) {
            this.dialogRef.close(motive);
        } else {
            this.dialogRef.close();
        }
    }

    ngOnDestroy() {
        if (this.userList$) {
            this.userList$.unsubscribe();
        }
        if (this.myItems$) {
            this.myItems$.unsubscribe();
        }
        if (this.myLended$) {
            this.myLended$.unsubscribe();
        }
    }
}
