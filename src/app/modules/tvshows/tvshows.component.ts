import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonFunctions } from '../../common/commonFunctions';
import { AuthenticationService } from '../../services/authentication.service';
import { FireDBService } from '../../services/fireDB.service';
import { TvShow } from '../../common/dto/tv.dto';
import * as _ from 'lodash';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TvDialogComponent } from '../../dialogs/tv/tvDialog.component';

@Component({
    selector: 'app-tvshows',
    templateUrl: './tvshows.component.html',
})
export class TvshowsComponent implements OnInit, OnDestroy {
    isAdmin = false;
    isLoged = false;
    tvShows = [];
    tvShows$;
    tvRef$;

    constructor(private functions: CommonFunctions,
        private authService: AuthenticationService,
        private db: FireDBService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog) { }

    ngOnInit() {
        this.isLoged = this.functions.isLoged(this.authService.authUser);
        if (this.isLoged) {
            this.isAdmin = this.functions.isAdmin(this.authService.authUser);
        }

        if (this.isLoged) {
            this.tvShows$ = this.db.getList('libraries/' + this.authService.authLibrary.id + '/tvsIDs/')
                .subscribe(ids => {
                    ids.forEach(element => {
                        this.tvRef$ = this.db.getOne('tvs/' + element).subscribe((tv: TvShow) => {
                            const index = _.find(this.tvShows, b => b.id === tv.id);
                            if (!index) {
                                this.tvShows.push(tv);
                                this.tvShows = _.sortBy(this.tvShows, 'name');
                            }
                        });
                    });
                }, error => console.log(error));
        } else {
            this.tvShows$ = this.db.getList('tvs/').subscribe(data => {
                this.tvShows = data;
                this.tvShows = _.sortBy(this.tvShows, 'name');
            },
                error => console.log(error));
        }
    }

    newTv() {
        const tvDialog = this.dialog.open(TvDialogComponent, {
            width: '50%',
        });

        tvDialog.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open(result, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    editTv(tv: TvShow) {
        const tvDialog = this.dialog.open(TvDialogComponent, {
            width: '50%',
            data: tv,
        });

        tvDialog.afterClosed().subscribe(result => {
            if (result.tv) {
                const index = _.findIndex(this.tvShows, b => b.id === result.tv.id);
                this.tvShows[index] = result.tv;
                this.snackBar.open(result.motive, '', { duration: 2000 });
            } else if (result) {
                this.snackBar.open(result.motive, '', { duration: 2000 });
            }
        },
            error => console.log(error));
    }

    deleteTv(id: number) {
        this.db.deleteTV(id).then(() => {
            this.tvShows = _.remove(this.tvShows, b => b.id === id);
            this.snackBar.open('Serie borrada', '', { duration: 2000 });
        }).catch(error => {
            console.log(error);
            this.snackBar.open('Problema al borrar la serie', '', { duration: 2000 });
        });
    }

    addTvFavoutire(id: number) {
        this.db.saveTVFavourited(id)
            .then(() => this.snackBar.open('Serie añadida a favoritos', '', { duration: 2000 }))
            .catch(error => {
                console.log(error);
                this.snackBar.open('Problema al guardar la serie en favoritos', '', { duration: 2000 });
            });
    }

    ngOnDestroy() {
        if (this.tvShows$) {
            this.tvShows$.unsubscribe();
        }
        if (this.tvRef$) {
            this.tvRef$.unsubscribe();
        }
    }

}
