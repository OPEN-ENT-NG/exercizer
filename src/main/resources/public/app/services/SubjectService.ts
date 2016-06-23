interface ISubjectService {
    resolve(): ng.IPromise<boolean>;
    resolveForLibrary(): ng.IPromise<boolean>;
    persist(subject: ISubject): ng.IPromise<ISubject>;
    update(subject: ISubject, updateMaxScore:boolean): ng.IPromise<ISubject>;
    remove(subject: ISubject): ng.IPromise<boolean>;
    removeList(subjectList: ISubject[]):ng.IPromise<boolean>
    duplicate(subject: ISubject): ng.IPromise<ISubject>;
    getById(id: number): ISubject;
    deleteSubjectChildrenOfFolder(folder: IFolder);
    getList(): ISubject[];
    getListForLibrary(): ISubject[];
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
    private _listForLibrary:ISubject[];

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
                    var subject;
                    angular.forEach(response.data, function(subjectObject) {
                        subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject)) as any;
                        self._afterPullBack(subject);
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

    public resolveForLibrary = function(): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subjects-for-library'
            };

        if (!angular.isUndefined(this._listForLibrary)) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    self._listForLibrary = [];
                    var subject;
                    angular.forEach(response.data, function(subjectObject) {
                        subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject)) as any;
                        self._afterPullBack(subject);
                        self._listForLibrary.push(subject);
                    });
                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des sujets de la bibliothèque.');
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
        if(subject.id){
            self._beforePushBack(subject);
        }
        this._$http(request).then(
            function(response) {
                var subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data)) as any;
                self._afterPullBack(subject);
                self._listMappedById[subject.id] = subject;
                deferred.resolve(subject);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la création du sujet.');
            }
        );
        return deferred.promise;
    };

    public update = function(subject: ISubject, updateMaxScore:boolean = false): ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'PUT',
                url: 'exercizer/subject/' + subject.id,
                data: subject
            };

        this._grainService.getListBySubject(subject).then(
            function(grainList){
                if (updateMaxScore) {
                    subject.max_score = 0;
                    angular.forEach(grainList, function (grain:IGrain) {
                        if (grain.grain_type_id > 3) {
                            subject.max_score += grain.grain_data.max_score;
                        }
                    })
                }
                if(self._beforePushBack(subject)){

                    self._$http(request).then(
                        function(response) {
                            //var newSubject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data));
                            self._afterPullBack(subject);
                            deferred.resolve(subject);
                        },
                        function() {
                            deferred.reject('Une erreur est survenue lors de la sauvegarde du sujet.');
                        }
                    );
                }
            }
        );
        return deferred.promise;

    };

    public remove = function(subject: ISubject): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'DELETE',
                url: 'exercizer/subject/' + subject.id,
                data: subject
            };
        self. _beforePushBack(subject);
        this._grainService.getListBySubject(subject).then(
            function(grainList) {
                var grainListCopy = angular.copy(grainList);
                self._grainService.removeList(grainListCopy, subject).then(
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

    public removeList = function(subjectList: ISubject[]):ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();
        if (subjectList.length === 0) {
            deferred.resolve(true);
        } else {
            var subject = subjectList[0];
            this.remove(subject).then(
                function () {
                    subjectList.splice(0, 1);
                    if (subjectList.length > 0) {
                        self.removeList(subjectList, subject);
                    } else {
                        deferred.resolve(true);
                    }
                },
                function () {
                    deferred.reject('Une erreur est survenue lors de la suppression des sujets.');
                }
            );
        }
        return deferred.promise;
    };

    public duplicate = function(subject: ISubject, folder: IFolder = undefined): ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer();
        // duplicate subject
        var duplicatedSubject = CloneObjectHelper.clone(subject, true);
        //clean subject
        duplicatedSubject.id = undefined;
        duplicatedSubject.owner = undefined;
        if(folder){
            duplicatedSubject.folder_id = folder.id;
        } else{
            duplicatedSubject.folder_id = null;
        }
        duplicatedSubject.title += '_copie';
        // persist subject
        this._beforePushBack(duplicatedSubject);
        this.persist(duplicatedSubject).then(
            // after persist subject, duplicate grain
            function(duplicatedSubject: ISubject) {
                self._grainService.getListBySubject(subject).then(
                    function(grainList: IGrain[]) {
                        var grainListCopy = angular.copy(grainList);
                        self._grainService.duplicateList(grainListCopy, duplicatedSubject, false).then(
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

    public duplicateList = function(list,parentFolder){
        var self = this,
            deferred = this._$q.defer(),
            promises = [];
        angular.forEach(list, function(value) {
            promises.push(self.duplicate(value, parentFolder));
        });
        this._$q.all(promises).then(
            function(data) {
                deferred.resolve(data);
            }, function(err) {
                console.error(err);
                deferred.reject(err);
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

    public getListForLibrary = function(): ISubject[] {
        return angular.isUndefined(this._listForLibrary) ? [] : this._listForLibrary;
    };

    public getListByFolderId(folderId:number): { [id: number]: ISubject; } {
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
        var self = this,
            deferred = this._$q.defer();
        var promises = [];
        angular.forEach(this._listMappedById, function(value, key) {
            if (value.folder_id === folder.id) {
                promises.push(self.remove(value));
            }
        });
        this._$q.all(promises).then(
            // success
            // results: an array of data objects from each deferred.resolve(data) call
            function(results) {
                deferred.resolve();
            }
        );
        return deferred.promise;
    };

    /**
     * set folder id to a subject and update the subject
     * @param subject
     * @param folderId
     */
    public setFolderId = function(subject :ISubject,folderId: number){
        subject.folder_id = folderId;
        this.update(subject);
    };

    private _beforePushBack(subject){
        delete subject.myRights;
        if(subject.owner && subject.owner.userId){
            subject.owner = subject.owner.userId;
            return true
        } else{
            return false;
        }
    }

    private _afterPullBack(subject){
        subject.owner = { userId: subject.owner };
        Behaviours.findRights('exercizer', subject);

    }
}