import { ng, _ } from 'entcore';
import http from 'axios';

export interface IGroupService {
    findMembers(id:string):Promise<any>;
    getList(subject, startSearch, forceReload): Promise<any>;
    getMembersFromBookmark(bookmark) : Promise<any>
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

    public getList = async function(subject, startSearch, forceReload = false): Promise<any> {
        var self = this,
            deferred = this._$q.defer();
        if(this._groupBySubjectId[subject.id] && !forceReload){
            deferred.resolve(this._groupBySubjectId[subject.id]);
        } else {
            var response = await http.get('/directory/sharebookmark/all');
            var bookmarks = _.map(response.data, function(bookmark) {
                bookmark.type = 'sharebookmark';
                return bookmark;
            });
            var url = 'exercizer/subject/share/json/'+subject.id;
            if (startSearch) {
                url += '?search=' + startSearch;
            }
            var request = {
                method: 'GET',
                url: url
            };
            this._$http(request).then(
                function(res) {
                    res.data.bookmarks = bookmarks;
                    self._groupBySubjectId[subject.id] = res.data;
                    deferred.resolve(res.data);
                },
                function() {
                    deferred.reject('exercizer.error');
                }
            );
        }
        return deferred.promise;
    };

    public getMembersFromBookmark = async function(bookmark) : Promise<any> {
        return (await http.get('/directory/sharebookmark/' + bookmark._id)).data;
    };

    public findMembers = function(id:string):Promise<any> {
        var self = this,
            deferred = this._$q.defer();

        var url = 'exercizer/members?' + 'id=' + id;

        var request = {
            method: 'GET',
            url: url
        };

        this._$http(request).then(
            function (response) {
                deferred.resolve(response.data);
            },
            function () {
                deferred.reject('exercizer.error')
            }
        );
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
                    deferred.reject('exercizer.error');
                }
            );
        return deferred.promise;
    }


}

export const groupService = ng.service('GroupService', GroupService);