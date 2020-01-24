import { ng } from 'entcore';
import { ISubject, IGrainCustomCopy, ISubjectScheduled, SubjectScheduled } from '../models/domain';
import { SerializationHelper, MapToListHelper } from '../models/helpers';
import { ISubjectCopyService } from './SubjectCopyService';
import { IGrainService } from './GrainService';
import { IGrainScheduledService } from './GrainScheduledService';
import { IGrainCopyService } from './GrainCopyService';
import { IDateService } from './DateService';

export interface ISubjectScheduledService {
    resolve(isTeacher:boolean): Promise<boolean>;
    persist(subjectScheduled:ISubjectScheduled):Promise<ISubjectScheduled>;
    schedule(subjectScheduled:ISubjectScheduled, grainsCustomCopyData:IGrainCustomCopy[]):Promise<ISubjectScheduled>
    unScheduled(subjectScheduled:ISubjectScheduled):Promise<ISubjectScheduled>;
    createFromSubject(subject:ISubject):ISubjectScheduled;
    getList():ISubjectScheduled[];
    getById(id:number):ISubjectScheduled;
    currentSubjectScheduledId:number;
    removeCorrectedFile(id): Promise<any>;
    addCorrectedFile(id, file): Promise<string>;
    getBySubjectId(id:number):ISubjectScheduled;
}

export class SubjectScheduledService implements ISubjectScheduledService {

    static $inject = [
        '$q',
        '$http',
        '$location',
        'SubjectCopyService',
        'GrainService',
        'GrainScheduledService',
        'GrainCopyService',
        'DateService'
    ];

    private _listMappedById:{[id:number]:ISubjectScheduled;};
    private _currentSubjectScheduledId:number;
    private _today;

    constructor
    (
        private _$q,
        private _$http,
        private _$location,
        private _subjectCopyService:ISubjectCopyService,
        private _grainService:IGrainService,
        private _grainScheduledService:IGrainScheduledService,
        private _grainCopyService:IGrainCopyService,
        private _dateService : IDateService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._$location = _$location;
        this._subjectCopyService = _subjectCopyService;
        this._grainService = _grainService;
        this._grainScheduledService = _grainScheduledService;
        this._grainCopyService = _grainCopyService;
        this._dateService = _dateService;
        this._today = new Date()
    }

