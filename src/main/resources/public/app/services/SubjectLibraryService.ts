interface ISubjectLibraryService {
    publish(subject:ISubject, subjectLessonTypeId:number, subjectLessonLevelId:number, subjectTagList:ISubjectTag[]): ng.IPromise<boolean>;
    search(filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}): ng.IPromise<ISubject[]>;
    count(filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}): ng.IPromise<Number>;
    tmpSubjectForPreview:ISubject;
}

class SubjectLibraryService implements ISubjectLibraryService {

    static $inject = [
        '$q',
        '$http',
        'GrainService',
        'SubjectTagService'
    ];
    
    private _tmpSubjectForPreview:ISubject;

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
    
    public publish = function(subject:ISubject, subjectLessonTypeId:number, subjectLessonLevelId:number, subjectTagList:ISubjectTag[]): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        var publishedSubject = CloneObjectHelper.clone(subject, true);
        publishedSubject.id = undefined;
        publishedSubject.owner = undefined;
        publishedSubject.is_library_subject = true;

        var subjectRequest = {
            method: 'POST',
            url: 'exercizer/subject',
            data: publishedSubject
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
                                        subject_id: publishedSubject.id,
                                        subject_lesson_type_id: subjectLessonTypeId,
                                        subject_lesson_level_id: subjectLessonLevelId
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
                                                        subject_id: publishedSubject.id,
                                                        subject_tag_id: undefined
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

    public search = function(filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}): ng.IPromise<ISubject[]> {
        var deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subjects-for-library', 
                data: this._buildRequestData(filters)
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

    public count = function(filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}): ng.IPromise<Number> {
        var deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/count-subjects-for-library',
                data: this._buildRequestData(filters)
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

    private _buildRequestData(filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}) {
        var requestData = {};
        
        if (!angular.isUndefined(filters)) {

            if (!angular.isUndefined(filters.title)) {
                requestData['subject_title'] = filters.title;
            }

            if (!angular.isUndefined(filters.subjectLessonType)) {
                requestData['subject_lesson_type_id'] = filters.subjectLessonType.id;
            }

            if (!angular.isUndefined(filters.subjectLessonLevel)) {
                requestData['subject_lesson_level_id'] = filters.subjectLessonLevel.id;
            }

            if (!angular.isUndefined(filters.subjectTagList) && filters.subjectTagList.length > 0) {
                requestData['subject_tags'] = [];

                angular.forEach(filters.subjectTagList, function (subjectTag:ISubjectTag) {
                    requestData['subject_tags'].push(subjectTag.id)
                });
            }
        }

        return requestData;
    };
    
    get tmpSubjectForPreview():ISubject {
        return this._tmpSubjectForPreview;
    }

    set tmpSubjectForPreview(value:ISubject) {
        this._tmpSubjectForPreview = value;
    }
}
