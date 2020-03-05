import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { CommonFunctions } from '../../common/commonFunctions';
import { Lending } from '../../common/dto/lendings.dto';
import { LendingDialogComponent } from '../../dialogs/lending/lendingDialog.component';
import * as _ from 'lodash';

@Component({
    selector: 'app-lendings',
    templateUrl: './lendings.component.html',
})
export class LendingsComponent implements OnInit, OnDestroy {
    isLoged: boolean;
    isAdmin: boolean;

    bookList: Lending[];
    movieList: Lending[];
    tvList: Lending[];
    lendingList$;
    bookList$;
    movieList$;
    tvList$;

    constructor(private authService: AuthenticationService,
        private db: FireDBService,
        private functions: CommonFunctions,
        private dialog: MatDialog,
        private snackBar: MatSnackBar) {
        this.isLoged = this.functions.isLoged(this.authService.authUser);
        if (this.isLoged) {
            this.isAdmin = this.functions.isAdmin(this.authService.authUser);
        }
    }

    ngOnInit() {
        this.lendingList$ = this.db.getListFiltered('lendings/' + this.authService.authLibrary.id, 'active', true)
            .subscribe((data: Lending[]) => {
                if (data.length !== 0) {
                    if (!this.isAdmin) {
                        data = _.filter(data, { userId: this.authService.authUser.id });
                    }

                    this.bookList = _.filter(data, { itemType: 'book' });
                    this.bookList = this.checkLateReturns(this.bookList);
                    _.sortBy(this.bookList, ['late', 'itemName']);

                    this.movieList = _.filter(data, { itemType: 'movie' });
                    this.movieList = this.checkLateReturns(this.movieList);
                    _.sortBy(this.movieList, ['late', 'itemName']);

                    this.tvList = _.filter(data, { itemType: 'tv' });
                    this.tvList = this.checkLateReturns(this.tvList);
                    _.sortBy(this.tvList, ['late', 'itemName']);
                }
            },
                error => console.log(error));
    }

    checkLateReturns(list: Lending[]) {
        const actualDate = new Date().getTime();
        list.forEach((item) => {
            if (!item.late) {
                if ((item.endDate - actualDate) <= 0) {
                    item.late = true;
                }

                if (item.late) {
                    this.db.changePunishment(item.userId, true);
                    this.db.updateLending(item);
                }
            }
        });
        return list;
    }

    newBookLending() {
        const bookDialog = this.dialog.open(LendingDialogComponent, {
            width: '30%',
            data: 'book',
        });

        bookDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    newMovieLending() {
        const bookDialog = this.dialog.open(LendingDialogComponent, {
            width: '30%',
            data: 'movie',
        });

        bookDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    newTVLending() {
        const bookDialog = this.dialog.open(LendingDialogComponent, {
            width: '30%',
            data: 'tv',
        });

        bookDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    editLending(item: Lending, type: string) {
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;

        switch (type) {
            case 'book':
                item.endDate += (oneDayMilliseconds * 7);
                this.updateList(this.bookList, item);
                this.saveLending(item);
                break;
            case 'movie':
                item.endDate += (oneDayMilliseconds * 3);
                this.updateList(this.movieList, item);
                this.saveLending(item);
                break;
            case 'tv':
                item.endDate += (oneDayMilliseconds * 7);
                this.updateList(this.tvList, item);
                this.saveLending(item);
                break;
        }
    }

    private updateList(list: Lending[], item: Lending) {
        const bookIndex = _.findIndex(list,
            { itemId: item.itemId, userId: item.userId, startDate: item.startDate });
        list[bookIndex] = item;
    }

    returnLending(item: Lending, type: string) {
        item.active = false;

        switch (type) {
            case 'book':
                this.updateList(this.bookList, item);
                break;
            case 'movie':
                this.updateList(this.movieList, item);
                break;
            case 'tv':
                this.updateList(this.tvList, item);
                break;
        }

        if (item.late) {
            this.checkPunishments(item);
        }

        this.saveLending(item);
    }

    private checkPunishments(item: Lending) {
        const books = _.filter(this.bookList, { active: true, userId: item.userId, late: true });
        const movies = _.filter(this.movieList, { active: true, userId: item.userId, late: true });
        const tvs = _.filter(this.tvList, { active: true, userId: item.userId, late: true });

        if (!books && !movies && !tvs) {
            this.db.changePunishment(item.userId, false);
        }
    }

    private saveLending(item: Lending) {
        this.db.updateLending(item)
            .then(() => this.snackBar.open('Operación exitosa', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Problema con la operación', '', { duration: 2000 });
            });
    }

    translateDate(time: number): string {
        const date = new Date(time);
        return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
    }

    ngOnDestroy() {
        if (this.lendingList$) {
            this.lendingList$.unsubscribe();
        }
    }
}
