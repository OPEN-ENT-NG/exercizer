import { ng } from 'entcore';
import { ISubject, Subject, ISubjectTag, ISubjectLessonType, ISubjectLessonLevel } from '../models/domain';
import { IGrainService } from '../services/GrainService';
import { ISubjectTagService } from './SubjectTagService';
import { SerializationHelper } from '../models/helpers';

export interface ISubjectLibraryService {
    publish(subject:ISubject, authorsContributors:string, subjectLessonTypeId:number, subjectLessonLevelId:number, subjectTagList:ISubjectTag[], file:any): Promise<boolean>;
    search(/*filters:{title:string/*, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}*/): Promise<ISubject[]>;
    count(/*filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}*/): Promise<Number>;
    countNewSubjects(): Promise<Number>;
    tmpSubjectForPreview:ISubject;
    unpublish(subjectId:number): Promise<boolean>;
}

export class SubjectLibraryService implements ISubjectLibraryService {

    static $inject = [
        '$q',
        '$http',
        'GrainService',
        'SubjectTagService'
    ];
    
    private _tmpSubjectForPreview:ISubject;

    constructor
    (
        private _$q,
        private _$http,
        private _grainService: IGrainService,
        private _subjectTagService: ISubjectTagService
    ) {
        this._$q = _$q;
        this._$http = _$http;
        this._grainService = _grainService;
        this._subjectTagService = _subjectTagService;
    }

    public publish = function(subject:ISubject, authorsContributors:string, subjectLessonTypeId:number, subjectLessonLevelId:number, subjectTagList:ISubjectTag[], file:any): Promise<boolean> {
        if (file) {
            return this.publishWithFile(subject, authorsContributors, subjectLessonTypeId, subjectLessonLevelId, subjectTagList, file);           
        } else {
            return this.publishWithoutFile(subject, authorsContributors, subjectLessonTypeId, subjectLessonLevelId, subjectTagList);
        }
    };
    
    private publishWithoutFile = function(subject:ISubject, authorsContributors:string, subjectLessonTypeId:number, subjectLessonLevelId:number, subjectTagList:ISubjectTag[]): Promise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        let param = {authorsContributors: authorsContributors,
            subjectLessonTypeId: Number(subjectLessonTypeId), subjectLessonLevelId: Number(subjectLessonLevelId), subjectTagList:subjectTagList};

        let publishRequest = {
            method: 'POST',
            url: 'exercizer/subject/'+ subject.id + '/publish/library',
            data: param
        };

        this._$http(publishRequest).then(
            function(response) {
                deferred.resolve(true);
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );
        
        return deferred.promise;
    };

    public publishWithFile = function(subject:ISubject, authorsContributors:string, subjectLessonTypeId:number, subjectLessonLevelId:number, subjectTagList:ISubjectTag[], file:any): Promise<boolean>  {
        let param = {authorsContributors: authorsContributors,
            subjectLessonTypeId: Number(subjectLessonTypeId), subjectLessonLevelId: Number(subjectLessonLevelId), subjectTagList:subjectTagList};
        var formData = new FormData();
        formData.append('file', file);
        formData.append('param', JSON.stringify(param));

        var deferred = this._$q.defer();

        this._$http.post('exercizer/subject/simple/'+ subject.id + '/publish/library', formData, {
            withCredentials: false,
            headers: {
                'Content-Type': undefined
            },
            transformRequest: angular.identity,
            data: {
                formData
            },
            responseType: 'json'

        }).then(function(response) {
                deferred.resolve(true);
            },
            function(e) {
                deferred.reject(e.data.error);
            }
        );
        return deferred.promise;
    };

    public unpublish = function(subjectId:number): Promise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        let unpublishRequest = {
            method: 'DELETE',
            url: 'exercizer/subject/' + subjectId + '/unpublish/library'
        };

        this._$http(unpublishRequest).then(
            function(response) {
                deferred.resolve(true);
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );

        return deferred.promise;
    };

    public search = function(/*filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}*/): Promise<ISubject[]> {
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
                deferred.reject('exercizer.error');
            }
        );

        return deferred.promise;
    };

    public count = function(/*filters:{title:string, subjectLessonType:ISubjectLessonType, subjectLessonLevel:ISubjectLessonLevel, subjectTagList:ISubjectTag[]}*/): Promise<Number> {
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
                deferred.reject('exercizer.error');
            }
        );

        return deferred.promise;
    };

    public countNewSubjects = function(): Promise<Number> {
        var deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/count-new-library-subject',
                data: {}
            };

        this._$http(request).then(
            function(response) {
                deferred.resolve(parseInt(response.data.count));
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

export const subjectLibraryService = ng.service('SubjectLibraryService', SubjectLibraryService);