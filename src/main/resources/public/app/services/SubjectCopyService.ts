interface ISubjectCopyService {
    persist(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    update(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    remove(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy>;
    createFromSubjectScheduled(subjectScheduled:ISubjectScheduled):ISubjectCopy;
    getList():ISubjectCopy[];
    getById(id:number):ng.IPromise<ISubjectCopy>;
    loadSubjectCopy();
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

    public remove = function(subjectCopy:ISubjectCopy):ng.IPromise<ISubjectCopy> {
        throw "remove subject copy not implemented";
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
        if(this._listMappedById[id]){
            deferred.resolve(this._listMappedById[id]);
        } else{
            this.loadSubjectCopy().then(
                function(){
                    return self._listMappedById[id];
                }
            );
        }
        return deferred.promise;
    };

    get tmpPreviewData():{subjectScheduled:ISubjectScheduled; subjectCopy:ISubjectCopy; grainScheduledList:IGrainScheduled[]; grainCopyList:IGrainCopy[]} {
        return this._tmpPreviewData;
    }

    set tmpPreviewData(value:{subjectScheduled:ISubjectScheduled; subjectCopy:ISubjectCopy; grainScheduledList:IGrainScheduled[]; grainCopyList:IGrainCopy[]}) {
        this._tmpPreviewData = value;
    }

    public loadSubjectCopy(){
        console.log('loadSubjectCopy');
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'subjects-copy'
            };
        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    console.log('response', response);
                    angular.forEach(response, function(subjectCopy){
                        self._listMappedById[subjectCopy.id] = subjectCopy;
                    });
                    deferred.resolve(response);
                },
                function(err) {
                    console.error(err);
                    deferred.reject('Une erreur est survenue lors de la récupération de vos sujets.');
                }
            );
        }
        return deferred.promise;
    }
}
