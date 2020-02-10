import { User } from './dto/user.dto';

export class CommonFunctions {

    isAdmin(user: User): boolean {
        let result = false;
        if (user.userLevel === 'admin') {
            result = true;
        }
        return result;
    }
}
