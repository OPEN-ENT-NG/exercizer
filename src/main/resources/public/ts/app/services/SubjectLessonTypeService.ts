import { ng } from 'entcore';
import { MapToListHelper, SerializationHelper } from '../models/helpers';
import { ISubjectLessonType, SubjectLessonType } from '../models/domain';

export interface ISubjectLessonTypeService {
    resolve(): Promise<boolean>;
    getList(): ISubjectLessonType[];
    resolveBySubjectIdList(subjectIds:number[]):Promise<boolean>;
    getBySubjectId(subjectId:number): ISubjectLessonType;
}

export class SubjectLessonTypeService implements ISubjectLessonTypeService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:ISubjectLessonType};
    private _listMappedBySubjectId: {[subjectId:number]:ISubjectLessonType};

    constructor
    (
        private _$q,
        private _$http
    )
    {
        this._$q = _$q;
        this._$http = _$http;
    }

    public resolve = function():Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subject-lesson-types'
            };

        if (!this._listMappedById) {
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

    public resolveBySubjectIdList = function(subjectIds:number[]):Promise<boolean> {
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

export const subjectLessonTypeService = ng.service('SubjectLessonTypeService', SubjectLessonTypeService);