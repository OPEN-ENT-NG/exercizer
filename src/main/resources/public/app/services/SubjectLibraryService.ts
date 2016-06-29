interface ISubjectLibraryService {
    publish(subject:ISubject, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]): ng.IPromise<boolean>;
    search(searchData:any): ng.IPromise<ISubject[]>;
    count(searchData:any): ng.IPromise<Number>;
}

class SubjectLibraryService implements ISubjectLibraryService {

    static $inject = [
        '$q',
        '$http',
        'GrainService',
        'SubjectTagService'
    ];

    constructor
    (
        private _$q: ng.IQService,
        private _$http: ng.IHttpService,
        private _grainService: IGrainService,
        private _subjectTagService: ISubjectTagService
    ) {
        this._$q = _$q;
        this._$http = _$http;
        this._grainService = _grainService;
        this._subjectTagService = _subjectTagService;
    }
    
    public publish = function(subject:ISubject, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        var publishedSubject = CloneObjectHelper.clone(subject, true);
        publishedSubject.id = undefined;
        publishedSubject.owner = undefined;
        publishedSubject.is_library_subject = true;

        var subjectRequest = {
            method: 'POST',
            url: 'exercizer/subject',
            data: subject
        };

        this._$http(subjectRequest).then(
            function(response) {
                publishedSubject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data));

                self._grainService.getListBySubject(subject).then(
                    function(grainList: IGrain[]) {
                        var grainListCopy = angular.copy(grainList);
                        self._grainService.duplicateList(grainListCopy, publishedSubject, false).then(
                            function() {

                                var subjectLibraryMainInformationRequest = {
                                    method: 'POST',
                                    url: 'exercizer/subject-library-main-information/' + publishedSubject.id,
                                    data : {
                                        'subject_id': publishedSubject.id,
                                        'subject_lesson_type_id': subjectLessonType.id,
                                        'subject_lesson_level_id': subjectLessonLevel.id
                                    }
                                };

                                self._$http(subjectLibraryMainInformationRequest).then(
                                    function() {

                                        if (subjectTagList.length > 0) {

                                            var promises = [],
                                                subjectLibraryTagRequest = {
                                                    method: 'POST',
                                                    url: 'exercizer/subject-library-tag/' + publishedSubject.id,
                                                    data: {
                                                        'subject_id': publishedSubject.id
                                                    }
                                                };

                                            angular.forEach(subjectTagList, function (subjectTag:ISubjectTag) {

                                                if (angular.isUndefined(subjectTag.id)) {
                                                    promises.push(self._subjectTagService.persist(subjectTag));
                                                }

                                            });

                                            if (promises.length > 0) {
                                                self._$q.all(promises).then(
                                                    function (createdSubjectTagList:ISubjectTag[]) {

                                                        promises = [];

                                                        angular.forEach(subjectTagList, function (subjectTag:ISubjectTag) {
                                                            if (!angular.isUndefined(subjectTag.id)) {
                                                                var newSubjectLibraryTagRequest = angular.copy(subjectLibraryTagRequest);
                                                                newSubjectLibraryTagRequest.data.subject_tag_id = subjectTag.id;

                                                                promises.push(self._$http(newSubjectLibraryTagRequest));
                                                            }
                                                        });

                                                        angular.forEach(createdSubjectTagList, function (subjectTag:ISubjectTag) {
                                                            var newSubjectLibraryTagRequest = angular.copy(subjectLibraryTagRequest);
                                                            newSubjectLibraryTagRequest.data.subject_tag_id = subjectTag.id;

                                                            promises.push(self._$http(newSubjectLibraryTagRequest));
                                                        });

                                                        self._$q.all(promises).then(
                                                            function () {
                                                                deferred.resolve(true);
                                                            },
                                                            function () {
                                                                deferred.reject('Une erreur est survenue lors de la publication du sujet : impossible d\'associer les tags.');
                                                            }
                                                        );

                                                    }, function (err) {
                                                        deferred.reject(err);
                                                    }
                                                );
                                            } else {
                                                promises = [];

                                                angular.forEach(subjectTagList, function (subjectTag:ISubjectTag) {
                                                    if (!angular.isUndefined(subjectTag.id)) {
                                                        var newSubjectLibraryTagRequest = angular.copy(subjectLibraryTagRequest);
                                                        newSubjectLibraryTagRequest.data.subject_tag_id = subjectTag.id;

                                                        promises.push(self._$http(newSubjectLibraryTagRequest));
                                                    }
                                                });

                                                self._$q.all(promises).then(
                                                    function () {
                                                        deferred.resolve(true);
                                                    },
                                                    function () {
                                                        deferred.reject('Une erreur est survenue lors de la publication du sujet : impossible d\'associer les tags.');
                                                    }
                                                );
                                            }
                                        } else {
                                            deferred.resolve(true);
                                        }
                                    },
                                    function() {
                                        deferred.reject('Une erreur est survenue lors de la publication du sujet : impossible d\'associer la matière ou le niveau.');
                                    }
                                );

                            },
                            function() {
                                deferred.reject('Une erreur est survenue lors de la duplication des éléments du sujet à publier.');
                            }
                        );
                    },
                    function() {
                        deferred.reject('Une erreur est survenue lors de la récupération des éléments du sujet à publier.')
                    }
                );
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la publication du sujet.');
            }
        );

        return deferred.promise;
    };

    public search = function(searchData:any): ng.IPromise<ISubject[]> {
        var deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subjects-for-library',
                data: searchData
            };

        this._$http(request).then(
            function(response) {
                var subjectList = [];
                angular.forEach(response.data, function(subjectObject) {
                    subjectList.push(SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject)));
                });
                deferred.resolve(subjectList);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la récupération des sujets de la bibliothèque.');
            }
        );

        return deferred.promise;
    };

    public count = function(searchData:any): ng.IPromise<Number> {
        var deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/count-subjects-for-library',
                data: searchData
            };

        this._$http(request).then(
            function(response) {
                deferred.resolve(parseInt(response.data));
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la récupération des sujets de la bibliothèque.');
            }
        );

        return deferred.promise;
    };

}
