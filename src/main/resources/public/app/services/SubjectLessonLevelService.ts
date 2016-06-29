interface ISubjectLessonLevelService {
    resolve(): ng.IPromise<boolean>;
    getList(): ISubjectLessonLevel[];
    resolveBySubjectIdList(subjectIds:number[]):ng.IPromise<boolean>;
    getBySubjectId(subjectId:number): ISubjectLessonLevel;
}

class SubjectLessonLevelService implements ISubjectLessonLevelService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:ISubjectLessonLevel};
    private _listMappedBySubjectId: {[subjectId:number]:ISubjectLessonLevel};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
    }

    public resolve = function():ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subject-lesson-levels'
            };
        
        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};

                    angular.forEach(response.data, function (subjectLessonLevelObject) {
                        var subjectLessonLevel = SerializationHelper.toInstance(new SubjectLessonLevel(), JSON.stringify(subjectLessonLevelObject));
                        self._listMappedById[subjectLessonLevel.id] = subjectLessonLevel;
                    });

                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des niveaux des sujets de la bibliothèque.');
                }
            );
        }
        return deferred.promise;
    };

    public getList = function():ISubjectLessonLevel[] {
        return MapToListHelper.toList(this._listMappedById);
    };
    
    public resolveBySubjectIdList = function(subjectIds:number[]):ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject-lesson-levels-by-subject-ids',
                data: {
                    subject_id_list: subjectIds
                }
            };

        // the resulting ajax result is sorted by subject id
        subjectIds = subjectIds.sort(function(id1: number, id2: number) {
            return id1 - id2;
        });

        var callBackend = false;

        if (angular.isUndefined(this._listMappedBySubjectId)) {
            this._listMappedBySubjectId = {};
            callBackend = true;
        } else {
            angular.forEach(subjectIds, function(subjectId:number) {
                if (!callBackend && angular.isUndefined(this._listMappedBySubjectId[subjectId])) {
                    callBackend = true;
                }
            }, this);
        }

        if (!callBackend) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {

                    for (var i = 0 ; i < subjectIds.length ; +i) {
                        var subjectLessonLevelObject = response.data[i];
                        self._listMappedBySubjectId[subjectIds[i]] = SerializationHelper.toInstance(new SubjectLessonLevel(), JSON.stringify(subjectLessonLevelObject));
                    }

                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des niveaux des sujets de la bibliothèque.');
                }
            );
        }
        return deferred.promise;
    };

    public getBySubjectId = function(subjectId:number): ISubjectLessonLevel {
        return this._listMappedBySubjectId[subjectId];
    };
}
