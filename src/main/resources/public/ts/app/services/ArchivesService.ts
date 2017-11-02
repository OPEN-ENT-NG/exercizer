import { ng } from 'entcore';
import { ISubjectScheduled, ISubjectCopy, SubjectScheduled, SubjectCopy } from '../models/domain';
import { SerializationHelper, MapToListHelper } from '../models/helpers';


interface IArchivesService {
    resolveArchivedSubjectScheduled(): Promise<boolean>;
    getListArchivedSubjectScheduled(): ISubjectScheduled[];
    getListArchivedSubjectScheduledCopy(id:number, callback:any);
    getSubjectScheduledById(id:number);
    getSubjectScheduledCopyById(id:number);
    getGrainsdByCopyId(id:number);
}

class ArchivesService implements IArchivesService {

    static $inject = [
        '$q',
        '$http',
    ];

    private _listSubjectScheduledMappedById:{[id:number]:ISubjectScheduled;};
    private _listSubjectScheduledCopyMappedById:{[idScheduled:number]:ISubjectCopy[];};
    private _currentCopy :ISubjectCopy;

    constructor
    (
        private _$q,
        private _$http
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._listSubjectScheduledCopyMappedById = {};
    }


    public resolveArchivedSubjectScheduled = function(): Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/archive/subjects-scheduled'
            };


        this._$http(request).then(
            function(response) {
                self._listSubjectScheduledMappedById = {};
                var subjectScheduled;
                angular.forEach(response.data, function(subjectScheduledObject) {
                    subjectScheduled = SerializationHelper.toInstance(new SubjectScheduled(), JSON.stringify(subjectScheduledObject)) as any;
                    subjectScheduled.scheduled_at = JSON.parse(subjectScheduled.scheduled_at);
                    subjectScheduled.corrected_metadata = JSON.parse(subjectScheduled.corrected_metadata);
                    self._listSubjectScheduledMappedById[subjectScheduled.id] = subjectScheduled;
                    self._listSubjectScheduledCopyMappedById[subjectScheduled.id] = [];
                });
                deferred.resolve(true);
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );

        return deferred.promise;
    }

    private resolveArchivedSubjectScheduledCopy = function(): Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            url = 'exercizer/archive/subjects-copy-by-subjects-scheduled?';

        angular.forEach(self._listSubjectScheduledMappedById, function (subject) {
            url += 'id=' + subject.id + '&';
        });
        url = url.slice(0, -1);

        var  request = {
                method: 'GET',
                url: url
        };

        this._$http(request).then(
            function(response) {
                var subjectCopy;
                angular.forEach(response.data, function(subjectCopyObject) {
                    subjectCopy = SerializationHelper.toInstance(new SubjectCopy(), JSON.stringify(subjectCopyObject)) as any;
                    subjectCopy.corrected_metadata = JSON.parse(subjectCopy.corrected_metadata);
                    self._listSubjectScheduledCopyMappedById[subjectCopy.subject_scheduled_id].push(subjectCopy);
                });
                deferred.resolve(true);
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );

        return deferred.promise;
    }


    public getListArchivedSubjectScheduled = function(): ISubjectScheduled[] {
        if (!angular.isUndefined(this._listSubjectScheduledMappedById)) {
            return MapToListHelper.toList(this._listSubjectScheduledMappedById);
        } else {
            return [];
        }
    }

    public setCurrentcopy(copy:ISubjectCopy){
        this._currentCopy = copy;
    }

    public getCurrentcopy(){
        return this._currentCopy;
    }

    public getSubjectScheduledById = function (id:number) {
        return this._listSubjectScheduledMappedById[id];
    }

    public getSubjectScheduledCopyById = function (id:number) {
        return this._listSubjectScheduledCopyMappedById[id];
    }

    public getGrainsdByCopyId = function (id:number) {
        return this._listGrainMappedById[id];
    }


    public getListArchivedSubjectScheduledCopy = function(id:number, callback:any) {
        if(angular.isUndefined(this._listSubjectScheduledCopyMappedById[id])){
            this.resolveArchivedSubjectScheduledCopy().then( () => {
                callback(this._listSubjectScheduledCopyMappedById[id]);
            })

        }else {
            callback(this._listSubjectScheduledCopyMappedById[id]);
        }
    }


}

export const archivesService = ng.service('ArchivesService', ArchivesService);