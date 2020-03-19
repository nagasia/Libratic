import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { CommonFunctions } from '../../common/commonFunctions';
import { Lending } from '../../common/dto/lendings.dto';
import { LendingDialogComponent } from '../../dialogs/lending/lendingDialog.component';
import * as _ from 'lodash';
import { FilterDialogComponent } from '../../dialogs/filter/filterDialog.component';
import { Filter } from '../../common/dto/filter.dto';

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
    bookFilters: Filter;
    movieFilters: Filter;
    tvFilters: Filter;
    filteredBooks = [];
    filteredMovies = [];
    filteredTvs = [];

    constructor(private authService: AuthenticationService,
        private db: FireDBService,
        public functions: CommonFunctions,
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
                    _.sortBy(this.bookList, ['itemName']);
                    this.filteredBooks = _.clone(this.bookList);
                    if (this.bookFilters) {
                        this.filteredBooks = this.functions.filterLending(this.bookList, this.filteredBooks, this.bookFilters);
                    }

                    this.movieList = _.filter(data, { itemType: 'movie' });
                    this.movieList = this.checkLateReturns(this.movieList);
                    _.sortBy(this.movieList, ['itemName']);
                    this.filteredMovies = _.clone(this.movieList);
                    if (this.movieFilters) {
                        this.filteredMovies = this.functions.filterLending(this.movieList, this.filteredMovies, this.movieFilters);
                    }

                    this.tvList = _.filter(data, { itemType: 'tv' });
                    this.tvList = this.checkLateReturns(this.tvList);
                    _.sortBy(this.tvList, ['itemName']);
                    this.filteredTvs = _.clone(this.tvList);
                    if (this.tvFilters) {
                        this.filteredTvs = this.functions.filterLending(this.tvList, this.filteredTvs, this.tvFilters);
                    }
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
        const bookIndex = _.findIndex(list, item);
        list[bookIndex] = item;
    }

    private removeFromList(list: Lending[], item: Lending) {
        const bookIndex = _.findIndex(list, item);
        list[bookIndex] = item;
        _.remove(list, item);
    }

    returnLending(item: Lending, type: string) {
        item.active = false;

        switch (type) {
            case 'book':
                this.removeFromList(this.bookList, item);
                break;
            case 'movie':
                this.removeFromList(this.movieList, item);
                break;
            case 'tv':
                this.removeFromList(this.tvList, item);
                break;
        }

        if (item.late) {
            this.checkPunishments(item);
        }

        this.saveLending(item);
    }

    private checkPunishments(item: Lending) {
        const books = _.find(this.bookList, { active: true, userId: item.userId, late: true });
        const movies = _.find(this.movieList, { active: true, userId: item.userId, late: true });
        const tvs = _.find(this.tvList, { active: true, userId: item.userId, late: true });

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

    bookFilter() {
        const filterDialog = this.dialog.open(FilterDialogComponent, {
            data: {
                filterType: 'lending',
                filter: this.bookFilters,
            },
        });

        filterDialog.afterClosed().subscribe(result => {
            this.bookFilters = result;
            if (result) {
                this.filteredBooks = this.functions.filterBook(this.bookList, this.filteredBooks, result);
            } else {
                this.filteredBooks = _.clone(this.bookList);
            }
        },
            error => console.log(error));
    }

    movieFilter() {
        const filterDialog = this.dialog.open(FilterDialogComponent, {
            data: {
                filterType: 'lending',
                filter: this.movieFilters,
            },
        });

        filterDialog.afterClosed().subscribe(result => {
            this.movieFilters = result;
            if (result) {
                this.filteredMovies = this.functions.filterMovie(this.movieList, this.filteredMovies, result);
            } else {
                this.filteredMovies = _.clone(this.movieList);
            }
        },
            error => console.log(error));
    }

    tvFilter() {
        const filterDialog = this.dialog.open(FilterDialogComponent, {
            data: {
                filterType: 'lending',
                filter: this.tvFilters,
            },
        });

        filterDialog.afterClosed().subscribe(result => {
            this.tvFilters = result;
            if (result) {
                this.filteredTvs = this.functions.filterTv(this.tvList, this.filteredTvs, result);
            } else {
                this.filteredTvs = _.clone(this.tvList);
            }
        },
            error => console.log(error));
    }

    ngOnDestroy() {
        if (this.lendingList$) {
            this.lendingList$.unsubscribe();
        }
    }
}
