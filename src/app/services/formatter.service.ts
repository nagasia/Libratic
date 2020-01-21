import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FormatterService {

    constructor() { }

    formatEmail(email: string) {
        return email.replace(/[\.\#\$\[\]]/g, '');
    }

}
