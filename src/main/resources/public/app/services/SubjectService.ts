interface ISubjectService {
    resolve(force?:boolean): ng.IPromise<boolean>;
    persist(subject: ISubject): ng.IPromise<ISubject>;
    update(subject: ISubject, updateMaxScore:boolean): ng.IPromise<ISubject>;
    remove(subjectIds: number[]): ng.IPromise<boolean>;
    getById(id: number): ISubject;
    deleteSubjectChildrenOfFolder(folder: IFolder);
    getList(): ISubject[];
    getListByFolderId(folderId);
    getById(id: number): ISubject;
    getByIdEvenDeleted (id:number) : ng.IPromise<any>;
    duplicateSubjectsFromLibrary (subjectIds:number[], folderId:number);
    duplicate(ids: number[], folder: IFolder): ng.IPromise<boolean>
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

    public resolve = function(force:boolean = false): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subjects'
            };

        if (!angular.isUndefined(this._listMappedById) && !force) {
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

    public persist = function(subject: ISubject): ng.IPromise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject',
                data: subject
            };

        if (angular.isUndefined(this._listMappedById)) {
            this._listMappedById = {};
        }

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

    public remove = function(subjectIds: number[]): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'PUT',
                url: 'exercizer/subject/mark/delete',
                data: {subjectIds: subjectIds}
            };

        self._$http(request).then(
            function() {
                deferred.resolve(true);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la suppression du sujet.');
            }
        );

        return deferred.promise;
    };

    public duplicate = function(ids: number[], folder: IFolder = undefined): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        var folderId;
        if(folder){
            folderId = folder.id;
        } else{
            folderId = null;
        }
        
        var body = {subjectIds: ids, folderId: folderId};

        let request = {
            method: 'POST',
            url: 'exercizer/subject/duplicate',
            data: body
        };

        this._$http(request).then(
            function(response) {
                deferred.resolve(true);
            },
            function(e) {
                deferred.reject(e.data.error);
            }
        );

        return deferred.promise;
    };
    
    public duplicateSubjectsFromLibrary = function(subjectIds:number[], folderId:number) {
        var self = this,
            deferred = this._$q.defer();

        let param = {subjectIds: subjectIds, folderId: folderId};

        let request = {
            method: 'POST',
            url: 'exercizer/subjects/duplicate/library',
            data: param
        };

        this._$http(request).then(
            function(response) {
                deferred.resolve(true);
            },
            function(e) {
                deferred.reject(e.data.error);
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

    public getByIdEvenDeleted = function(id:number) : ng.IPromise<any> {
        var deferred = this._$q.defer(), res;
        this.getSubjectListEvenDeleted().then(function(subjectList){
            angular.forEach(subjectList, function(subjectObject){
                if(id == subjectObject.id){
                    res = SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject)) as any;
                }
            });
            if(res){
                deferred.resolve(res);
            } else{
                deferred.reject("subject non trouvé");
            }

        }.bind(this));
        return deferred.promise;

    };

    private getSubjectListEvenDeleted = function() : ng.IPromise<any> {
        var deferred = this._$q.defer(),
        request = {
            method: 'GET',
            url: 'exercizer/subjects-all'
        };
        this._$http(request).then(
            function(data) {
                deferred.resolve(data.data);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la reciperation de tous les sujets.');
            }
        );
        return deferred.promise;
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