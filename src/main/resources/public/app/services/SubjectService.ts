interface ISubjectService {
    persist(subject:ISubject):ng.IPromise<ISubject>;
    update(subject:ISubject):ng.IPromise<ISubject>;
    remove(subject:ISubject):ng.IPromise<ISubject>;
    deleteSubjectChildrenOfFolder(folder:IFolder);
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
        this._listMappedById = {};

        var self = this,
            request = {
                method: 'GET',
                url: 'exercizer/subjects'
            };

        this._$http(request).then(
            function(response) {
                angular.forEach(response.data, function(subjectObject) {
                    var subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject));
                    self._listMappedById[subject.id] = subject;
                });
            },
            function() {
                notify.error('Une erreur est survenue lors de la récupération de vos sujets.');
            }
        );
    }

    public persist = function (subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject',
                data: subject
            };

        this._$http(request).then(
            function(response) {
                subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data));
                self._listMappedById[subject.id] = subject;
                deferred.resolve(subject);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la sauvegarde des propriétés du sujet.');
            }
        );

        return deferred.promise;
    };

    public update = function (subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'PUT',
                url: 'exercizer/subject',
                data: subject
            };
        
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
            deferred = this._$q.defer(),
            request = {
                method: 'DELETE',
                url: 'exercizer/subject',
                data: subject
            };

        //TODO remove when using real API
        setTimeout(function(self, subject) {
            if (angular.isUndefined(self._listMappedById[subject.id])) {
                self._listMappedById[subject.id] = [];
            }

            var grainIndex = self._listMappedById[subject.id].indexOf(subject);

            if (grainIndex !== -1) {
                self._listMappedById[subject.id].splice(grainIndex, 1);
                deferred.resolve(true);
            }

            deferred.resolve(false);
        }, 100, self, subject);

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

    public getList = function():ISubject[] {
        return MapToListHelper.toList(this._listMappedById);
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