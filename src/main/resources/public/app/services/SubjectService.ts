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
        'GrainService'
    ];

    private _listMappedById:{[id:number]:ISubject;};
    private _currentSubjectId:number;
    private _grainService;

    constructor
    (private _$q:ng.IQService,
     private _$http:ng.IHttpService,
     GrainService) {
        this._$q = _$q;
        this._$http = _$http;
        this._grainService =GrainService;

        // TODO remove
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
        var self = this;
        var array = {};
        angular.forEach(self._listMappedById, function(value, key) {
            if(value.folder_id  == folderId){
                array[value.id] = value;
            }
        });
        return array;
    }

    public update = function (subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'PUT',
                url: 'exercizer/subject',
                data: subject
            };
        
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