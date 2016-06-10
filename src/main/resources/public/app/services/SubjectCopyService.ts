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
        // feed
    }


    get listMappedById():{} {
        return this._listMappedById;
    }

    public persist = function(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject-copy/'+ subjectCopy.subject_scheduled_id,
                data: subjectCopy
            };
        this._$http(request).then(
            function(response) {
                var subjectCopy = SerializationHelper.toInstance(new SubjectCopy(), JSON.stringify(response.data)) as any;
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
        if (!angular.isUndefined(this._listMappedById)) {
            return MapToListHelper.toList(this._listMappedById);
        } else {
            return [];
        }
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

    public loadSubjectCopy(){
        var deferred = this._$q.defer();
        var self = this;
        var dataSubjectCopy = [
            {
                "id": "57516cf3747c0beeb0e4935f",
                "subject_scheduled_id": "1",
                "owner": "Margery",
                "created": "1464968639",
                "modified": "1464968639",
                "final_score": null,
                "calculated_score": null,
                "comment": null,
                "has_been_started": false,
                "submitted_date": "1464968639",
                "is_correction_on_going": false,
                "is_corrected": false,
                "is_deleted": false
            },
            {
                "id": "57516cf30e4c380f559f236e",
                "subject_scheduled_id": "2",
                "owner": "Buckner",
                "created": "1464968639",
                "modified": "1464968639",
                "final_score": null,
                "calculated_score": null,
                "comment": null,
                "has_been_started": false,
                "submitted_date": "1464968639",
                "is_correction_on_going": false,
                "is_corrected": false,
                "is_deleted": false
            },
            {
                "id": "57516cf319b958f7292ff510",
                "subject_scheduled_id": "3",
                "owner": "Kidd",
                "created": "1464968639",
                "modified": "1464968639",
                "final_score": null,
                "calculated_score": null,
                "comment": null,
                "has_been_started": true,
                "submitted_date": "1464968639",
                "is_correction_on_going": false,
                "is_corrected": false,
                "is_deleted": false
            }
        ];
        setTimeout(function(){
            angular.forEach(dataSubjectCopy, function(subjectCopy){
                self._listMappedById[subjectCopy.id] = subjectCopy;
            });
            deferred.resolve(dataSubjectCopy);

        }, 1000);

        return deferred.promise;
    }
}
