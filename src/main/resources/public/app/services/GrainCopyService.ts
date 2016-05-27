interface IGrainCopyService {
    persist(grainCopy:IGrainCopy):ng.IPromise<IGrainCopy>;
    update(grainCopy:IGrainCopy):ng.IPromise<IGrainCopy>;
    remove(grainCopy:IGrainCopy):ng.IPromise<boolean>;
    createGrainCopyList(grainScheduledList:IGrainScheduled[]):IGrainCopy[];
    getListBySubjectCopyId(subjectCopyId:number):ng.IPromise<IGrainCopy[]>;
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

    public persist = function(grainCopy:IGrainCopy):ng.IPromise<IGrainCopy> {
        var self = this,
            deferred = this._$q.defer();

        //TODO update when using real API
        grainCopy.id = Math.floor(Math.random() * (999999999 - 1)) + 1; // TODO backend

        setTimeout(function(self, grainCopy) {
            if (angular.isUndefined(self._listMappedBySubjectCopyId[grainCopy.subject_copy_id])) {
                self._listMappedBySubjectCopyId[grainCopy.subject_copy_id] = [];
            }

            self._listMappedBySubjectCopyId[grainCopy.subject_copy_id].push(grainCopy);

            deferred.resolve(grainCopy);
        }, 100, self, grainCopy);

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

    public remove = function(grainCopy:IGrainCopy):ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, grainCopy) {
            if (angular.isUndefined(self._listMappedBySubjectCopyId[grainCopy.subject_copy_id])) {
                self._listMappedBySubjectCopyId[grainCopy.subject_copy_id] = [];
            }

            var grainCopyIndex = self._listMappedBySubjectCopyId[grainCopy.subject_copy_id].indexOf(grainCopy);

            if (grainCopyIndex !== -1) {
                self._listMappedBySubjectCopyId[grainCopy.subject_copy_id].splice(grainCopyIndex, 1);
                deferred.resolve(true);
            }

            deferred.resolve(false);
        }, 100, self, grainCopy);

        return deferred.promise;
    };

    public createGrainCopyList = function(grainScheduledList:IGrainScheduled[]):IGrainCopy[] {
        var grainCopyList = [];

        angular.forEach(grainScheduledList, function(grainScheduled:IGrainScheduled) {
            grainCopyList.push(this._createFromGrainScheduled(grainScheduled));
        }, this);

        return grainCopyList;
    };

    public getListBySubjectCopyId = function(subjectCopyId:number):ng.IPromise<IGrainCopy[]> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, subjectCopyId) {
            if (angular.isUndefined(self._listMappedBySubjectCopyId[subjectCopyId])) {
                self._listMappedBySubjectCopyId[subjectCopyId] = [];
            }
            deferred.resolve(self._listMappedBySubjectCopyId[subjectCopyId]);
        }, 100, self, subjectCopyId);


        return deferred.promise;
    };

    private _createFromGrainScheduled = function(grainScheduled:IGrainScheduled):IGrainCopy {
        var grainCopy = new GrainCopy();

        grainCopy.grain_type_id = grainScheduled.grain_type_id;
        grainCopy.grain_scheduled_id = grainScheduled.id;
        grainCopy.order = grainScheduled.order;
        grainCopy.grain_copy_data = new GrainCopyData();
        grainCopy.grain_copy_data.title = grainScheduled.grain_data.title;
        grainCopy.grain_copy_data.max_score = grainScheduled.grain_data.max_score;
        grainCopy.grain_copy_data.statement = grainScheduled.grain_data.statement;
        grainCopy.grain_copy_data.document_list = grainScheduled.grain_data.document_list;
        grainCopy.grain_copy_data.answer_hint = grainScheduled.grain_data.answer_hint;
        grainCopy.grain_copy_data.document_list = grainScheduled.grain_data.document_list;
        grainCopy.grain_copy_data.custom_copy_data = this._createCustomCopyData(grainScheduled.grain_data.custom_data);

        return grainCopy;
    };

    private _createCustomCopyData = function(customData:any):any {
        var customDataCopyData;

        if (customData instanceof StatementCustomData) {
            customDataCopyData = new StatementCustomCopyData(customData.statement);
        } else if (customData instanceof SimpleAnswerCustomData) {
            customDataCopyData = new SimpleAnswerCustomCopyData();
        }

        return customDataCopyData;
    };
}
