import { ng } from 'entcore';

export interface IGroupService {
    getList(subject): Promise<any>;
    getUserFromGroup(group) : Promise<any>;
    getClassFromStructures(structureId : any) : Promise<any>;
}

export class GroupService implements IGroupService {

    static $inject = [
        '$http',
        '$q'

    ];

    private _$http;
    private _$q;
    private _groupBySubjectId;
    private _groupByStructureId;

    constructor($http, $q){
        this._$http = $http;
        this._$q = $q;
        this._groupBySubjectId = {};
        this._groupByStructureId = {};
    }

    public getClassFromStructures(structureIdArray){
        var self = this,
            deferred = this._$q.defer(),
            promises = [],
            res = [];
        angular.forEach(structureIdArray, function(structureId){
            if(this._groupByStructureId[structureId]){
                // TODO verifier si le retour est bien un array
                angular.forEach(this._groupByStructureId[structureId], function(resItem){
                    res.push(resItem);
                })
            } else {
                var request = {
                    method: 'GET',
                    url: '/userbook/structure/'+structureId
                };
                promises.push(this._$http(request).then(
                    function(http_response) {
                        self._groupByStructureId[structureId] = http_response.data;
                        angular.forEach(this._groupByStructureId[structureId], function(resItem){
                            res.push(resItem);
                        })
                    }.bind(this),
                    function(err){
                        console.error(err);
                    }
                ));
            }
        }.bind(this));
        this._$q.all(promises).then(function(value) {
            // successCallback
            deferred.resolve(res);

        }, function(err) {
            console.error(err);
        });
        return deferred.promise;
    }

    public getList = function(subject): Promise<any> {
        var self = this,
            deferred = this._$q.defer();
        if(this._groupBySubjectId[subject.id]){
            deferred.resolve(this._groupBySubjectId[subject.id]);
        } else {
                var request = {
                    method: 'GET',
                    url: 'exercizer/subject/share/json/'+subject.id
                };
            this._$http(request).then(
                function(res) {
                    self._groupBySubjectId[subject.id] = res.data;
                    deferred.resolve(res.data);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récuperation des groupes');
                }
            );
        }
        return deferred.promise;
    };

    public getUserFromGroup(group) : Promise<any>{
        var self = this,
            deferred = this._$q.defer();
            var request = {
                method: 'GET',
                url: '/userbook/visible/users/'+group._id
            };
            this._$http(request).then(
                function(res) {
                    deferred.resolve(res.data);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récuperation des groupes');
                }
            );
        return deferred.promise;
    }


}

export const groupService = ng.service('GroupService', GroupService);