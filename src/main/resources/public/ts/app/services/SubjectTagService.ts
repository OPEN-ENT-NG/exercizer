import { ng } from 'entcore';
import { SerializationHelper, MapToListHelper } from '../models/helpers';
import { ISubjectTag, SubjectTag } from '../models/domain';

export interface ISubjectTagService {
    resolve(): Promise<ISubjectTag[]>;
    persist(subjectTag:ISubjectTag): Promise<ISubjectTag>;
    resolveBySubjectIds(subjectIds:number[]):Promise<Boolean>;
    getListBySubjectId(subjectId:number): ISubjectTag[];
}

export class SubjectTagService implements ISubjectTagService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:ISubjectTag};
    private _listMappedBySubjectId: {[subjectId:number]:ISubjectTag[]};

    constructor
    (
        private _$q,
        private _$http
    )
    {
        this._$q = _$q;
        this._$http = _$http;
    }

    public resolve = function():Promise<ISubjectTag[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subject-tags'
            };

        // force the reloads of subjects tags (cause of weid issue when persisting a tag -> the local list is not updated, even if the code tell so).
        /*if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(MapToListHelper.toList(this._listMappedById));
        } else {*/
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};

                    response.data.forEach(function (subjectTagObject) {
                        var subjectTag = SerializationHelper.toInstance(new SubjectTag(), JSON.stringify(subjectTagObject));
                        self._listMappedById[subjectTag.id] = subjectTag;
                    });

                    deferred.resolve(MapToListHelper.toList(self._listMappedById));
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des étiquettes des sujets de la bibliothèque.');
                }
            );
        //}
        return deferred.promise;
    };

    public persist = function(subjectTag:ISubjectTag):Promise<ISubjectTag> {
        var self = this,
            deferred = this._$q.defer();

        var subjectTagObject = angular.copy(subjectTag);

        var request = {
            method: 'POST',
            url: 'exercizer/subject-tag',
            data: subjectTagObject
        };

        this._$http(request).then(
            function (response) {
                var subjectTag = SerializationHelper.toInstance(new SubjectTag(), JSON.stringify(response.data));

                if (!self._listMappedById[subjectTag.id]) {
                    self._listMappedById[subjectTag.id] = [];
                }

                self._listMappedById[subjectTag.id].push(subjectTag);

                deferred.resolve(subjectTag);
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la création de l\'étiquette.')
            }
        );

        return deferred.promise;
    };
    
    public resolveBySubjectIds(subjectIds:number[]):Promise<Boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject-tags-by-subject-id',
                data: {
                    ids: subjectIds
                }
            };

        if (angular.isUndefined(this._listMappedBySubjectId)) {
            this._listMappedBySubjectId = {};
        }
        
        var makeCall = false;
        for (var i=0;i<subjectIds.length;i++) {
            if (!this._listMappedBySubjectId[subjectIds[i]]) makeCall = true;
        }

        if (!makeCall) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    for (var i=0;i<subjectIds.length;i++) {
                        self._listMappedBySubjectId[subjectIds[i]] = [];                       
                    }                    

                    response.data.forEach(function (subjectTagObject) {                       
                        var subjectTag = SerializationHelper.toInstance(new SubjectTag(), JSON.stringify(subjectTagObject));
                        self._listMappedBySubjectId[subjectTagObject.subject_id].push(subjectTag);
                    });

                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des étiquettes des sujets de la bibliothèque.');
                }
            );
        }
        return deferred.promise;
    };

    public getListBySubjectId = function(subjectId:number):ISubjectTag[] {
        return this._listMappedBySubjectId[subjectId] ? this._listMappedBySubjectId[subjectId] : [];
    };
}

export const subjectTagService = ng.service('SubjectTagService', SubjectTagService);