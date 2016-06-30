interface ISubjectTagService {
    resolve(): ng.IPromise<ISubjectTag[]>;
    persist(subjectTag:ISubjectTag): ng.IPromise<ISubjectTag>;
    resolveBySubjectId(subjectId:number): ng.IPromise<ISubjectTag[]>;
    getListBySubjectId(subjectId:number): ISubjectTag[];
}

class SubjectTagService implements ISubjectTagService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:ISubjectTag};
    private _listMappedBySubjectId: {[subjectId:number]:ISubjectTag[]};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
    }

    public resolve = function():ng.IPromise<ISubjectTag[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subject-tags'
            };

        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(MapToListHelper.toList(this._listMappedById));
        } else {
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};

                    angular.forEach(response.data, function (subjectTagObject) {
                        var subjectTag = SerializationHelper.toInstance(new SubjectTag(), JSON.stringify(subjectTagObject));
                        self._listMappedById[subjectTag.id] = subjectTag;
                    });

                    deferred.resolve(MapToListHelper.toList(self._listMappedById));
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des tags des sujets de la bibliothèque.');
                }
            );
        }
        return deferred.promise;
    };

    public persist = function(subjectTag:ISubjectTag):ng.IPromise<ISubjectTag> {
        var self = this,
            deferred = this._$q.defer();

        var subjectTagObject = angular.copy(subjectTag);

        var request = {
            method: 'POST',
            url: 'exercizer/subject-tag',
            data: subjectTagObject
        };

        this._$http(request).then(
            function (response) {
                var subjectTag = SerializationHelper.toInstance(new SubjectTag(), JSON.stringify(response.data));

                if (angular.isUndefined(self._listMappedById[subjectTag.id])) {
                    self._listMappedById[subjectTag.id] = [];
                }

                self._listMappedById[subjectTag.id].push(subjectTag);

                deferred.resolve(subjectTag);
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la création du tag.')
            }
        );

        return deferred.promise;
    };
    
    public resolveBySubjectId(subjectId:number):ng.IPromise<ISubjectTag[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject-tags-by-subject-id',
                data: {
                    subject_id: subjectId
                }
            };

        if (angular.isUndefined(this._listMappedBySubjectId)) {
            this._listMappedBySubjectId = {};
        }

        if (!angular.isUndefined(this._listMappedBySubjectId[subjectId])) {
            deferred.resolve(this._listMappedBySubjectId[subjectId]);
        } else {
            this._$http(request).then(
                function(response) {

                    self._listMappedBySubjectId[subjectId] = [];

                    angular.forEach(response.data, function (subjectTagObject) {
                        var subjectTag = SerializationHelper.toInstance(new SubjectTag(), JSON.stringify(subjectTagObject));
                        self._listMappedBySubjectId[subjectId].push(subjectTag);
                    });

                    deferred.resolve(self._listMappedBySubjectId[subjectId]);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des tags des sujets de la bibliothèque.');
                }
            );
        }
        return deferred.promise;
    };

    public getListBySubjectId = function(subjectId:number):ISubjectTag[] {
        return this._listMappedBySubjectId[subjectId] ? this._listMappedBySubjectId[subjectId] : [];
    };
}

