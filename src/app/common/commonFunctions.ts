import { User } from './dto/user.dto';
import { isNullOrUndefined } from 'util';
import * as _ from 'lodash';
import { Filter } from './dto/filter.dto';

export class CommonFunctions {

    isAdmin(user: User): boolean {
        let result = false;
        if (user.userLevel === 'admin') {
            result = true;
        }
        return result;
    }

    isLoged(user: User): boolean {
        let result = false;
        if (user) {
            result = true;
        }
        return result;
    }

    checkKeys(item) {
        const dataKeys = Object.keys(item);
        dataKeys.forEach(element => {
            if (!item[element]) {
                item[element] = null;
            }
        });
        return item;
    }

    shortOverview(overview: string) {
        let result = overview;
        if (overview.length > 103) {
            result = overview.substring(0, 100) + '...';
        }
        return result;
    }

    transformComma(arr: string[]){
        return arr.join(', ');
    }

    fillArray(data: any) {
        let result;
        if (data !== undefined) {
            result = [];
            data.forEach(element => result.push(element.name));
        }
        return result;
    }

    translatePhysicalFormat(format: string): string {
        const formats = ['Tapa dura', 'Tapa blanda', 'Electrónico', 'Libro de bolsillo', 'Encuadernado en espiral'];

        let result;
        switch (format) {
            case 'Paperback': case 'Mass Market Paperback':
                result = formats[3];
                break;
            case 'Hardcover':
                result = formats[0];
                break;
            case 'Spiral-bound':
                result = formats[4];
                break;
            default:
                result = format;
                break;
        }
        return result;
    }

    returnDataIfNotUndefined(data: any) {
        if (!isNullOrUndefined(data)) {
            return data;
        } else {
            return null;
        }
    }

    translateDate(time: number): string {
        const date = new Date(time);
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }

    reverseDate(day: string): string {
        let result = day;
        let elements = [];

        if (day.includes('-')) {
            elements = day.split('-');
        } else if (day.includes('/')) {
            elements = day.split('/');
        }

        if (elements.length > 0) {
            if (elements[0].length === 4) {
                result = elements[2] + '/' + elements[1] + '/' + elements[0];
            } else {
                result = elements.join('/');
            }
        }

        return result;
    }

    filterBook(book, filteredBooks, filters: Filter) {
        filteredBooks = _.clone(book);

        if (filters.title) {
            filteredBooks = _.filter(filteredBooks, b => {
                if (b.title.toLowerCase().includes(filters.title.toLowerCase())) {
                    return b;
                }
            });
        }

        if (filters.date) {
            filteredBooks = _.filter(filteredBooks, b => {
                if (b.publish_date.includes(filters.date)) {
                    return b;
                }
            });
        }

        if (filters.author) {
            let booksToRemove = [];
            filteredBooks.forEach(book => {
                if (book.authors) {
                    book.authors.forEach(element => {
                        if (element.toLowerCase().includes(filters.author.toLowerCase())) {
                            booksToRemove.push(book);
                        }
                    });
                }
            });

            filteredBooks = _.intersection(filteredBooks, booksToRemove);
        }

        if (filters.subject) {
            let booksToRemove = [];
            filteredBooks.forEach(book => {
                if (book.subjects) {
                    book.subjects.forEach(element => {
                        if (element.toLowerCase().includes(filters.subject.toLowerCase())) {
                            booksToRemove.push(book);
                        }
                    });
                }
            });

            filteredBooks = _.intersection(filteredBooks, booksToRemove);
        }

        if (filters.companie) {
            let booksToRemove = [];
            filteredBooks.forEach(book => {
                if (book.publishers) {
                    book.publishers.forEach(element => {
                        if (element.toLowerCase().includes(filters.companie.toLowerCase())) {
                            booksToRemove.push(book);
                        }
                    });
                }
            });

            filteredBooks = _.intersection(filteredBooks, booksToRemove);
        }

        return filteredBooks;
    }

