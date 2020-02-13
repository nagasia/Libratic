import { User } from './dto/user.dto';

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
}
