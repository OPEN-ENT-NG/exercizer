interface ISubjectService {
    persist(subject:ISubject):ng.IPromise<ISubject>;
    update(subject:ISubject):ng.IPromise<ISubject>;
    remove(subject:ISubject):ng.IPromise<ISubject>;
    getList():ISubject[];
    getById(id:number):ISubject;
    currentSubjectId:number;
}

class SubjectService implements ISubjectService {

    static $inject = [
        '$q',
        '$http',
        'UserService'
    ];

    private _listMappedById:{[id:number]:ISubject;};
    private _currentSubjectId:number;

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService,
        private _userService:IUserService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._userService = _userService;

        // TODO remove
        this._listMappedById = {};
    }

    public persist = function(subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer();

        //TODO update when using real API
        subject.id = Math.floor(Math.random() * (999999999 - 1)) + 1; // FIXME backend
        subject.owner = this._userService.currentUserId; // FIXME backend
        setTimeout(function(self, subject) {
            self._listMappedById[subject.id] = subject;
            deferred.resolve(subject);
        }, 100, self, subject);

        return deferred.promise;
    };

    public update = function(subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, subject) {
            self._listMappedById[subject.id] = subject;
            deferred.resolve(subject);
        }, 100, self, subject);

        return deferred.promise;
    };

    public remove = function(subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        subject.is_deleted = true;
        setTimeout(function(self, subject) {
            delete self._listMappedById[subject.id];
            deferred.resolve(subject);
        }, 2000, self, subject);

        return deferred.promise;
    };

    public getList = function():ISubject[] {
        var self = this;
        
        return Object.keys(this._listMappedById).map(function(v) {
            return this._listMappedById[v];
        }, self);
    };

    public getById = function(id:number):ISubject {
        return this._listMappedById[id];
    };

    get currentSubjectId():number {
        return this._currentSubjectId;
    }

    set currentSubjectId(value:number) {
        this._currentSubjectId = value;
    }
}
