interface ISubjectService {
    resolve(): ng.IPromise<boolean>;
    persist(subject: ISubject): ng.IPromise<ISubject>;
    update(subject: ISubject): ng.IPromise<ISubject>;
    remove(subject: ISubject): ng.IPromise<boolean>;
    getList(): ISubject[];
    getListByFolderId(folderId);
    getById(id: number): ISubject;
    duplicate(subject: ISubject): ng.IPromise<ISubject>;
    deleteSubjectChildrenOfFolder(folder: IFolder);
    getList(): ISubject[];
    getListByFolderId(folderId);
    getById(id: number): ISubject;
}

class SubjectService implements ISubjectService {

    static $inject = [
        '$q',
        '$http',
        'GrainService'
    ];

    // Inject
    private _$q: ng.IQService;
    private _$http: ng.IHttpService;
    private _grainService;

    // Variables
    private _listMappedById: { [id: number]: ISubject; };

    constructor($q, $http, GrainService) {
        this._$q = $q;
        this._$http = $http;
        this._grainService = GrainService;
    }

    public resolve = function(): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subjects'
            };

        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};

                    angular.forEach(response.data, function(subjectObject) {

                        var subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject));
                        self._listMappedById[subject.id] = subject;

                    });

                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération de vos sujets.');
                }
            );
        }

        return deferred.promise;
    };

    public persist = function(subject: ISubject): ng.IPromise<ISubject> {
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
                deferred.reject('Une erreur est survenue lors de la sauvegarde du sujet.');
            }
        );
        return deferred.promise;
    };

    public update = function(subject: ISubject): ng.IPromise<ISubject> {
        var deferred = this._$q.defer(),
            request = {
                method: 'PUT',
                url: 'exercizer/subject',
                data: subject
            };

        this._$http(request).then(
            function(response) {
                subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data));
                deferred.resolve(subject);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la sauvegarde du sujet.');
            }
        );
        return deferred.promise;
    };

    public remove = function(subject: ISubject): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'DELETE',
                url: 'exercizer/subject',
                data: subject
            };

        this._$http(request).then(
            function() {
                delete self._listMappedById[subject.id];
                deferred.resolve(true);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la suppression du sujet.');
            }
        );
        return deferred.promise;
    };

    public getList = function(): ISubject[] {
        if (!angular.isUndefined(this._listMappedById)) {
            return MapToListHelper.toList(this._listMappedById);
        } else {
            return [];
        }

    };

    public getListByFolderId(folderId:number): { [id: number]: ISubject; } {
        // TODO FolderService ?
        var self = this,
            listByFolderId:{ [id: number]: ISubject; } = {};

        angular.forEach(self._listMappedById, function(subject:ISubject) {
            if (subject.folder_id == folderId) {
                listByFolderId[subject.id] = subject;
            }
        });

        return listByFolderId;
    }

    public getById = function(id:number):ISubject {
        return this._listMappedById[id];
    };

    /**
     * duplicate a subject
     * @param subject
     * @param duplicateGrain
     * @returns {any}
     */
    public duplicate = function(subject: ISubject, duplicateGrain: boolean = true): ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer();
        // clone subject
        var duplicatedSubject = CloneObjectHelper.clone(subject, true);
        // remove some attributes
        duplicatedSubject.id = undefined;
        delete duplicatedSubject.shared;
        delete duplicatedSubject.selected;
        // rename subject
        duplicatedSubject.title += '_copie';
        // persist new subject
        this.persist(duplicatedSubject)
            .then(function(dataSubject) {
                    if (duplicateGrain === true) {
                        self._grainService.getListBySubject(subject.id)
                            .then(function(dataGrainList) {
                                var newGrain;
                                angular.forEach(dataGrainList, function(grain, key) {
                                    // no use grainService.duplicate because want to change subject_id
                                    newGrain = self._grainService.copyOf(grain);
                                    newGrain.subject_id = dataSubject.id;
                                    self._grainService.persist(newGrain);
                                });
                                deferred.resolve(dataSubject);
                            })
                    } else {
                        deferred.resolve(dataSubject);
                    }
                }
            );
        return deferred.promise;
    };

    /**
     * remove all subject in a folder
     * @param folder
     */
    public deleteSubjectChildrenOfFolder = function(folder: IFolder) {
        // TODO Folder service ?
        var self = this;
        angular.forEach(this._listMappedById, function(value, key) {
            if (value.folder_id === folder.id) {
                self.remove(value);
            }
        });
    };

    /**
     * set folder id to a subject and update the subject
     * @param subject
     * @param folderId
     */
    public setFolderId = function(subject :ISubject,folderId: number){
        // TODO Folder service ?
        subject.folder_id = folderId;
        this.update(subject);
    }
}