interface ISubjectLessonTypeService {
    resolve(): ng.IPromise<boolean>;
    getList(): ISubjectLessonType[];
    resolveBySubjectIdList(subjectIds:number[]):ng.IPromise<boolean>;
    getBySubjectId(subjectId:number): ISubjectLessonType;
}

class SubjectLessonTypeService implements ISubjectLessonTypeService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:ISubjectLessonType};
    private _listMappedBySubjectId: {[subjectId:number]:ISubjectLessonType};

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
                url: 'exercizer/subject-lesson-types'
            };

        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};

                    angular.forEach(response.data, function (subjectLessonTypeObject) {
                        var subjectLessonType = SerializationHelper.toInstance(new SubjectLessonType(), JSON.stringify(subjectLessonTypeObject));
                        self._listMappedById[subjectLessonType.id] = subjectLessonType;
                    });

                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des matières des sujets de la bibliothèque.');
                }
            );
        }
        return deferred.promise;
    };

    public getList = function():ISubjectLessonType[] {
        return MapToListHelper.toList(this._listMappedById);
    };

    public resolveBySubjectIdList = function(subjectIds:number[]):ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        if (subjectIds.length === 0) {
            deferred.resolve(true);
        } else {

            // the resulting ajax result is sorted by subject id
            subjectIds = subjectIds.sort(function (id1:number, id2:number) {
                return id1 - id2;
            });

            var request = {
                method: 'POST',
                url: 'exercizer/subject-lesson-types-by-subject-ids',
                data: {
                    subject_id_list: subjectIds
                }
            };

            var callBackend = false;

            if (angular.isUndefined(this._listMappedBySubjectId)) {
                this._listMappedBySubjectId = {};
                callBackend = true;
            } else {
                angular.forEach(subjectIds, function (subjectId:number) {
                    if (!callBackend && angular.isUndefined(this._listMappedBySubjectId[subjectId])) {
                        callBackend = true;
                    }
                }, this);
            }

            if (!callBackend) {
                deferred.resolve(true);
            } else {
                this._$http(request).then(
                    function (response) {

                        for (var i = 0; i < subjectIds.length; ++i) {
                            var subjectLessonTypeObject = response.data[i];
                            self._listMappedBySubjectId[subjectIds[i]] = SerializationHelper.toInstance(new SubjectLessonType(), JSON.stringify(subjectLessonTypeObject));
                        }

                        deferred.resolve(true);
                    },
                    function () {
                        deferred.reject('Une erreur est survenue lors de la récupération des niveaux des sujets de la bibliothèque.');
                    }
                );
            }
        }
        return deferred.promise;
    };

    public getBySubjectId = function(subjectId:number): ISubjectLessonType {
        return this._listMappedBySubjectId[subjectId];
    };
}
