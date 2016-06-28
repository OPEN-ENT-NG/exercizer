interface ISubjectLibraryService {
    search(searchData:any): ng.IPromise<ISubject[]>;
    count(searchData:any): ng.IPromise<Number>;
}

class SubjectLibraryService implements ISubjectLibraryService {

    static $inject = [
        '$q',
        '$http'
    ];

    constructor
    (
        private _$q: ng.IQService,
        private _$http: ng.IHttpService
    ) {
        this._$q = _$q;
        this._$http = _$http;
    }

    public search = function(searchData:any): ng.IPromise<ISubject[]> {
        var deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subjects-for-library',
                data: searchData
            };

        this._$http(request).then(
            function(response) {
                var subjectList = [];
                angular.forEach(response.data, function(subjectObject) {
                    subjectList.push(SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject)));
                });
                deferred.resolve(subjectList);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la récupération des sujets de la bibliothèque.');
            }
        );

        return deferred.promise;
    };

    public count = function(searchData:any): ng.IPromise<Number> {
        var deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/count-subjects-for-library',
                data: searchData
            };

        this._$http(request).then(
            function(response) {
                deferred.resolve(parseInt(response.data));
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la récupération des sujets de la bibliothèque.');
            }
        );

        return deferred.promise;
    };

}
