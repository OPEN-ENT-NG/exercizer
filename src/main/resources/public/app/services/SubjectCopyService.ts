interface ISubjectCopyService {
    persist(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    update(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    remove(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    createFromSubjectScheduled(subjectScheduled:ISubjectScheduled):ng.IPromise<any>;
    getList():ISubjectCopy[];
    getById(id:number):ng.IPromise<ISubjectCopy>;
    currentSubjectCopyId:number;
}

class SubjectService implements ISubjectCopyService {

    static $inject = [
        '$q',
        '$http',
        'GrainScheduledService',
        'GrainCopyService'
    ];

    private _listMappedById:{[id:number]:ISubjectCopy;};
    private _currentSubjectCopyId:number;

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

    public createFromSubjectScheduled = function(subjectScheduled:ISubjectScheduled):ng.IPromise<any> {
        var deferred = this._$q.defer(),
            subjectCopy = new SubjectCopy(),
            grainCopyList = [];

        subjectCopy.subject_scheduled_id = subjectScheduled.id;

        this._grainScheduledService.getListBySubjectScheludedId(subjectScheduled.id).then(
            function(grainScheduledList) {
                grainCopyList = this._grainCopyService.createGrainCopyList(grainScheduledList);

                deferred.resolve({
                    subjectCopy: subjectCopy,
                    grainCopyList: grainCopyList
                });

            }, function(err) {
                notify.error(err);
            });

        return deferred.promise;
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

    get currentSubjectCopyId():number {
        return this._currentSubjectCopyId;
    }

    set currentSubjectCopyId(value:number) {
        this._currentSubjectCopyId = value;
    }
}
