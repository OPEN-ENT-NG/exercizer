interface ISubjectCopyService {
    persist(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    update(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    remove(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    createFromSubjectScheduled(subjectScheduled:ISubjectScheduled):ISubjectCopy;
    getList():ISubjectCopy[];
    getById(id:number):ng.IPromise<ISubjectCopy>;
}

class SubjectCopyService implements ISubjectCopyService {

    static $inject = [
        '$q',
        '$http',
        'GrainScheduledService',
        'GrainCopyService'
    ];

    private _listMappedById:{[id:number]:ISubjectCopy;};
    private _tmpPreviewData:{subjectScheduled:ISubjectScheduled, subjectCopy:ISubjectCopy, grainScheduledList:IGrainScheduled[], grainCopyList:IGrainCopy[]};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService,
        private _grainScheduledService,
        private _grainCopyService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._grainScheduledService = _grainScheduledService;
        this._grainCopyService = _grainCopyService;

        // TODO remove
        this._listMappedById = {};
    }

    public persist = function(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy> {
        var self = this,
            deferred = this._$q.defer();

        //TODO update when using real API
        subjectCopy.id = Math.floor(Math.random() * (999999999 - 1)) + 1; // FIXME backend
        setTimeout(function(self, subjectCopy) {
            self._listMappedById[subjectCopy.id] = subjectCopy;
            deferred.resolve(subjectCopy);
        }, 100, self, subjectCopy);

        return deferred.promise;
    };

    public update = function(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, subjectCopy) {
            self._listMappedById[subjectCopy.id] = subjectCopy;
            deferred.resolve(subjectCopy);
        }, 100, self, subjectCopy);

        return deferred.promise;
    };

    public remove = function(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy> {
        var self = this,
            deferred = this._$q.defer();

        //TODO

        return deferred.promise;
    };

    public createFromSubjectScheduled = function(subjectScheduled:ISubjectScheduled):ISubjectCopy {
        var subjectCopy = new SubjectCopy();
        subjectCopy.subject_scheduled_id = subjectScheduled.id;
        subjectCopy.has_been_started = false;
        return subjectCopy;
    };

    public getList = function():ISubjectCopy[] {
        var self = this;

        return Object.keys(this._listMappedById).map(function(v) {
            return this._listMappedById[v];
        }, self);
    };

    public getById = function(id:number):ng.IPromise<ISubjectCopy> {
        var self = this,
            deferred = this._$q.defer();

        //TODO
        deferred.resolve(this._listMappedById(id));

        return deferred.promise;
    };
    
    get tmpPreviewData():{subjectScheduled:ISubjectScheduled; subjectCopy:ISubjectCopy; grainScheduledList:IGrainScheduled[]; grainCopyList:IGrainCopy[]} {
        return this._tmpPreviewData;
    }

    set tmpPreviewData(value:{subjectScheduled:ISubjectScheduled; subjectCopy:ISubjectCopy; grainScheduledList:IGrainScheduled[]; grainCopyList:IGrainCopy[]}) {
        this._tmpPreviewData = value;
    }
}
