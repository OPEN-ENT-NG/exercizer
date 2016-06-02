interface ISubjectService {
    persist(subject:ISubject):ng.IPromise<ISubject>;
    update(subject:ISubject):ng.IPromise<ISubject>;
    remove(subject:ISubject):ng.IPromise<ISubject>;
    duplicate (subject:ISubject):ng.IPromise<ISubject>
    loadSubjectList ();
    deleteSubjectChildrenOfFolder(folder:IFolder);
    getList():ISubject[];
    getListByFolderId(folderId);
    getById(id:number):ISubject;
}

class SubjectService implements ISubjectService {

    static $inject = [
        '$q',
        '$http',
        'GrainService'
    ];

    // Inject
    private _$q:ng.IQService;
    private _$http:ng.IHttpService;
    private _grainService;

    // Variables
    private _listMappedById:{[id:number]:ISubject;};

    constructor($q, $http, GrainService) {
        this._$q = $q;
        this._$http = $http;
        this._grainService = GrainService;
    }

    /**
     * get list of subject
     * @returns {any}
     */
    public getList = function ():ISubject[] {
        if (!angular.isUndefined(this._listMappedById)) {
            return MapToListHelper.toList(this._listMappedById);
        } else {
            return [];
        }

    };

    /**
     * get subject by id
     * @param id
     * @returns {any}
     */
    public getById = function (id:number):ISubject {
        return this._listMappedById[id];
    };

    /**
     * load subject
     * @returns {IPromise<T>}
     */
    public loadSubjectList = function () {
        var deferred = this._$q.defer();
        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(MapToListHelper.toList(this._listMappedById));
        } else {
            var self = this,
                request = {
                    method: 'GET',
                    url: 'exercizer/subjects'
                };

            this._$http(request).then(
                function (response) {
                    self._listMappedById = {};
                    angular.forEach(response.data, function (subjectObject) {
                        var subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject));
                        self._listMappedById[subject.id] = subject;
                    });
                    deferred.resolve(MapToListHelper.toList(self._listMappedById));
                },
                function () {
                    deferred.reject('Une erreur est survenue lors de la récupération de vos sujets.');
                }
            );
        }
        return deferred.promise;
    };

    /**
     * persist a subject
     * @param subject
     * @returns {IPromise<T>}
     */
    public persist = function (subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject',
                data: subject
            };
        this._$http(request).then(
            function (response) {
                subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data));
                self._listMappedById[subject.id] = subject;
                deferred.resolve(subject);
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la sauvegarde du sujet.');
            }
        );
        return deferred.promise;
    };

    /**
     * update a subject
     * @param subject
     * @returns {IPromise<T>}
     */
    public update = function (subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'PUT',
                url: 'exercizer/subject',
                data: subject
            };
        this._$http(request).then(
            function (response) {
                subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data));
                self._listMappedById[subject.id] = subject;
                deferred.resolve(subject);
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la sauvegarde du sujet.');
            }
        );
        return deferred.promise;
    };

    /**
     * remove a subject
     * @param subject
     * @returns {IPromise<T>}
     */
    public remove = function (subject:ISubject):ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'DELETE',
                url: 'exercizer/subject',
                data: subject
            };
        this._$http(request).then(
            function (response) {
                subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data));
                delete self._listMappedById[subject.id];
                deferred.resolve();
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la suppression du sujet.');
            }
        );
        return deferred.promise;
    };

    /**
     * duplicate a subject
     * @param subject
     * @param duplicateGrain
     * @returns {any}
     */
    public duplicate = function (subject:ISubject, duplicateGrain:boolean = true):ng.IPromise<ISubject> {
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
            .then(function (dataSubject) {
                    if (duplicateGrain === true) {
                        self._grainService.getListBySubject(subject.id)
                            .then(function (dataGrainList) {
                                var newGrain;
                                angular.forEach(dataGrainList, function (grain, key) {
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
     * get list of subject by folder
     * @param folderId
     * @returns {{}}
     */
    public getListByFolderId(folderId) {
        var self = this,
            array = {};
        angular.forEach(self._listMappedById, function (value, key) {
            if (value.folder_id == folderId) {
                array[value.id] = value;
            }
        });
        return array;
    }

    /**
     * remove all subject in a folder
     * @param folder
     */
    public deleteSubjectChildrenOfFolder = function (folder:IFolder) {
        var self = this;
        angular.forEach(this._listMappedById, function (value, key) {
            if (value.folder_id === folder.id) {
                self.remove(value);
            }
        });
    };
}