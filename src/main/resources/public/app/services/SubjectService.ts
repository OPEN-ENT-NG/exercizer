interface ISubjectService {
    resolve(): ng.IPromise<boolean>;
    persist(subject: ISubject): ng.IPromise<ISubject>;
    update(subject: ISubject): ng.IPromise<ISubject>;
    remove(subject: ISubject): ng.IPromise<boolean>;
    duplicate(subject: ISubject): ng.IPromise<ISubject>;
    getList(): ISubject[];
    getListByFolderId(folderId);
    getById(id: number): ISubject;
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

    private _listMappedById: { [id: number]: ISubject; };

    constructor
    (
        private _$q: ng.IQService,
        private _$http: ng.IHttpService,
        private _grainService: IGrainService
    ) {
        this._$q = _$q;
        this._$http = _$http;
        this._grainService = _grainService;
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

        this._grainService.getListBySubject(subject).then(
            function(grainList) {
                self._grainService.removeList(grainList, subject).then(
                    function() {
                        self._$http(request).then(
                            function() {
                                delete self._listMappedById[subject.id];
                                deferred.resolve(true);
                            },
                            function() {
                                deferred.reject('Une erreur est survenue lors de la suppression du sujet.');
                            }
                        );
                    },
                    function() {
                        deferred.reject('Une erreur est survenue lors de la suppression des éléments sujet.');
                    });
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la récupération des éléments du sujets.');
            });


        return deferred.promise;
    };

    public duplicate = function(subject: ISubject, folder: IFolder = undefined): ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer();

        var duplicatedSubject = CloneObjectHelper.clone(subject, true);
        duplicatedSubject.id = undefined;
        duplicatedSubject.folder_id = angular.isUndefined(folder) ? null : folder.id;
        duplicatedSubject.title += '_copie';

        this.persist(duplicatedSubject).then(
            function(duplicatedSubject: ISubject) {
                self._grainService.getListBySubject(subject).then(
                    function(grainList: IGrain[]) {
                        var grainListCopy = angular.copy(grainList);
                        self._grainService.duplicateList(grainListCopy, duplicatedSubject).then(
                            function() {
                                deferred.resolve(duplicatedSubject);
                            },
                            function() {
                                deferred.reject('Une erreur est survenue lors de la duplication des éléments du sujet à copier');
                            }
                        )
                    },
                    function() {
                        deferred.reject('Une erreur est survenue lors de la récupération des éléments du sujet à copier.')
                    }
                )},
            function() {
                deferred.reject('Une erreur est survenue lors de la duplication du sujet à copier.');
            });

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
        subject.folder_id = folderId;
        this.update(subject);
    }
}