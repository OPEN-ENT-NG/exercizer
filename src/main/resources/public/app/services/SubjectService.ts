interface ISubjectService {
    persist(subject:ISubject):ng.IPromise<ISubject>;
    update(subject:ISubject):ng.IPromise<ISubject>;
    remove(subject:ISubject):ng.IPromise<ISubject>;
    duplicate (subject:ISubject):ng.IPromise<ISubject>
    deleteSubjectChildrenOfFolder(folder:IFolder);
    getList():ISubject[];
    getListByFolderId(folderId);
    getById(id:number):ISubject;
    currentSubjectId:number;
}

class SubjectService implements ISubjectService {

    static $inject = [
        '$q',
        '$http',
        'UserService',
        'GrainService'
    ];

    private _listMappedById:{[id:number]:ISubject;};
    private _currentSubjectId:number;
    private _grainService;

    constructor
    (private _$q:ng.IQService,
     private _$http:ng.IHttpService,
     private _userService:IUserService,
     GrainService) {
        this._$q = _$q;
        this._$http = _$http;
        this._userService = _userService;
        this._grainService =GrainService;

        // TODO remove
        this._listMappedById = {};
    }

    public persist = function (subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer();

        //TODO update when using real API
        subject.id = Math.floor(Math.random() * (999999999 - 1)) + 1; // FIXME backend
        subject.owner = this._userService.currentUserId; // FIXME backend
        setTimeout(function (self, subject) {
            self._listMappedById[subject.id] = subject;
            deferred.resolve(subject);
        }, 100, self, subject);

        return deferred.promise;
    };

    public duplicate = function (subject:ISubject, duplicateGrain : boolean = true):ng.IPromise<ISubject> {
        var self = this;
        var duplicatedSubject = CloneObjectHelper.clone(subject, true);
        duplicatedSubject.id = undefined;
        duplicatedSubject.title += '_copie';
        duplicatedSubject.selected = false;
        if(duplicateGrain === true){
            var deferred = this._$q.defer();
            var promisePersist = this.persist(duplicatedSubject);
            promisePersist.then(function(dataSubject){
                // data is subject
                var promiseGrainList = self._grainService.getListBySubjectId(subject.id);
                promiseGrainList.then(function(dataGrainList){
                    console.log('dataGrainList',dataGrainList );
                    angular.forEach(dataGrainList, function(grain, key) {
                        var newGrain = self._grainService.copyOf(grain);
                            //data is grain
                        newGrain.subject_id = dataSubject.id;
                        console.log(newGrain);
                        self._grainService.persist(newGrain);
                    });
                    deferred.resolve(dataSubject);
                });
            });
            return deferred.promise;
        } else {
            return this.persist(duplicatedSubject);
        }
    };

    public getListByFolderId(folderId){
        console.log('getListByFolderId', folderId);
        var self = this;
        var array = {};
        angular.forEach(self._listMappedById, function(value, key) {
            if(value.folder_id  == folderId){
                array[value.id] = value;
                console.log('MATCH');
            }
        });
        console.log('return array :', array);

        return array;
    }

    public update = function (subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer();
        console.log('delete subject');
        //TODO remove when using real API
        setTimeout(function (self, subject) {
            self._listMappedById[subject.id] = subject;
            deferred.resolve(subject);
        }, 100, self, subject);

        return deferred.promise;
    };

    public remove = function (subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer();
        //TODO remove when using real API
        subject.is_deleted = true;
        setTimeout(function (self, subject) {
            delete self._listMappedById[subject.id];
            deferred.resolve(subject);
        }, 2000, self, subject);

        return deferred.promise;
    };

    public deleteSubjectChildrenOfFolder = function (folder:IFolder) {
        var self = this;
        angular.forEach(this._listMappedById, function (value, key) {
            if (value.folder_id === folder.id) {
                self.remove(value);
            }
        });
    };

    public getList = function ():ISubject[] {
        var self = this;

        return Object.keys(this._listMappedById).map(function (v) {
            return this._listMappedById[v];
        }, self);
    };

    public getById = function (id:number):ISubject {
        return this._listMappedById[id];
    };

    get currentSubjectId():number {
        return this._currentSubjectId;
    }

    set currentSubjectId(value:number) {
        this._currentSubjectId = value;
    }
}