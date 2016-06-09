interface IGroupService {
    getList(subject): ng.IPromise<any>;
    getUserFromGroup(group) : ng.IPromise<any>
}

class GroupService implements IGroupService {

    static $inject = [
        '$http',
        '$q'

    ];

    private _$http;
    private _$q;
    private _groupBySubjectId;

    constructor($http, $q){
        this._$http = $http;
        this._$q = $q;
        this._groupBySubjectId = {}
    }

    public getList = function(subject): ng.IPromise<any> {
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

    public getUserFromGroup(group) : ng.IPromise<any>{
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
