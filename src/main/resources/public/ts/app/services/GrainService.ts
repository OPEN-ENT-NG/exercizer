import { IGrain, ISubject, Grain, GrainData } from '../models/domain';
import { SerializationHelper, CloneObjectHelper } from '../models/helpers';
import { IGrainService } from './GrainService';
import { IGrainTypeService } from './GrainTypeService';
import { ng, idiom } from 'entcore';
import { _ } from 'entcore';

export interface IGrainService {
    persist(grain:IGrain): Promise<IGrain>;
    update(grain:IGrain): Promise<IGrain>;
    removeList(grain:IGrain[], subject:ISubject): Promise<boolean>;
    duplicate(grain:IGrain, subject:ISubject): Promise<IGrain>;
    getListBySubject(subject:ISubject): Promise<IGrain[]>;
    instantiateGrain(grainObject:any): IGrain;
    duplicateIntoSubject(grainList:IGrain[], subjectId:number):Promise<boolean>;
}

export class GrainService implements IGrainService {

    static $inject = [
        '$q',
        '$http',
        'GrainTypeService'
    ];

    private _listMappedBySubjectId:{ [subjectId: number]: IGrain[] };

    constructor
    (
        private _$q,
        private _$http,
        private _grainTypeService:IGrainTypeService
    ) {
        this._$q = _$q;
        this._$http = _$http;
        this._grainTypeService = _grainTypeService;
        this._listMappedBySubjectId = {};
    }

    public persist = function (grain:IGrain):Promise<IGrain> {
        var self = this,
            deferred = this._$q.defer();

        if (angular.isUndefined(grain.order_by)) {
            grain = this._setOrderToGrain(grain);
        }
        var ix = this._listMappedBySubjectId[grain.subject_id].push(grain);

        var body = {"grainTypeId": grain.grain_type_id, "orderBy": grain.order_by,"grainData": grain.grain_data};

        var request = {
            method: 'POST',
            url: 'exercizer/subject/' + grain.subject_id + '/grain',
            data: body
        };

        this._$http(request).then(
            function (response) {
                //var grain = self.instantiateGrain(response.data);
                grain.id = response.data.id;

                if (angular.isUndefined(self._listMappedBySubjectId[grain.subject_id])) {
                    self._listMappedBySubjectId[grain.subject_id] = [];
                }

                deferred.resolve(grain);
            },
            function () {
                self._listMappedBySubjectId[grain.subject_id].splice(ix, 1)
                deferred.reject('exercizer.error')
            }
        );

        return deferred.promise;
    };

    public update = function (grain:IGrain):Promise<IGrain> {
        var self = this,
            deferred = this._$q.defer();

        var body = {"grainTypeId": grain.grain_type_id, "orderBy": grain.order_by,"grainData": grain.grain_data};

        var request = {
            method: 'PUT',
            url: 'exercizer/subject/' + grain.subject_id + '/grain/' + grain.id,
            data: body
        };

        this._$http(request).then(
            function (response) {
                //ODE var grain = self.instantiateGrain(response.data);
                deferred.resolve(grain);
            },
            function () {
                deferred.reject('exercizer.error')
            }
        );

        return deferred.promise;
    };

    public removeList = function(grainList:IGrain[], subject:ISubject):Promise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        var url = 'exercizer/subject/' + subject.id + '/grains?';

        _.forEach(grainList, function (grain) {
            url += 'idGrain=' + grain.id + '&';
        });

        url = url.slice(0, -1);

        var request = {
            method: 'DELETE',
            url: url
        };

        this._$http(request).then(
            function () {
                _.forEach(grainList, function (grain) {
                    var grainIndex = self._listMappedBySubjectId[grain.subject_id].indexOf(grain);

                    if (grainIndex !== -1) {
                        self._listMappedBySubjectId[grain.subject_id].splice(grainIndex, 1);
                    }
                });
                deferred.resolve(true);
            },
            function () {
                deferred.reject('exercizer.error')
            }
        );
        return deferred.promise;
    };


    public duplicate = function (grain:IGrain, subject:ISubject, rename: boolean = true):Promise<IGrain> {

        var duplicatedGrain = CloneObjectHelper.clone(grain, true);

        if (angular.isUndefined(grain.grain_data)) {
            duplicatedGrain.grain_data = CloneObjectHelper.clone(grain.grain_data, true);
        }

        duplicatedGrain.id = undefined;
        duplicatedGrain.subject_id = subject.id;

        if (rename) { // duplicate action in edit subject page

            if (duplicatedGrain.grain_type_id > 3) {
                if (angular.isUndefined(duplicatedGrain.grain_data.title)) {
                    duplicatedGrain.grain_data.title = idiom.translate(this._grainTypeService.getById(duplicatedGrain.grain_type_id).public_name) + idiom.translate('exercizer.grain.title.copySuffix');
                } else {
                    duplicatedGrain.grain_data.title += idiom.translate('exercizer.grain.title.copySuffix');
                }
            }

            duplicatedGrain.order_by = undefined;
            this._setOrderToGrain(duplicatedGrain);
        }

        return this.persist(duplicatedGrain);
    };

    public duplicateIntoSubject = function(grainList:IGrain[], subjectId:number):Promise<boolean>{
        var self = this,
            deferred = this._$q.defer();

        if(grainList.length > 0){
            var grainIds = [];
           _.forEach(grainList, function(grain){
               grainIds.push(grain.id);
           });

            var body = {"grainIds": grainIds};

            var request = {
                method: 'POST',
                url: 'exercizer/subject/' + subjectId + '/duplicate/grains',
                data: body
            };

            this._$http(request).then(
                function (response) {
                    delete self._listMappedBySubjectId[subjectId];
                    deferred.resolve();
                },
                function (e) {
                    deferred.reject(e.data.error);
                }
            );
        } else{
            deferred.resolve();
        }
        return deferred.promise;
    };

    public getListBySubject = function(subject:ISubject):Promise<IGrain[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: !subject.is_library_subject ? 'exercizer/grains/' + subject.id : 'exercizer/subject-library-grains',
                data: subject
            };

        if (!angular.isUndefined(this._listMappedBySubjectId[subject.id])) {
            deferred.resolve(this._listMappedBySubjectId[subject.id]);
        } else {
            this._listMappedBySubjectId[subject.id] = [];

            this._$http(request).then(
                function (response) {
                    angular.forEach(response.data, function (grainObject) {
                        self._listMappedBySubjectId[subject.id].push(self.instantiateGrain(grainObject));
                    });

                    deferred.resolve(self._listMappedBySubjectId[subject.id]);
                },
                function () {
                    deferred.reject('exercizer.error');
                }
            );
        }
        return deferred.promise;
    };

    public instantiateGrain = function (grainObject:any):IGrain {
        var grain = SerializationHelper.toInstance(new Grain(), JSON.stringify(grainObject));
        grain.grain_data = SerializationHelper.toInstance(new GrainData(), grainObject.grain_data);
        return grain;
    };

    private _setOrderToGrain(grain:IGrain):IGrain {
        var maxOrder:number = null,
            newOrder:number;

        angular.forEach(this._listMappedBySubjectId[grain.subject_id], function (currentGrain) {
            if (!angular.isUndefined(currentGrain.order_by) && currentGrain.order_by > maxOrder) {
                maxOrder = currentGrain.order_by;
            }
        });

        if (!angular.isUndefined(maxOrder)) {
            newOrder = Math.ceil(maxOrder) + 1;
        } else {
            newOrder = 1;
        }

        grain.order_by = newOrder;

        return grain;
    }
}

export const grainService = ng.service('GrainService', GrainService);