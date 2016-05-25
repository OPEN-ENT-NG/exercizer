interface IUserService {
    resolve();
    
    currentUserId:number;
}

class UserService implements IUserService {
     
    static $inject = [];

    private _currentUserId:number;

    constructor() {
        // TODO remove
        this._currentUserId = 1;
    }

    public resolve = function () {

    };
    get currentUserId():number {
        return this._currentUserId;
    }

    set currentUserId(value:number) {
        this._currentUserId = value;
    }
}

