import { ng, idiom, moment, notify } from 'entcore';
import { SerializationHelper, MapToListHelper } from '../models/helpers';
import { IGrainCopy, IGrainScheduled, ISubjectCopy, ISubjectScheduled, SubjectCopy } from '../models/domain';
import { _ } from 'entcore';
import { ISubjectCopyFile } from '../models/domain/SubjectCopyFile';

function cleanBeforeSave(subject: ISubjectCopy|ISubjectScheduled):ISubjectCopy|ISubjectScheduled{
    const copy:any = {...subject}
    if(copy.owner && copy.owner.userId){
        copy.owner = copy.owner.userId;
    }
    delete copy["tracker"];
    return copy;
}

export interface ISubjectCopyService {
    resolve(isTeacher:boolean): Promise<boolean>;
    persist(subjectCopy:ISubjectCopy):Promise<ISubjectCopy>;
    update(subjectCopy:ISubjectCopy):Promise<ISubjectCopy>;
    submit(subjectCopy:ISubjectCopy):Promise<ISubjectCopy>;
    correct(subjectCopy:ISubjectCopy):Promise<ISubjectCopy>;
    addToCache(subjectCopyRaw: any): void;
    createFromSubjectScheduled(subjectScheduled:ISubjectScheduled):ISubjectCopy;
    getList():ISubjectCopy[];
    getById(id:number):ISubjectCopy;
    submitSimpleCopy(id:number): Promise<ISubjectCopy>;
    addHomeworkFile(id:number, file): Promise<String>;
    removeHomeworkFile(id:number, fileId:string): Promise<any>;
    downloadSimpleCopies(idCopies:string[]): string;
    downloadSimpleCopy(id:string, fileId:string): string;
    downloadMySimpleCopy(id:string, fileId:string): string;
    addCorrectedFile(id, file): Promise<ISubjectCopyFile>;
    removeCorrectedFile(id:number, fileId:string): Promise<any>;
    remindCustomCopies(copyIds:number[], subject:string, body:string): Promise<Boolean>;
    remindAutomaticCopies(copyIds:number[], subjectScheduleId:number): Promise<Boolean>;
    excludeCopies(copyIds:number[]): Promise<{}[]>;
    getListBySubjectScheduled(subjectScheduled : ISubjectScheduled): ISubjectCopy[];
    checkIsNotCorrectionOnGoingOrCorrected(subjectCopyId:number):Promise<boolean>;
    setCurrentGrain(subjectCopyId:number, grainCopyId: number): Promise<any>;
    retry(subjectCopy:ISubjectCopy, grainCopyList:IGrainCopy[]): Promise<ISubjectCopy>;
    canPerformACopyAsStudent(subjectScheduled: ISubjectScheduled, copy: ISubjectCopy): boolean;
    canAccessViewAsStudent(subjectScheduled: ISubjectScheduled, copy: ISubjectCopy): boolean;
}

export class SubjectCopyService implements ISubjectCopyService {

    static $inject = [
        '$q',
        '$http',
        'GrainScheduledService',
        'GrainCopyService',
        'DateService'
    ];

    private _listMappedById:{[id:number]:ISubjectCopy;};
    private _listBySubjectScheduled:ISubjectCopy[];
    private _tmpPreviewData:{subjectScheduled:ISubjectScheduled, subjectCopy:ISubjectCopy, grainScheduledList:IGrainScheduled[], grainCopyList:IGrainCopy[]};

    constructor
    (
        private _$q,
        private _$http,
        private _grainScheduledService,
        private _grainCopyService,
        private _dateService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._grainScheduledService = _grainScheduledService;
        this._grainCopyService = _grainCopyService;
        this._dateService = _dateService;
    }

