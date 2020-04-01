import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonFunctions } from '../../common/commonFunctions';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { TvShow } from '../../common/dto/tv.dto';
import * as _ from 'lodash';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TvDialogComponent } from '../../dialogs/tv/tvDialog.component';
import { FilterDialogComponent } from '../../dialogs/filter/filterDialog.component';
import { Filter } from '../../common/dto/filter.dto';

@Component({
    selector: 'app-tvshows',
    templateUrl: './tvshows.component.html',
})
export class TvshowsComponent implements OnInit, OnDestroy {
    isAdmin = false;
    isLoged = false;
    tvShows = [];
    tvShows$;
    tvFilters: Filter;
    filteredTvs = [];

    constructor(public functions: CommonFunctions,
        private authService: AuthenticationService,
        private db: FireDBService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog) {
        this.isLoged = this.functions.isLoged(this.authService.authUser);
        if (this.isLoged) {
            this.isAdmin = this.functions.isAdmin(this.authService.authUser);
        }
    }

    ngOnInit() {
        if (this.isLoged) {
            this.tvShows$ = this.db.getListFiltered('tvs/', '/owned/' + this.authService.authLibrary.id + '/id',
                this.authService.authLibrary.id).subscribe((data: TvShow[]) => {
                    if (data.length > 0) {
                        this.tvShows = data;
                        this.tvShows = _.sortBy(this.tvShows, 'name');
                        this.filteredTvs = _.clone(this.tvShows);
                        if (this.tvFilters) {
                            this.filteredTvs = this.functions.filterLending(this.tvShows, this.filteredTvs, this.tvFilters);
                        }
                    }
                }, error => console.log(error));
        } else {
            this.tvShows$ = this.db.getList('tvs/').subscribe(data => {
                if (data.length > 0) {
                    this.tvShows = data;
                    this.tvShows = _.sortBy(this.tvShows, 'name');
                    this.filteredTvs = _.clone(this.tvShows);
                    if (this.tvFilters) {
                        this.filteredTvs = this.functions.filterLending(this.tvShows, this.filteredTvs, this.tvFilters);
                    }
                }
            },
                error => console.log(error));
        }
    }

    newTv() {
        const tvDialog = this.dialog.open(TvDialogComponent);

        tvDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    editTv(tv: TvShow) {
        const tvDialog = this.dialog.open(TvDialogComponent, {
            data: tv,
        });

        tvDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteTv(tv: TvShow) {
        let nEjemplares = tv.owned[this.authService.authLibrary.id].nEjemplares;
        nEjemplares -= 1;

        if (nEjemplares <= 0) {
            tv.owned[this.authService.authLibrary.id] = null;
            _.remove(this.tvShows, tv);
        } else {
            tv.owned[this.authService.authLibrary.id].nEjemplares = nEjemplares;
        }
        this.db.updateTv(tv);
    }

    addTvFavoutire(id: number) {
        this.db.saveTvFavourited(id)
            .then(() => this.snackBar.open('Serie añadida a favoritos', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Problema al guardar la serie en favoritos', '', { duration: 2000 });
            });
    }

    removeTvFavoutire(tv: TvShow) {
        tv.favourites[this.authService.authUser.id] = null;
        this.db.updateTv(tv)
            .then(() => this.snackBar.open('Favorito eliminado', '', { duration: 2000 }));
    }

    addTvWished(id: number) {
        this.db.saveTvWished(id, this.authService.authUser.id)
            .then(() => this.snackBar.open('Serie añadida a deseados', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Problema al guardar la serie en deseados', '', { duration: 2000 });
            });
    }

    removeTvWished(tv: TvShow) {
        tv.wishes[this.authService.authUser.id] = null;
        this.db.updateTv(tv)
            .then(() => this.snackBar.open('Deseado eliminado', '', { duration: 2000 }));
    }

    getNumberOfItems(item: any) {
        return item.owned[this.authService.authLibrary.id].nEjemplares;
    }

    checkExists(item: TvShow, key: string) {
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
                filterType: 'tv',
                filter: this.tvFilters,
            },
        });

        filterDialog.afterClosed().subscribe(result => {
            this.tvFilters = result;
            if (result) {
                this.filteredTvs = this.functions.filterTv(this.tvShows, this.filteredTvs, result);
            } else {
                this.filteredTvs = _.clone(this.tvShows);
            }
        },
            error => console.log(error));
    }

    ngOnDestroy() {
        if (this.tvShows$) {
            this.tvShows$.unsubscribe();
        }
    }

}
