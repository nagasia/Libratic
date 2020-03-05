import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MatDialog, MatChipInputEvent } from '@angular/material';
import { FireDBService } from 'src/app/services/fireDB.service';
import { CommonFunctions } from 'src/app/common/commonFunctions';
import { Book } from 'src/app/common/dto/book.dto';
import { BookListDialogComponent } from '../bookList/bookListDialog.component';
import * as _ from 'lodash';
import { ENTER } from '@angular/cdk/keycodes';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'app-book-search-dialog',
    templateUrl: './bookSearchDialog.component.html',
})
export class BookSearchDialogComponent {
    readonly separatorKeysCodes: number[] = [ENTER];
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;

    subjectsData = [
        {
            name: 'Arquitectura',
            value: 'architecture',
            selected: false,
        },
        {
            name: 'Lecciones de arte',
            value: 'art__art_instruction',
            selected: false,
        },
        {
            name: 'Historia del arte',
            value: 'history_of_art__art__design_styles',
            selected: false,
        },
        {
            name: 'Danza',
            value: 'dance',
            selected: false,
        },
        {
            name: 'Diseño',
            value: 'design',
            selected: false,
        },
        {
            name: 'Moda',
            value: 'fashion',
            selected: false,
        },
        {
            name: 'Cine',
            value: 'film',
            selected: false,
        },
        {
            name: 'Diseño gráfico',
            value: 'graphic_design',
            selected: false,
        },
        {
            name: 'Música',
            value: 'music',
            selected: false,
        },
        {
            name: 'Teoría de la música',
            value: 'music_theory',
            selected: false,
        },
        {
            name: 'Pintura',
            value: 'painting__paintings',
            selected: false,
        },
        {
            name: 'Fotografía',
            value: 'photography',
            selected: false,
        },
        {
            name: 'Animales',
            value: 'bears',
            selected: false,
        },
        {
            name: 'Osos',
            value: 'bears',
            selected: false,
        },
        {
            name: 'Gatos',
            value: 'cats',
            selected: false,
        },
        {
            name: 'Gatitos',
            value: 'kittens',
            selected: false,
        },
        {
            name: 'Perros',
            value: 'dogs',
            selected: false,
        },
        {
            name: 'Perritos',
            value: 'puppies',
            selected: false,
        },
        {
            name: 'Ficción',
            value: 'fiction',
            selected: false,
        },
        {
            name: 'Fantasía',
            value: 'fantasy',
            selected: false,
        },
        {
            name: 'Ficción histórica',
            value: 'historical_fiction',
            selected: false,
        },
        {
            name: 'Horror',
            value: 'horror',
            selected: false,
        },
        {
            name: 'Humor',
            value: 'humor',
            selected: false,
        },
        {
            name: 'Literatura',
            value: 'literature',
            selected: false,
        },
        {
            name: 'Magia',
            value: 'magic',
            selected: false,
        },
        {
            name: 'Misterio e historia de detectives',
            value: 'mystery_and_detective_stories',
            selected: false,
        },
        {
            name: 'Teatro',
            value: 'plays',
            selected: false,
        },
        {
            name: 'Poesía',
            value: 'poetry',
            selected: false,
        },
        {
            name: 'Romance',
            value: 'romance',
            selected: false,
        },
        {
            name: 'Ciencia ficción',
            value: 'science_fiction',
            selected: false,
        },
        {
            name: 'Historias cortas',
            value: 'short_stories',
            selected: false,
        },
        {
            name: 'Suspense',
            value: 'thriller',
            selected: false,
        },
        {
            name: 'Ciencias y matemáticas',
            value: 'sciencemathematics',
            selected: false,
        },
        {
            name: 'Biología',
            value: 'biology',
            selected: false,
        },
        {
            name: 'Química',
            value: 'chemistry',
            selected: false,
        },
        {
            name: 'Matemáticas',
            value: 'mathematics',
            selected: false,
        },
        {
            name: 'Física',
            value: 'physics',
            selected: false,
        },
        {
            name: 'Programación',
            value: 'programming',
            selected: false,
        },
        {
            name: 'Negocios y finanzas',
            value: 'business',
            selected: false,
        },
        {
            name: 'Administración',
            value: 'management',
            selected: false,
        },
        {
            name: 'Emprendimiento',
            value: 'entrepreneurship',
            selected: false,
        },
        {
            name: 'Ciencias económicas',
            value: 'business__economics',
            selected: false,
        },
        {
            name: 'Éxito en los negocios',
            value: 'success_in_business',
            selected: false,
        },
        {
            name: 'Finanzas',
            value: 'finance',
            selected: false,
        },
        {
            name: 'Ficción juvenil',
            value: 'juvenile_fiction',
            selected: false,
        },
        {
            name: 'Literatura juvenil',
            value: 'juvenile_literature',
            selected: false,
        },
        {
            name: 'Historias en rima',
            value: 'stories_in_rhyme',
            selected: false,
        },
        {
            name: 'Infancia',
            value: 'infancy',
            selected: false,
        },
        {
            name: 'Cuentos para dormir',
            value: 'bedtime',
            selected: false,
        },
        {
            name: 'Libros de imágenes',
            value: 'picture_books',
            selected: false,
        },
        {
            name: 'Historia',
            value: 'history',
            selected: false,
        },
        {
            name: 'Civilizaciones antiguas',
            value: 'ancient_civilization',
            selected: false,
        },
        {
            name: 'Arqueología',
            value: 'archaeology',
            selected: false,
        },
        {
            name: 'Antropología',
            value: 'anthropology',
            selected: false,
        },
        {
            name: 'Cocina',
            value: 'cooking',
            selected: false,
        },
        {
            name: 'Libros de cocina',
            value: 'cookbooks',
            selected: false,
        },
        {
            name: 'Salud mental',
            value: 'mental_health',
            selected: false,
        },
        {
            name: 'Ejercicio',
            value: 'exercise',
            selected: false,
        },
        {
            name: 'Nutrición',
            value: 'nutrition',
            selected: false,
        },
        {
            name: 'Autoayuda',
            value: 'self-help',
            selected: false,
        },
        {
            name: 'Biografías',
            value: 'biography',
            selected: false,
        },
        {
            name: 'Autobiografías',
            value: 'autobiography',
            selected: false,
        },
        {
            name: 'Religión',
            value: 'religion',
            selected: false,
        },
        {
            name: 'Ciencias políticas',
            value: 'political_science',
            selected: false,
        },
        {
            name: 'Psicología',
            value: 'psycology',
            selected: false,
        },
    ];
    form: FormGroup;
    book: Book;
    selectedTitle: string;
    selectedAuthor: string;
    selectedSubject: string[] = [];
    writtenSubjects: string[] = [];
    selectedYear: number;
    selectedPublisher: string;

