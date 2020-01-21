import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './modules/users/users.component';
import { BooksComponent } from './modules/books/books.component';
import { LendingsComponent } from './modules/lendings/lendings.component';
import { MoviesComponent } from './modules/movies/movies.component';
import { TvshowsComponent } from './modules/tvshows/tvshows.component';
import { FavouritesComponent } from './modules/favourites/favourites.component';
import { WishedComponent } from './modules/wished/wished.component';


const routes: Routes = [
    { path: '', component: BooksComponent },
    { path: 'users', component: UsersComponent },
    { path: 'books', component: BooksComponent },
    { path: 'lendings', component: LendingsComponent },
    { path: 'movies', component: MoviesComponent },
    { path: 'tv', component: TvshowsComponent },
    { path: 'favourites', component: FavouritesComponent },
    { path: 'wished', component: WishedComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