    public resolve = function(isTeacher:boolean):Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: isTeacher ? 'exercizer/subjects-scheduled' : ('exercizer/subjects-scheduled-by-subjects-copy/'+new Date().getTimezoneOffset())
            };

        if (this._listMappedById) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};
                    var subjectScheduled;
                    angular.forEach(response.data, function(subjectScheduledObject) {
                        subjectScheduled = SerializationHelper.toInstance(new SubjectScheduled(), JSON.stringify(subjectScheduledObject)) as any;
                        subjectScheduled.scheduled_at = JSON.parse(subjectScheduled.scheduled_at);
                        subjectScheduled.corrected_metadata = JSON.parse(subjectScheduled.corrected_metadata);                       
                        self._listMappedById[subjectScheduled.id] = subjectScheduled;
                    });
                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('exercizer.error');
                }
            );
        }
        return deferred.promise;
    };

    public persist = function(subjectScheduled:ISubjectScheduled):Promise<ISubjectScheduled> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject-scheduled/' + subjectScheduled.subject_id,
                data: subjectScheduled
            };

        this._$http(request).then(
            function(response) {
                var subjectScheduled = SerializationHelper.toInstance(new SubjectScheduled(), JSON.stringify(response.data)) as any;
                subjectScheduled.scheduled_at = JSON.parse(subjectScheduled.scheduled_at);
                if(angular.isUndefined(self._listMappedById)){
                    self._listMappedById= {};
                }
                self._listMappedById[subjectScheduled.id] = subjectScheduled;
                deferred.resolve(subjectScheduled);
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );
        return deferred.promise;
    };

    public addCorrectedFile = function(id, file): Promise<string>  {
        var formData = new FormData();
        formData.append('file', file);

        var deferred = this._$q.defer();         ;

        this._$http.put('exercizer/subject-scheduled/add/corrected/' + id, formData, {
            withCredentials: false,
            headers: {
                'Content-Type': undefined
            },
            transformRequest: angular.identity,
            data: {
                formData
            },
            responseType: 'json'

        }).then(function(response){
                deferred.resolve(response.data.fileId);
            },
            function(e) {
                deferred.reject(e.data.error);
            }
        );
        return deferred.promise;
    };

    public removeCorrectedFile = function(id): Promise<any>  {       
        var deferred = this._$q.defer(), request = {
            method: 'PUT',
            url: 'exercizer/subject-scheduled/remove/corrected/' + id           
        };

        this._$http(request).then(function(response){
                deferred.resolve();
            },
            function() {
                deferred.reject("exercizer.error");
            }
        );
        return deferred.promise;
    };


    public schedule = function(subjectScheduled:ISubjectScheduled, grainsCustomCopyData:IGrainCustomCopy[]):Promise<ISubjectScheduled> {
        var self = this,
            deferred = this._$q.defer(),
            doRedirect = !subjectScheduled.is_training_mode;

        let param = {subjectTitle: subjectScheduled.title, beginDate: subjectScheduled.begin_date, dueDate: subjectScheduled.due_date,
            estimatedDuration: subjectScheduled.estimated_duration, isOneShotSubmit: subjectScheduled.is_one_shot_submit,
            isTrainingMode: subjectScheduled.is_training_mode, isTrainingPermitted: subjectScheduled.is_training_permitted,
            randomDisplay: subjectScheduled.random_display, scheduledAt:subjectScheduled.scheduled_at, grainsCustomCopyData: grainsCustomCopyData};
        
        let request = {
            method: 'POST',
            url: 'exercizer/schedule-subject/' + subjectScheduled.subject_id,
            data: param
        };

        this._$http(request).then(
            function(response) {
                delete self._listMappedById;
                deferred.resolve();

                if (doRedirect) {
                    let redirect: string = "/dashboard/teacher/correction/";
                    if(response.data != null && response.data.id != null)
                        redirect += response.data.id;
                    self._$location.path(redirect);
                }
            },
            function(e) {
                if (e.status == 400) {
                    deferred.reject(e.data.error);
                } else {
                    deferred.reject('exercizer.error');
                }
            }
        );
        return deferred.promise;
    };

    public simpleSchedule = function(subjectScheduled:ISubjectScheduled):Promise<ISubjectScheduled> {
        var self = this,
            deferred = this._$q.defer();

        let param = {subjectTitle: subjectScheduled.title, beginDate: subjectScheduled.begin_date, dueDate: subjectScheduled.due_date,
            correctedDate: subjectScheduled.corrected_date, scheduledAt:subjectScheduled.scheduled_at};

        let request = {
            method: 'POST',
            url: 'exercizer/schedule-simple-subject/' + subjectScheduled.subject_id,
            data: param
        };

        this._$http(request).then(
            function(response) {
                delete self._listMappedById;
                deferred.resolve();

                let redirect: string = "/dashboard/teacher/correction/";
                if(response.data != null && response.data.id != null)
                    redirect += response.data.id;
                self._$location.path(redirect);
            },
            function(e) {
                if (e.status == 400) {
                    deferred.reject(e.data.error);
                } else {
                    deferred.reject('exercizer.error');
                }
            }
        );
        return deferred.promise;
    };

    public modifySchedule =  function(subjectScheduled:ISubjectScheduled):Promise<ISubjectScheduled> {
        var self = this,
            deferred = this._$q.defer();

        let param = {beginDate: subjectScheduled.begin_date, dueDate: subjectScheduled.due_date,
            correctedDate: subjectScheduled.corrected_date, offset:new Date().getTimezoneOffset(),
            isTrainingPermitted: subjectScheduled.is_training_permitted};

        let request = {
            method: 'POST',
            url: 'exercizer/schedule-subject/modify/' + subjectScheduled.id,
            data: param
        };

        this._$http(request).then(
            function(response) {
                delete self._listMappedById;
                deferred.resolve();
            },
            function(e) {
                if (e.status == 400) {
                    deferred.reject(e.data.error);
                } else {
                    deferred.reject('exercizer.error');
                }
            }
        );
        return deferred.promise;
    };

    public unScheduled = function(subjectScheduled:ISubjectScheduled):Promise<ISubjectScheduled> {
        var self = this,
            deferred = this._$q.defer();

        let request = {
            method: 'DELETE',
            url: 'exercizer/unschedule-subject/' + subjectScheduled.id
        };

        this._$http(request).then(
            function(response) {
                delete self._listMappedById;
                deferred.resolve();
            },
            function(e) {
                if (e.status == 400) {
                    deferred.reject(e.data.error);
                } else {
                    deferred.reject('exercizer.error');
                }
            }
        );
        return deferred.promise;
    };

    public createFromSubject = function(subject:ISubject):ISubjectScheduled {
        var subjectScheduled = new SubjectScheduled();

        subjectScheduled.subject_id = subject.id;
        subjectScheduled.title = subject.title;
        subjectScheduled.description = subject.description;
        subjectScheduled.picture = subject.picture;
        subjectScheduled.max_score = subject.max_score;

        return subjectScheduled;
    };

    public getList = function():ISubjectScheduled[] {
        if (!angular.isUndefined(this._listMappedById)) {
            return MapToListHelper.toList(this._listMappedById);
        } else {
            return [];
        }
    };

    public getById = function(id:number):ISubjectScheduled {
        if (!angular.isUndefined(this._listMappedById)) {
            return this._listMappedById[id];
        }
    };

    public getBySubjectId = function(id:number):ISubjectScheduled {
        if (!angular.isUndefined(this._listMappedById)) {
            var list:ISubjectScheduled[] = this.getList();
            for (var i = 0; i < list.length; i++) {
                if (list[i].subject_id == id) {
                    return list[i];
                }
            }
            return undefined;
        }
    }

    get currentSubjectScheduledId():number {
        return this._currentSubjectScheduledId;
    }

    set currentSubjectScheduledId(value:number) {
        this._currentSubjectScheduledId = value;
    }

    get listMappedById():{} {
        return this._listMappedById;
    }

    public is_over(subjectScheduled : ISubjectScheduled) : boolean {
        // false (3) means if the date is equal, the subject is not over
        return this._dateService.compare_after(this._today, this._dateService.isoToDate(subjectScheduled.due_date), false)
    }
}

export const subjectScheduledService = ng.service('SubjectScheduledService', SubjectScheduledService);