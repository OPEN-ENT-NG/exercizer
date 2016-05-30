interface ISubjectScheduledService {
    persist(subjectScheduled:ISubjectScheduled):ng.IPromise<ISubjectScheduled>;
    update(subjectScheduled:ISubjectScheduled):ng.IPromise<ISubjectScheduled>;
    remove(id:number):ng.IPromise<ISubjectScheduled>;
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

        // TODO remove
        this._listMappedById = {};
    }

    public persist = function(subjectScheduled:ISubjectScheduled):ng.IPromise<ISubjectScheduled> {
        var self = this,
            deferred = this._$q.defer();

        //TODO update when using real API
        subjectScheduled.id = Math.floor(Math.random() * (999999999 - 1)) + 1; // FIXME backend
        setTimeout(function(self, subjectScheduled) {
            self._listMappedById[subjectScheduled.id] = subjectScheduled;
            deferred.resolve(subjectScheduled);
        }, 100, self, subjectScheduled);

        return deferred.promise;
    };

    public update = function(subjectScheduled:ISubjectScheduled):ng.IPromise<ISubjectScheduled> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, subjectScheduled) {
            self._listMappedById[subjectScheduled.id] = subjectScheduled;
            deferred.resolve(subjectScheduled);
        }, 100, self, subjectScheduled);

        return deferred.promise;
    };

    public remove = function(id:number):ng.IPromise<ISubjectScheduled> {
        var self = this,
            deferred = this._$q.defer(),
            subjectScheduled = this._listMappedById[id];

        //TODO remove when using real API
        subjectScheduled.is_deleted = true;
        setTimeout(function(self, subjectScheduled) {
            delete self._listMappedById[subjectScheduled.id];
            deferred.resolve(subjectScheduled);
        }, 100, self, subjectScheduled);

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
        var self = this;

        return Object.keys(this._listMappedById).map(function(v) {
            return this._listMappedById[v];
        }, self);
    };

    public getById = function(id:number):ISubjectScheduled {
        var self = this,
            deferred = this._$q.defer();

        //TODO
        deferred.resolve(this._listMappedById(id));

        return deferred.promise;
    };

    get currentSubjectScheduledId():number {
        return this._currentSubjectScheduledId;
    }

    set currentSubjectScheduledId(value:number) {
        this._currentSubjectScheduledId = value;
    }
}
