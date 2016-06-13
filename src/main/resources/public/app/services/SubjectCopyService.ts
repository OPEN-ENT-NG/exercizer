interface ISubjectCopyService {
    resolve(isTeacher:boolean): ng.IPromise<boolean>;
    persist(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    update(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    createFromSubjectScheduled(subjectScheduled:ISubjectScheduled):ISubjectCopy;
    getList():ISubjectCopy[];
    getById(id:number):ISubjectCopy;
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
    }

    public resolve = function(isTeacher:boolean):ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: isTeacher ? 'exercizer/subjects-copy-by-subjects-scheduled' : 'exercizer/subjects-copy'
            };

        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};
                    var subjectCopy;
                    angular.forEach(response.data, function(subjectCopyObject) {
                        subjectCopy = SerializationHelper.toInstance(new SubjectCopy(), JSON.stringify(subjectCopyObject)) as any;
                        self._listMappedById[subjectCopy.id] = subjectCopy;
                    });
                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des copies.');
                }
            );
        }
        return deferred.promise;
    };

    public persist = function(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject-copy/' + subjectCopy.subject_scheduled_id,
                data: subjectCopy
            };
        this._$http(request).then(
            function(response) {
                var subjectCopy = SerializationHelper.toInstance(new SubjectCopy(), JSON.stringify(response.data)) as any;
                if(angular.isUndefined(self._listMappedById)){
                    self._listMappedById= {};
                }
                self._listMappedById[subjectCopy.id] = subjectCopy;
                deferred.resolve(subjectCopy);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la sauvegarde d une copie.');
            }
        );
        return deferred.promise;
    };

    public update = function(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy> {
        throw "update subject copy not implemented";
    };

    public createFromSubjectScheduled = function(subjectScheduled:ISubjectScheduled):ISubjectCopy {
        var subjectCopy = new SubjectCopy();
        subjectCopy.subject_scheduled_id = subjectScheduled.id;
        subjectCopy.has_been_started = false;
        return subjectCopy;
    };

    public getList = function():ISubjectCopy[] {
        if (!angular.isUndefined(this._listMappedById)) {
            return MapToListHelper.toList(this._listMappedById);
        } else {
            return [];
        }
    };

    public getById = function(id:number):ISubjectCopy {
        return this._listMappedById[id];
    };

    get tmpPreviewData():{subjectScheduled:ISubjectScheduled; subjectCopy:ISubjectCopy; grainScheduledList:IGrainScheduled[]; grainCopyList:IGrainCopy[]} {
        return this._tmpPreviewData;
    }

    set tmpPreviewData(value:{subjectScheduled:ISubjectScheduled; subjectCopy:ISubjectCopy; grainScheduledList:IGrainScheduled[]; grainCopyList:IGrainCopy[]}) {
        this._tmpPreviewData = value;
    }

    get listMappedById():{} {
        return this._listMappedById;
    }
}