    public resolve = function(isTeacher:boolean):Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: isTeacher ? 'exercizer/subjects-copy-by-subjects-scheduled' : 'exercizer/subjects-copy'
            };

        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};
                    self._listBySubjectScheduled = {};
                    var subjectCopy:ISubjectCopy;
                    angular.forEach(response.data, function(subjectCopyObject) {
                        subjectCopy = SerializationHelper.toInstance(new SubjectCopy(), JSON.stringify(subjectCopyObject));
                        if(!self._listBySubjectScheduled[subjectCopy.subject_scheduled_id]){
                            self._listBySubjectScheduled[subjectCopy.subject_scheduled_id] = [];
                        }
                        self._listBySubjectScheduled[subjectCopy.subject_scheduled_id].push(subjectCopy);
                        self._listMappedById[subjectCopy.id] = subjectCopy;
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

    public resolve_force = function(isTeacher:boolean):Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: isTeacher ? 'exercizer/subjects-copy-by-subjects-scheduled' : 'exercizer/subjects-copy'
            };
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};
                    self._listBySubjectScheduled = {};
                    var subjectCopy;
                    angular.forEach(response.data, function(subjectCopyObject) {
                        subjectCopy = SerializationHelper.toInstance(new SubjectCopy(), JSON.stringify(subjectCopyObject)) as any;
                        if(!self._listBySubjectScheduled[subjectCopy.subject_scheduled_id]){
                            self._listBySubjectScheduled[subjectCopy.subject_scheduled_id] = [];
                        }
                        self._listBySubjectScheduled[subjectCopy.subject_scheduled_id].push(subjectCopy);
                        self._listMappedById[subjectCopy.id] = subjectCopy;
                    });
                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('exercizer.error');
                }
            );
        return deferred.promise;
    };

    public checkIsNotCorrectionOnGoingOrCorrected(subjectCopyId:number):Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subject-copy/check/no-corrected/' + subjectCopyId
            };
        this._$http(request).then(
            function(response) {
                deferred.resolve(response.data.result);                
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );
        return deferred.promise;
    };

    public resolveBySubjectScheduled_force = function(subjectScheduled: ISubjectScheduled):Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subjects-copy-by-subject-scheduled/' + subjectScheduled.id,
                data : cleanBeforeSave(subjectScheduled)
            };
            this._$http(request).then(
                function(response) {
                    self._listBySubjectScheduled[subjectScheduled.id] = [];
                    var subjectCopy;
                    angular.forEach(response.data, function(subjectCopyObject) {
                        subjectCopy = SerializationHelper.toInstance(new SubjectCopy(), JSON.stringify(subjectCopyObject)) as any;
                        //WB-582 subjectCopy.corrected_metadata = JSON.parse(subjectCopy.corrected_metadata);
                        self._listBySubjectScheduled[subjectCopy.subject_scheduled_id].push(subjectCopy);

                    });
                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('exercizer.error');
                }
            );
        return deferred.promise;
    };

    public setCurrentGrain = function(subjectCopyId:number, grainCopyId: number): Promise<any> {
        var deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject-copy/' + subjectCopyId + '/last-grain/' + grainCopyId,
                data: {}
            };
        this._$http(request).then(
            function(response) {
                deferred.resolve(true);
            },
            function(e) {
                deferred.reject('exercizer.error');
            }
        );
        return deferred.promise;
    }


    public persist = function(subjectCopy:ISubjectCopy):Promise<ISubjectCopy> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject-copy/' + subjectCopy.subject_scheduled_id,
                data: cleanBeforeSave(subjectCopy)
            };
        this._$http(request).then(
            function(response) {
                var subjectCopy = SerializationHelper.toInstance(new SubjectCopy(), JSON.stringify(response.data)) as any;
                if(angular.isUndefined(self._listMappedById)){
                    self._listMappedById= {};
                }
                self._listMappedById[subjectCopy.id] = subjectCopy;
                deferred.resolve(subjectCopy);
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );
        return deferred.promise;
    };

    public submitSimpleCopy = function(id:number): Promise<ISubjectCopy>  {
        var deferred = this._$q.defer(),
            self = this,
            request = {
                method: 'PUT',
                url: 'exercizer/subject-copy/submit',
                data: {"id": id, "offset": new Date().getTimezoneOffset()}
            };
        
        this._$http(request).then(
            function(response) {
                deferred.resolve(response.data);
            },
            function(e) {
                if (e.status === 413) {
                    notify.error('exercizer.notify.file.weight');
                } else {
                    deferred.reject(e.data.error);
                }
            }
        );
        
        return deferred.promise;
    };

    public addHomeworkFile = function(id:number, file): Promise<String>  {
        var formData = new FormData();
        formData.append('file', file);
        
        var deferred = this._$q.defer();         ;

        this._$http.put(`exercizer/subject-copy/${id}/homework`, formData, {
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
                deferred.resolve(response.data);
            },
            function(e) {
                notify.close();
                
                if (e.status === 413) {
                    notify.error('exercizer.notify.file.weight');
                } else {
                    deferred.reject(e.data.error);
                }
            }
        );
        return deferred.promise;
    };

    public removeHomeworkFile = function(id:number, fileId:string): Promise<any>  {
        var deferred = this._$q.defer(), request = {
            method: 'DELETE',
            url: `exercizer/subject-copy/${id}/homework/${fileId}`
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

    public remindCustomCopies = function(copyIds:number[], subject:string, body:string): Promise<Boolean> {
        var deferred = this._$q.defer(),
            self = this,
            request = {
                method: 'POST',
                url: 'exercizer/subject-copy/custom/reminder',
                data: {ids:copyIds, subject: subject, body: body}
            };

        this._$http(request).then(
            function(response) {
                deferred.resolve(true);
            },
            function(e) {
                deferred.reject('exercizer.error');
            }
        );

        return deferred.promise;
    };

    public remindAutomaticCopies = function(copyIds:number[], subjectScheduleId:number): Promise<Boolean> {
        var deferred = this._$q.defer(),
            self = this,
            request = {
                method: 'POST',
                url: 'exercizer/subject-copy/automatic/reminder/' + subjectScheduleId,
                data: {ids:copyIds}
            };

        this._$http(request).then(
            function(response) {
                deferred.resolve(true);
            },
            function(e) {
                deferred.reject('exercizer.error');
            }
        );

        return deferred.promise;
    };

    public excludeCopies = function(copyIds:number[]): Promise<{}[]> {
        var deferred = this._$q.defer(),
            self = this,
            request = {
                method: 'POST',
                url: 'exercizer/subject-copy/action/exclude',
                data: {ids:copyIds}
            };

        this._$http(request).then(
            function(response) {
                deferred.resolve(response.data);
            },
            function(e) {
                deferred.reject('exercizer.error');
            }
        );

        return deferred.promise;
    };


    public addCorrectedFile = function(id, file): Promise<ISubjectCopyFile>  {
        var formData = new FormData();
        formData.append('file', file);
       var deferred = this._$q.defer();         ;

        this._$http.put(`exercizer/subject-copy/${id}/corrected`, formData, {
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
                deferred.resolve(response.data);
            },
            function(e) {
                deferred.reject(e.data.error);
            }
        );
        return deferred.promise;
    };

    public removeCorrectedFile = function(id:number, fileId:string): Promise<any>  {
        var deferred = this._$q.defer(), request = {
            method: 'DELETE',
            url: `exercizer/subject-copy/${id}/corrected/${fileId}`
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

    public downloadSimpleCopies = function(idCopies:string[]): string  {
        var url = '/exercizer/subject-copy/simple/downloads?';

        _.forEach(idCopies, function (id) {
            url += 'id=' + id + '&';
        });

        url = url.slice(0, -1);

        return url
       
    };

    public downloadSimpleCopy = function(id:string, fileId:string): string  {
        return `exercizer/subject-copy/${id}/homework/${fileId}`;
    };

    public downloadMySimpleCopy = function(id:string, fileId:string): string  {
        return `exercizer/subject-copy/${id}/mine/${fileId}`;
    };

    private write = function(subjectCopy:ISubjectCopy, action:String):Promise<ISubjectCopy> {
        var deferred = this._$q.defer(),
            self = this,
            request = {
                method: 'PUT',
                url: 'exercizer/subject-copy' + action,
                data: cleanBeforeSave(subjectCopy)
            };
        
            this._$http(request).then(
                function(response) {
                    subjectCopy = SerializationHelper.toInstance(new SubjectCopy(), JSON.stringify(response.data));
                    self.replaceInList(subjectCopy, self._listMappedById, self._listBySubjectScheduled);
                    deferred.resolve(subjectCopy);
                },
                function() {
                    deferred.reject('exercizer.error');
                }
            );
        
        return deferred.promise;
    };

    public update = function(subjectCopy:ISubjectCopy):Promise<ISubjectCopy> {
        return this.write(subjectCopy, '/report');
    };

    public submit = function(subjectCopy:ISubjectCopy):Promise<ISubjectCopy> {
        subjectCopy.offset = new Date().getTimezoneOffset();
        return this.write(subjectCopy, '/submit');
    };

    public correct = function(subjectCopy:ISubjectCopy):Promise<ISubjectCopy> {
        return this.write(subjectCopy, '/correct');
    };

    private recreateGrainCopies = function(subjectScheduledId:string, subjectCopyId:string):Promise<any> {
        var deferred = this._$q.defer(), request = {
            method: 'POST',
            url: `exercizer/subject-scheduled/${subjectScheduledId}/subject-copy/${subjectCopyId}/recreate-grains`,
            data: {}
        };
        
        this._$http(request).then(function(response){
                deferred.resolve();
            },
            function() {
                deferred.reject("exercizer.error");
            }
        );
        return deferred.promise;
    }

    public retry = function(subjectCopy:ISubjectCopy, grainCopyList:IGrainCopy[]):Promise<ISubjectCopy> {
        let promises = [];
        var deferred = this._$q.defer();
        promises.push(this.update(subjectCopy));
        promises.push(this.setCurrentGrain(subjectCopy.id, -1));
        promises.push(this.recreateGrainCopies(subjectCopy.subject_scheduled_id, subjectCopy.id));
        this._$q.all(promises).then(success => {
            deferred.resolve(subjectCopy);
        }, err => {
            deferred.reject('exercizer.error');
        });
        return deferred.promise;
    };

    public addToCache = function(subjectCopyRaw: any): void {
        var subjectCopy = SerializationHelper.toInstance(new SubjectCopy(), JSON.stringify(subjectCopyRaw));

        if (angular.isUndefined(this._listMappedById)) {
            this._listMappedById = {};
        }

        if (angular.isUndefined(this._listBySubjectScheduled)) {
            this._listBySubjectScheduled = {};
        }

        if (angular.isUndefined(this._listBySubjectScheduled[subjectCopy.subject_scheduled_id])) {
            this._listBySubjectScheduled[subjectCopy.subject_scheduled_id] = [];
        }

        this.replaceInList(subjectCopy, this._listMappedById, this._listBySubjectScheduled);
    };

    private replaceInList(subjectCopy : ISubjectCopy, listMappedById, listBySubjectScheduled) {
        listMappedById[subjectCopy.id] = subjectCopy;
        angular.forEach(listBySubjectScheduled[subjectCopy.subject_scheduled_id], function(copy, key){
            if(copy.id == subjectCopy.id) {
                listBySubjectScheduled[subjectCopy.subject_scheduled_id].splice(key, 1);
            }
        });
        listBySubjectScheduled[subjectCopy.subject_scheduled_id].push(subjectCopy);
    }

    public createFromSubjectScheduled = function(subjectScheduled:ISubjectScheduled):ISubjectCopy {
        var subjectCopy = new SubjectCopy();
        subjectCopy.subject_scheduled_id = subjectScheduled.id;
        subjectCopy.has_been_started = false;
        return subjectCopy;
    };

    public getList = function():ISubjectCopy[] {
        if (!angular.isUndefined(this._listMappedById)) {
            return MapToListHelper.toList(this._listMappedById);
        } else {
            return [];
        }
    };

    public getListBySubjectScheduled = function(subjectScheduled : ISubjectScheduled):ISubjectCopy[] {
        if(this._listBySubjectScheduled && this._listBySubjectScheduled[subjectScheduled.id]){
            return this._listBySubjectScheduled[subjectScheduled.id]
        } else{
            return [];
        }
    };

    public copyState = function(copy){
        //simple subject : status to "is corrected" if the copy has been submitted
        if (copy.is_training_copy) {
            if (copy.has_been_started) {
                return 'is_on_going';
            } else if (copy.submitted_date) {
                return 'is_done';
            } else {
                return 'is_sided';
            }
        } else {
            if(copy.is_corrected && copy.submitted_date){
                return 'is_corrected';
            } else if(copy.is_correction_on_going){
                return 'is_correction_on_going';
            } else if(copy.submitted_date){
                return 'is_submitted';
            } else if(copy.has_been_started){
                return 'has_been_started'
            } else {
                return null;
            }
        }
    };


    public copyStateColorClass = function(copy){
        switch (this.copyState(copy)){
            case 'is_done':
                return 'color-training-done';
            case 'is_on_going':
                return 'color-training-on-going';
            case 'is_sided':
                return 'color-training-sided';
            case 'is_corrected':
                return "color-corrected";
            case 'is_correction_on_going':
                return "color-is-correction-on-going";
            case 'is_submitted':
                return "color-is-submitted";
            case 'has_been_started':
                return "color-has-been-started";
            default:
                return null;
        }
    };

    public copyStateText = function(copy){
        switch (this.copyState(copy)){
            case 'is_done':
                return idiom.translate("exercizer.copy.state.training.done");
            case 'is_on_going':
                return idiom.translate("exercizer.copy.state.training.ongoing");
            case 'is_sided':
                return idiom.translate("exercizer.copy.state.training.sided");
            case 'is_corrected':
                return idiom.translate("exercizer.copy.state.corrected");
            case 'is_correction_on_going':
                return idiom.translate("exercizer.copy.state.ongoing");
            case 'is_submitted':
                return idiom.translate("exercizer.copy.state.submitted");
            case 'has_been_started':
                return idiom.translate("exercizer.copy.state.started");
            default:
                return "";
        }
    };

    public canCorrectACopyAsTeacher = function(subjectScheduled, copy){
        //  a teacher can start correction if the copy is submitted
        if(subjectScheduled && copy){
            return copy.submitted_date;
        } else {
            return false;
        }
    };

    public canPerformACopyAsStudent = function(subjectScheduled, copy): boolean {
        // a student can not access to a copy if
        // the subject have been submitted AND the subject have option one_shot == true;
        // OR
        // the copy is corrected by the teacher;
        if(!this._dateService.compare_after(new Date(), this._dateService.isoToDate(subjectScheduled.begin_date), true))
            return false
        if (subjectScheduled.is_one_shot_submit && copy.submitted_date) {
            return false;
        } else {
            if(copy.is_correction_on_going || copy.is_corrected){
                return false
            } else{
                return true;
            }
        }
    };

    public canAccessViewAsStudent = function (subjectScheduled, copy): boolean {
        // a student can access to the view of a copy if
        // quelque soit le statut, si la date de rendu est passée et que l'option "Affichage du résultat automatique pour les élèves" a été cochée
        // OR
        // le statut de la copie est "Corrigé" et la date de rendu est passée
        if(!this._dateService.compare_after(new Date(), this._dateService.isoToDate(subjectScheduled.begin_date), true))
            return false
        if(this._dateService.compare_after(new Date(), this._dateService.isoToDate(subjectScheduled.due_date), false) === true){
            if(subjectScheduled.has_automatic_display){
                return true;
            } else{
                if(copy.is_corrected){
                    return true;
                } else{
                    return false;
                }
            }
        } else{
            return false
        }
    };

    public orderBy = function (item, field){
        if(field === 'submitted_date' && item.submitted_date){
            return moment(item.submitted_date);
        } else if (field === 'state') {
            let res = this.copyStateText(item);
            return (res === '' ? undefined : res);
        }

        if(field.indexOf('.') >= 0){
            var splitted_field = field.split('.')
            var sortValue = item
            for(var i = 0; i < splitted_field.length; i++){
                sortValue = (typeof sortValue === 'undefined' || sortValue === null) ? undefined : sortValue[splitted_field[i]]
            }
            return sortValue
        } else
            return (item[field]) ? item[field] : undefined;
    };


    public getById = function(id:number):ISubjectCopy {
        return this._listMappedById && this._listMappedById[id];
    };

    get tmpPreviewData():{subjectScheduled:ISubjectScheduled; subjectCopy:ISubjectCopy; grainScheduledList:IGrainScheduled[]; grainCopyList:IGrainCopy[]} {
        return this._tmpPreviewData;
    }

    set tmpPreviewData(value:{subjectScheduled:ISubjectScheduled; subjectCopy:ISubjectCopy; grainScheduledList:IGrainScheduled[]; grainCopyList:IGrainCopy[]}) {
        this._tmpPreviewData = value;
    }

    get listMappedById():{} {
        return this._listMappedById;
    }
}

export const subjectCopyService = ng.service('SubjectCopyService', SubjectCopyService);