import { User } from './dto/user.dto';
import { isNullOrUndefined } from 'util';
import { logging } from 'protractor';

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
}
