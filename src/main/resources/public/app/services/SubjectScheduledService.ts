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
    }


    get listMappedById():{} {
        return this._listMappedById;
    }

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
                self._listMappedById[subjectScheduled.id] = subjectScheduled;
                deferred.resolve(subjectScheduled);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la sauvegarde du sujet programmé.');
            }
        );
        return deferred.promise;
    };


    public update = function(subjectScheduled:ISubjectScheduled):ng.IPromise<ISubjectScheduled> {
        throw "Update subject scheduled not implemented";
    };

    public remove = function(id:number):ng.IPromise<ISubjectScheduled> {
        throw "remove subject scheduled not implemented";
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

    public loadSubjectScheduled_student(){
        console.log('loadSubjectScheduled');
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'subjects-scheduled-by-subjects-copy'
            };
        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    console.log('response', response);
                    angular.forEach(response, function(subjectScheduled){
                        self._listMappedById[subjectScheduled.id] = subjectScheduled;
                    });
                    deferred.resolve(response);
                },
                function(err) {
                    console.error(err);
                    deferred.reject('Une erreur est survenue lors de la récupération de vos sujets programmé.');
                }
            );
        }
        return deferred.promise;
    }
}
