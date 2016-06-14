interface ISubjectScheduledService {
    resolve(isTeacher:boolean): ng.IPromise<boolean>;
    persist(subjectScheduled:ISubjectScheduled):ng.IPromise<ISubjectScheduled>;
    createFromSubject(subject:ISubject):ISubjectScheduled;
    getList():ISubjectScheduled[];
    getById(id:number):ISubjectScheduled;
    currentSubjectScheduledId:number;
}

class SubjectScheduledService implements ISubjectScheduledService {

    static $inject = [
        '$q',
        '$http',
        'GrainService',
        'GrainScheduledService'
    ];

    private _listMappedById:{[id:number]:ISubjectScheduled;};
    private _currentSubjectScheduledId:number;

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService,
        private _grainService:IGrainService,
        private _grainScheduledService:IGrainScheduledService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._grainService = _grainService;
        this._grainScheduledService = _grainScheduledService;
    }

    public resolve = function(isTeacher:boolean):ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: isTeacher ? 'exercizer/subjects-scheduled' : 'exercizer/subjects-scheduled-by-subjects-copy'
            };

        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};
                    var subjectScheduled;
                    angular.forEach(response.data, function(subjectScheduledObject) {
                        subjectScheduled = SerializationHelper.toInstance(new SubjectScheduled(), JSON.stringify(subjectScheduledObject)) as any;
                        self._listMappedById[subjectScheduled.id] = subjectScheduled;
                    });
                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des sujets programmés.');
                }
            );
        }
        return deferred.promise;
    };

    public persist = function(subjectScheduled:ISubjectScheduled):ng.IPromise<ISubjectScheduled> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject-scheduled/'+ subjectScheduled.subject_id,
                data: subjectScheduled
            };

        this._$http(request).then(
            function(response) {
                var subjectScheduled = SerializationHelper.toInstance(new SubjectScheduled(), JSON.stringify(response.data)) as any;
                if(angular.isUndefined(self._listMappedById)){
                    self._listMappedById= {};
                }
                self._listMappedById[subjectScheduled.id] = subjectScheduled;
                deferred.resolve(subjectScheduled);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la sauvegarde du sujet programmé.');
            }
        );
        return deferred.promise;
    };

    public createFromSubject = function(subject:ISubject):ISubjectScheduled {
        var subjectScheduled = new SubjectScheduled();

        subjectScheduled.subject_id = subject.id;
        subjectScheduled.title = subject.title;
        subjectScheduled.description = subject.description;
        subjectScheduled.picture = subject.picture;
        subjectScheduled.max_score = subject.max_score;

        return subjectScheduled;
    };

    public getList = function():ISubjectScheduled[] {
        if (!angular.isUndefined(this._listMappedById)) {
            return MapToListHelper.toList(this._listMappedById);
        } else {
            return [];
        }
    };

    public getById = function(id:number):ISubjectScheduled {
        if (!angular.isUndefined(this._listMappedById)) {
            return this._listMappedById[id];
        }
    };

    get currentSubjectScheduledId():number {
        return this._currentSubjectScheduledId;
    }

    set currentSubjectScheduledId(value:number) {
        this._currentSubjectScheduledId = value;
    }

    get listMappedById():{} {
        return this._listMappedById;
    }
}
