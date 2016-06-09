interface IGroupService {
    getList(subject): ng.IPromise<any>;
}

class GroupService implements IGroupService {

    static $inject = [
        '$http',
        '$q'

    ];

    private _$http;
    private _$q;

    constructor($http, $q){
        this._$http = $http;
        this._$q = $q;
    }

    public getList = function(subject): ng.IPromise<any> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subject/share/json/'+subject.id
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
    };


}
