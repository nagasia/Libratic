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
    itemList$;
    userList$;
    lendingList$;
    itemRef$;

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
        //todos los libros que puedo prestar

        //obtener todos los libros que tengo
        let myItems$ = this.db.getListFiltered('books/', 'owned/' + this.authService.authLibrary.id,
            this.authService.authLibrary.id).subscribe((books: Book[]) => {
                if (books) {
                    //obtener todos los libros prestados
                    let myLended = this.db.getListFiltered('lendings/' + this.authService.authLibrary.id, 'active', true)
                        .subscribe((lendings: Lending[]) => {
                            //ids de libros que no tengo prestados

                            //libros no prestados
                        }, error => console.log(error));
                }

            }, error => console.log(error));














        //obtener todos los libros prestados alguna vez
        this.lendingList$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/bookLendings/')
            .subscribe(data => {
                //obtener los ids de los libros prestados activos
                let lendedIds = [];
                if (data) {
                    const lendedList = _.filter(data, { active: true });
                    lendedList.forEach((element: Lending) => lendedIds.push(element.itemId));
                }

                //obtener todos los ids de los libros q tengo
                this.itemList$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/booksIDs')
                    .subscribe(list => {
                        if (list) {
                            //obtener los ids de los libros que no tengo prestados
                            const freeItems = _.difference(list, lendedIds);

                            //obtener los libros no prestados
                            freeItems.forEach(element => {
                                this.itemRef$ = this.db.getOne('books/' + element).subscribe((book: Book) => {
                                    this.itemList.push(book);
                                    this.itemList = _.sortBy(this.itemList, 'title');
                                });
                            });
                        }
                    },
                        error => console.log(error));
            });
    }

    private caseMovie() {
        this.lendingList$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/movieLendings/')
            .subscribe(data => {
                let lendedIds = [];
                if (data) {
                    const lendedList = _.filter(data, { active: true });
                    lendedList.forEach((element: Lending) => lendedIds.push(element.itemId));
                }

                this.itemList$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/moviesIDs')
                    .subscribe(list => {
                        if (list) {
                            const freeItems = _.difference(list, lendedIds);

                            freeItems.forEach(element => {
                                this.itemRef$ = this.db.getOne('movies/' + element).subscribe((movie: Movie) => {
                                    this.itemList.push(movie);
                                    this.itemList = _.sortBy(this.itemList, 'title');
                                });
                            });
                        }
                    },
                        error => console.log(error));
            });
    }

    private caseTv() {
        this.lendingList$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/tvLendings/')
            .subscribe(data => {
                let lendedIds = [];
                if (data) {
                    const lendedList = _.filter(data, { active: true });
                    lendedList.forEach((element: Lending) => lendedIds.push(element.itemId));
                }

                this.itemList$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/tvsIDs')
                    .subscribe(list => {
                        if (list) {
                            const freeItems = _.difference(list, lendedIds);

                            freeItems.forEach(element => {
                                this.itemRef$ = this.db.getOne('tvs/' + element).subscribe((tv: TvShow) => {
                                    this.itemList.push(tv);
                                    this.itemList = _.sortBy(this.itemList, 'name');
                                });
                            });
                        }
                    },
                        error => console.log(error));
            });
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

    private save() {
        this.db.saveLending(this.newLending)
            .then(() => this.onClose('Préstamo guardado'))
            .catch(error => {
                console.log(error);
                this.onClose('Problema al guardar el préstamo');
            });
    }

    onClose(motive?: string) {
        this.dialogRef.close();
    }

    ngOnDestroy() {
        if (this.itemList$) {
            this.itemList$.unsubscribe();
        }
        if (this.userList$) {
            this.userList$.unsubscribe();
        }
        if (this.lendingList$) {
            this.lendingList$.unsubscribe();
        }
        if (this.itemRef$) {
            this.itemRef$.unsubscribe();
        }
    }
}
