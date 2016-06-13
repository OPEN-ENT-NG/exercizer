interface IGrainCopyService {
    persist(grainCopy:IGrainCopy, subjectScheduled):ng.IPromise<IGrainCopy>;
    update(grainCopy:IGrainCopy):ng.IPromise<IGrainCopy>;
    getListBySubjectCopy(subjectCopy:ISubjectCopy):ng.IPromise<IGrainCopy[]>;
    instantiateGrainCopy(grainCopyObject:any): IGrainCopy;
    createGrainCopyList(grainScheduledList:IGrainScheduled[]):IGrainCopy[];
}

class GrainCopyService implements IGrainCopyService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedBySubjectCopyId:{[subjectCopyId:number]:IGrainCopy[]};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._listMappedBySubjectCopyId = {};
    }

    public persist = function(grainCopy:IGrainCopy, subjectScheduled):ng.IPromise<IGrainCopy> {
        var self = this,
            deferred = this._$q.defer();

        var request = {
            method: 'POST',
            url: 'exercizer/grain-copy/' + subjectScheduled.id,
            data: grainCopy
        };

        this._$http(request).then(
            function (grainCopy) {
                if (angular.isUndefined( self._listMappedBySubjectCopyId[grainCopy.subject_copy_id])) {
                    self._listMappedBySubjectCopyId[grainCopy.subject_copy_id] = [];
                }
                self._listMappedBySubjectCopyId[grainCopy.subject_copy_id].push(grainCopy);

                deferred.resolve(grainCopy);
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la création d\'un élément d\'une copie.')
            }
        );
        return deferred.promise;
    };

    public update = function(grainCopy:IGrainCopy):ng.IPromise<IGrainCopy> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, grainCopy) {
            if (angular.isUndefined(self._listMappedBySubjectCopyId[grainCopy.subject_copy_id])) {
                self._listMappedBySubjectCopyId[grainCopy.subject_copy_id] = [];
            }

            var index = self._listMappedBySubjectCopyId[grainCopy.subject_copy_id].indexOf(grainCopy);
            self._listMappedBySubjectCopyId[grainCopy.subject_copy_id][index] = grainCopy;

            deferred.resolve(grainCopy);
        }, 100, self, grainCopy);

        return deferred.promise;
    };

    public getListBySubjectCopy = function(subjectCopy:ISubjectCopy):ng.IPromise<IGrainCopy[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/grains-copy',
                data: subjectCopy
            };

        if (!angular.isUndefined(this._listMappedBySubjectCopyId[subjectCopy.id])) {
            deferred.resolve(this._listMappedBySubjectCopyId[subjectCopy.id]);
        } else {
            this._listMappedBySubjectCopyId[subjectCopy.id] = [];
            this._$http(request).then(
                function (response) {
                    angular.forEach(response.data, function (grainCopyObject) {
                        self._listMappedBySubjectCopyId[subjectCopy.id].push(self.instantiateGrainCopy(grainCopyObject));
                    });
                    deferred.resolve(self._listMappedBySubjectCopyId[subjectCopy.id]);
                },
                function () {
                    deferred.reject('Une erreur est survenue lors de la récupération des éléments de la copie.');
                }
            );
        }
        
        return deferred.promise;
    };
    
    public instantiateGrainCopy = function (grainCopyObject:any):IGrainCopy {
        var grainCopy = SerializationHelper.toInstance(new GrainCopy(), JSON.stringify(grainCopyObject));
        grainCopy.grain_copy_data = SerializationHelper.toInstance(new GrainCopyData(), grainCopyObject.grain_copy_data);
        return grainCopy;
    };

    public createGrainCopyList = function(grainScheduledList:IGrainScheduled[]):IGrainCopy[] {
        var grainCopyList = [];

        angular.forEach(grainScheduledList, function(grainScheduled:IGrainScheduled) {
            grainCopyList.push(this._createFromGrainScheduled(grainScheduled));
        }, this);

        return grainCopyList;
    };

    private _createFromGrainScheduled = function(grainScheduled:IGrainScheduled):IGrainCopy {
        var grainCopy = new GrainCopy();

        grainCopy.grain_type_id = grainScheduled.grain_type_id;
        grainCopy.grain_scheduled_id = grainScheduled.id;
        grainCopy.order_by = grainScheduled.order_by;
        grainCopy.grain_copy_data = new GrainCopyData();
        grainCopy.grain_copy_data.title = grainScheduled.grain_data.title;
        grainCopy.grain_copy_data.max_score = grainScheduled.grain_data.max_score;
        grainCopy.grain_copy_data.statement = grainScheduled.grain_data.statement;
        grainCopy.grain_copy_data.document_list = grainScheduled.grain_data.document_list;
        grainCopy.grain_copy_data.answer_hint = grainScheduled.grain_data.answer_hint;
        grainCopy.grain_copy_data.document_list = grainScheduled.grain_data.document_list;
        
        if (grainCopy.grain_type_id === 3) { // special case for statement
            grainCopy.grain_copy_data.custom_copy_data = new StatementCustomCopyData();
            grainCopy.grain_copy_data.custom_copy_data.statement = grainScheduled.grain_data.custom_data.statement;
        }

        return grainCopy;
    };
}
