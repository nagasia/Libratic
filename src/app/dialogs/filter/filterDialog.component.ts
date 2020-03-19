import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Filter } from 'src/app/common/dto/filter.dto';
import { CommonFunctions } from '../../common/commonFunctions';

@Component({
    selector: 'app-filter-dialog',
    templateUrl: './filterDialog.component.html',
})
export class FilterDialogComponent {
    form: FormGroup;
    companie: string;
    title: string;
    subject: string;
    author: string;
    date: string;
    runtime: number;
    vote: number;
    actor: string;
    director: string;
    username: string;
    punishment: boolean;

    filter: Filter;
    filterType: string;

    constructor(private formBuilder: FormBuilder,
        private functions: CommonFunctions,
        private dialogRef: MatDialogRef<FilterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.filterType = this.data.filterType;
        if (data.filter) {
            this.filter = this.data.filter;
            this.companie = this.data.filter.companie;
            this.title = this.data.filter.title;
            this.subject = this.data.filter.subject;
            this.author = this.data.filter.author;
            this.date = this.data.filter.date;
            this.runtime = this.data.filter.runtime;
            this.vote = this.data.filter.vote;
            this.actor = this.data.filter.actor;
            this.director = this.data.filter.director;
            this.username = this.data.filter.username;
            this.punishment = this.data.filter.punishment;
        }
        this.form = this.formBuilder.group({
            companie: this.companie,
            title: this.title,
            subject: this.subject,
            author: this.author,
            date: this.date,
            runtime: this.runtime,
            vote: this.vote,
            actor: this.actor,
            director: this.director,
            username: this.username,
            punishment: this.punishment,
        });
    }

    save() {
        this.filter = {
            companie: Object.assign({}, this.form.value).companie,
            title: Object.assign({}, this.form.value).title,
            subject: Object.assign({}, this.form.value).subject,
            author: Object.assign({}, this.form.value).author,
            date: Object.assign({}, this.form.value).date,
            runtime: Object.assign({}, this.form.value).runtime,
            vote: Object.assign({}, this.form.value).vote,
            actor: Object.assign({}, this.form.value).actor,
            director: Object.assign({}, this.form.value).director,
            username: Object.assign({}, this.form.value).username,
            punishment: Object.assign({}, this.form.value).punishment,
        };

        this.filter = this.functions.checkKeys(this.filter);

        this.onClose();
    }

    clean() {
        this.filter = null;

        this.onClose();
    }

    onClose() {
        if (this.filter) {
            this.dialogRef.close(this.filter);
        } else {
            this.dialogRef.close();
        }
    }

}