    filterMovie(movies, filteredMovies, filters: Filter) {
        filteredMovies = _.clone(movies);

        if (filters.title) {
            filteredMovies = _.filter(filteredMovies, b => {
                if (b.title.toLowerCase().includes(filters.title.toLowerCase())) {
                    return b;
                }
            });
        }

        if (filters.date) {
            filteredMovies = _.filter(filteredMovies, b => {
                if (b.release_date.includes(filters.date)) {
                    return b;
                }
            });
        }

        if (filters.runtime) {
            filteredMovies = _.filter(filteredMovies, b => {
                if (b.runtime >= filters.runtime) {
                    return b;
                }
            });
        }

        if (filters.vote) {
            filteredMovies = _.filter(filteredMovies, b => {
                if (b.vote_average >= filters.vote) {
                    return b;
                }
            });
        }

        if (filters.subject) {
            let moviesToRemove = [];
            filteredMovies.forEach(movie => {
                if (movie.genres) {
                    movie.genres.forEach(element => {
                        if (element.toLowerCase().includes(filters.subject.toLowerCase())) {
                            moviesToRemove.push(movie);
                        }
                    });
                }
            });

            filteredMovies = _.intersection(filteredMovies, moviesToRemove);
        }

        if (filters.companie) {
            let moviesToRemove = [];
            filteredMovies.forEach(movie => {
                if (movie.production_companies) {
                    movie.production_companies.forEach(element => {
                        if (element.toLowerCase().includes(filters.companie.toLowerCase())) {
                            moviesToRemove.push(movie);
                        }
                    });
                }
            });

            filteredMovies = _.intersection(filteredMovies, moviesToRemove);
        }

        if (filters.actor) {
            let moviesToRemove = [];
            filteredMovies.forEach(movie => {
                if (movie.cast) {
                    movie.cast.forEach(element => {
                        if (element.name.toLowerCase().includes(filters.actor.toLowerCase())) {
                            moviesToRemove.push(movie);
                        }
                    });
                }
            });

            filteredMovies = _.intersection(filteredMovies, moviesToRemove);
        }

        if (filters.director) {
            let moviesToRemove = [];
            filteredMovies.forEach(movie => {
                if (movie.crew) {
                    movie.crew.forEach(element => {
                        if (element.job === 'Director' && element.name.toLowerCase().includes(filters.director.toLowerCase())) {
                            moviesToRemove.push(movie);
                        }
                    });
                }
            });

            filteredMovies = _.intersection(filteredMovies, moviesToRemove);
        }

        return filteredMovies;
    }

    filterTv(tvs, filteredTvs, filters: Filter) {
        filteredTvs = _.clone(tvs);

        if (filters.title) {
            filteredTvs = _.filter(filteredTvs, b => {
                if (b.name.toLowerCase().includes(filters.title.toLowerCase())) {
                    return b;
                }
            });
        }

        if (filters.date) {
            filteredTvs = _.filter(filteredTvs, b => {
                if (b.first_air_date.includes(filters.date)) {
                    return b;
                }
            });
        }

        if (filters.vote) {
            filteredTvs = _.filter(filteredTvs, b => {
                if (b.vote_average >= filters.vote) {
                    return b;
                }
            });
        }

        if (filters.author) {
            let moviesToRemove = [];
            filteredTvs.forEach(tv => {
                if (tv.created_by) {
                    tv.created_by.forEach(element => {
                        if (element.toLowerCase().includes(filters.author.toLowerCase())) {
                            moviesToRemove.push(tv);
                        }
                    });
                }
            });

            filteredTvs = _.intersection(filteredTvs, moviesToRemove);
        }

        if (filters.subject) {
            let moviesToRemove = [];
            filteredTvs.forEach(tv => {
                if (tv.genres) {
                    tv.genres.forEach(element => {
                        if (element.toLowerCase().includes(filters.subject.toLowerCase())) {
                            moviesToRemove.push(tv);
                        }
                    });
                }
            });

            filteredTvs = _.intersection(filteredTvs, moviesToRemove);
        }

        if (filters.companie) {
            let moviesToRemove = [];
            filteredTvs.forEach(tv => {
                if (tv.production_companies) {
                    tv.production_companies.forEach(element => {
                        if (element.toLowerCase().includes(filters.companie.toLowerCase())) {
                            moviesToRemove.push(tv);
                        }
                    });
                }
            });

            filteredTvs = _.intersection(filteredTvs, moviesToRemove);
        }

        if (filters.actor) {
            let moviesToRemove = [];
            filteredTvs.forEach(tv => {
                if (tv.cast) {
                    tv.cast.forEach(element => {
                        if (element.name.toLowerCase().includes(filters.actor.toLowerCase())) {
                            moviesToRemove.push(tv);
                        }
                    });
                }
            });

            filteredTvs = _.intersection(filteredTvs, moviesToRemove);
        }

        if (filters.director) {
            let moviesToRemove = [];
            filteredTvs.forEach(tv => {
                if (tv.crew) {
                    tv.crew.forEach(element => {
                        if (element.job === 'Director' && element.name.toLowerCase().includes(filters.director.toLowerCase())) {
                            moviesToRemove.push(tv);
                        }
                    });
                }
            });

            filteredTvs = _.intersection(filteredTvs, moviesToRemove);
        }

        return filteredTvs;
    }

    filterLending(lendings, filteredLendings, filters: Filter) {
        filteredLendings = _.clone(lendings);

        if (filters.title) {
            filteredLendings = _.filter(filteredLendings, b => {
                if (b.itemName.toLowerCase().includes(filters.title.toLowerCase())) {
                    return b;
                }
            });
        }

        if (filters.username) {
            filteredLendings = _.filter(filteredLendings, b => {
                if (b.userName.toLowerCase().includes(filters.username.toLowerCase())) {
                    return b;
                }
            });
        }

        return filteredLendings;
    }

    filterUser(users, filteredUsers, filters: Filter) {
        filteredUsers = _.clone(users);

        if (filters.username) {
            filteredUsers = _.filter(filteredUsers, b => {
                if (b.name.toLowerCase().includes(filters.username.toLowerCase())) {
                    return b;
                }
            });
        }

        if (filters.punishment) {
            filteredUsers = _.filter(filteredUsers, { punishment: true });
        }

        return filteredUsers;
    }
}
