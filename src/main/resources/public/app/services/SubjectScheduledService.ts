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

    public loadSubjectScheduled(){
        var deferred = this._$q.defer();
        var self = this;
        var dataSubjectScheduled = [
            {
                "id": "1",
                "subject_id": "57516f008a8bc277ed1b0168",
                "owner": "Bettie",
                "created": "Mon Jun 09 1997 11:46:54 GMT+0000 (UTC)",
                "title": "California",
                "description": "Consequat et adipisicing nulla reprehenderit.",
                "picture": "https://i.ytimg.com/vi/gMadZ5PraLo/hqdefault.jpg",
                "max_score": 30,
                "begin_date": "1464968639",
                "due_date": "1467649548",
                "estimated_duration": "15",
                "is_over": false,
                "is_one_shot_submit": false,
                "is_deleted": false
            },
            {
                "id": "2",
                "subject_id": "57516f00f234eb90a7a72a6d",
                "owner": "Sanchez",
                "created": "Sat Jan 12 2008 05:55:12 GMT+0000 (UTC)",
                "title": "Louisiana",
                "description": "Voluptate laborum commodo sint ex labore do ut aute exercitation proident officia.",
                "picture": "https://i.ytimg.com/vi/gMadZ5PraLo/hqdefault.jpg",
                "max_score": 25,
                "begin_date": "1464968639",
                "due_date": "1451924748",
                "estimated_duration": "30",
                "is_over": false,
                "is_one_shot_submit": false,
                "is_deleted": false
            },
            {
                "id": "3",
                "subject_id": "57516f00b0fba133ba70e20a",
                "owner": "Burke",
                "created": "Wed Jan 07 2009 09:51:53 GMT+0000 (UTC)",
                "title": "Montana",
                "description": "Dolore id sunt sit elit tempor cillum nisi cillum nulla officia aliquip do ut.",
                "picture": "https://i.ytimg.com/vi/gMadZ5PraLo/hqdefault.jpg",
                "max_score": 10,
                "begin_date": "1464968639",
                "due_date": "1465057548",
                "estimated_duration": "60",
                "is_over": false,
                "is_one_shot_submit": false,
                "is_deleted": false
            }
        ];
        setTimeout(function(){
            angular.forEach(dataSubjectScheduled, function(subjectScheduled){
                self._listMappedById[subjectScheduled.id] = subjectScheduled;
            });
            deferred.resolve(self._listMappedById);

        }, 2000);
        return deferred.promise;
    }
}