    constructor(private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<BookSearchDialogComponent>,
        private authService: AuthenticationService,
        private db: FireDBService,
        private dialog: MatDialog,
        private functions: CommonFunctions) {
        this.form = this.formBuilder.group({
            title: this.selectedTitle,
            author: this.selectedAuthor,
            year: this.selectedYear,
            publisher: this.selectedPublisher,
        });
    }

    manageCheckBoxes(event: any, i: number) {
        this.subjectsData[i].selected = event.checked;
    }

    addItem(event: MatChipInputEvent) {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.writtenSubjects.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    removeItem(item: any) {
        _.remove(this.writtenSubjects, currentItem => currentItem === item);
    }

    searchOpenLibrary() {
        this.selectedTitle = Object.assign({}, this.form.value).title;
        this.selectedAuthor = Object.assign({}, this.form.value).author;
        this.selectedYear = Object.assign({}, this.form.value).year;
        this.selectedPublisher = Object.assign({}, this.form.value).publisher;

        this.selectedSubject = _.filter(this.subjectsData, { selected: true }).map(element => element.value);

        if (this.writtenSubjects.length > 0) {
            this.selectedSubject = _.concat(this.selectedSubject, this.writtenSubjects);
        }

        if (this.selectedTitle || this.selectedAuthor || this.selectedYear || this.selectedPublisher
            || this.selectedSubject.length > 0) {
            const bookDialog = this.dialog.open(BookListDialogComponent, {
                width: '50%',
                data: {
                    title: this.selectedTitle,
                    author: this.selectedAuthor,
                    subject: this.selectedSubject,
                    year: this.selectedYear,
                    publisher: this.selectedPublisher,
                },
            });

            bookDialog.afterClosed().subscribe((book: Book) => {
                if (book) {
                    this.book = book;
                }
            });
        }
    }

    save() {
        this.db.updateBook(this.book)
            .then(() => {
                if (this.functions.isAdmin(this.authService.authUser)) {
                    this.db.saveBookWished(this.book.isbn, this.authService.authLibrary.id)
                        .then(() => this.onClose('Libro deseado agregado'))
                        .catch(error => {
                            console.log(error);
                            this.onClose('Problema al guardar el libro deseado');
                        });
                } else {
                    this.db.saveBookWished(this.book.isbn, this.authService.authUser.id)
                        .then(() => this.onClose('Libro deseado agregado'))
                        .catch(error => {
                            console.log(error);
                            this.onClose('Problema al guardar el libro deseado');
                        });
                }
            })
            .catch(error => console.log(error));
    }

    onClose(motive?: string) {
        if (motive) {
            this.dialogRef.close(motive);
        } else {
            this.dialogRef.close();
        }
    }
}
