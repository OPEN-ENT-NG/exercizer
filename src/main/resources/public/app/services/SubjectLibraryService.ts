interface ISubjectLibraryService {
    publish(subject:ISubject, authorsContributors:string, subjectLessonTypeId:number, subjectLessonLevelId:number, subjectTagList:ISubjectTag[]): ng.IPromise<boolean>;
    search(/*filters:{title:string/*, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}*/): ng.IPromise<ISubject[]>;
    count(/*filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}*/): ng.IPromise<Number>;
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
    
    public publish = function(subject:ISubject, authorsContributors:string, subjectLessonTypeId:number, subjectLessonLevelId:number, subjectTagList:ISubjectTag[]): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        let param = {subjectId: subject.id, authorsContributors: authorsContributors,
            subjectLessonTypeId: Number(subjectLessonTypeId), subjectLessonLevelId: Number(subjectLessonLevelId), subjectTagList:subjectTagList};

        let publishRequest = {
            method: 'POST',
            url: 'exercizer/subject/publish/library',
            data: param
        };

        this._$http(publishRequest).then(
            function(response) {
                deferred.resolve(true);
            },
            function() {
                deferred.reject('exercizer.publish.error');
            }
        );
        
        return deferred.promise;
    };

    public search = function(/*filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}*/): ng.IPromise<ISubject[]> {
        var deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subjects-for-library', 
                data: /*this._buildRequestData(filters)*/ {}
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

    public count = function(/*filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}*/): ng.IPromise<Number> {
        var deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/count-subjects-for-library',
                data: /*this._buildRequestData(filters)*/ {}
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
