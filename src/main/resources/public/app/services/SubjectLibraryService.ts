interface ISubjectLibraryService {
    resolve(): ng.IPromise<boolean>;
    getList(): ISubject[];
}

class SubjectLibraryService implements ISubjectLibraryService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _subjectLibraryList:ISubject[];

    constructor
    (
        private _$q: ng.IQService,
        private _$http: ng.IHttpService
    ) {
        this._$q = _$q;
        this._$http = _$http;
    }

    public resolve = function(): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subjects-for-library'
            };

        if (!angular.isUndefined(this._subjectLibraryList)) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    self._subjectLibraryList = [];
                    var subject;
                    angular.forEach(response.data, function(subjectObject) {
                        subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject)) as any;
                        self._subjectLibraryList.push(subject);
                    });
                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des sujets de la bibliothèque.');
                }
            );
        }

        return deferred.promise;
    };

    public getList = function(): ISubject[] {
        return angular.isUndefined(this._subjectLibraryList) ? [] : this._subjectLibraryList;
    };

}
