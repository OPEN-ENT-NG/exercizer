interface ISubjectEditService {
    reset():void;
    selectGrain(grain:IGrain):boolean;
    deselectGrainListBySubjectId(id:number):void;
    isGrainSelected(grain:IGrain):boolean;
    foldGrain(grain:IGrain):boolean;
    foldGrainListBySubjectId(id:number):void;
    isGrainFolded(grain:IGrain):boolean;
    getGrainSelectedListBySubjectId(id:number):IGrain[];
    getGrainFoldedListBySubjectId(id:number):IGrain[];
}

class SubjectEditService implements ISubjectEditService {

    static $inject = [
        'SubjectService',
        'GrainService'
    ];

    private _selectedListMappedBySubjectId: { [id: number]: IGrain[]; };
    private _foldedListMappedBySubjectId: { [id: number]: IGrain[]; };

    constructor
    (
        private _subjectService: ISubjectService,
        private _grainService: IGrainService
    ) {
        this._subjectService = _subjectService;
        this._grainService = _grainService;

        this._selectedListMappedBySubjectId = {};
        this._foldedListMappedBySubjectId = {};
    }
    
    public reset = function():void {
        this._selectedListMappedBySubjectId = {};
        this._foldedListMappedBySubjectId = {};
    };

    public selectGrain = function(grain:IGrain):boolean {
        if (angular.isUndefined(this._selectedListMappedBySubjectId[grain.subject_id])) {
            this._selectedListMappedBySubjectId[grain.subject_id] = [];
        }

        var grainIndex = this._selectedListMappedBySubjectId[grain.subject_id].indexOf(grain);

        if (grainIndex !== -1) {
            this._selectedListMappedBySubjectId[grain.subject_id].splice(grainIndex, 1);
        } else {
            this._selectedListMappedBySubjectId[grain.subject_id].push(grain);
        }
        
        this._selectedListMappedBySubjectId[grain.subject_id].sort(function(grainA:IGrain, grainB:IGrain) {
            return grainA.order_by > grainB.order_by;
        });

        return grainIndex !== -1;
    };

    public deselectGrainListBySubjectId = function(id:number):void {
        this._selectedListMappedBySubjectId[id] = [];
    };
    
    public isGrainSelected = function(grain:IGrain):boolean {
        if (angular.isUndefined(this._selectedListMappedBySubjectId[grain.subject_id])) {
            this._selectedListMappedBySubjectId[grain.subject_id] = [];
        }
        
        return this._selectedListMappedBySubjectId[grain.subject_id].indexOf(grain) !== -1;
    };

    public foldGrain = function(grain:IGrain):boolean {
        if (angular.isUndefined(this._foldedListMappedBySubjectId[grain.subject_id])) {
            this._foldedListMappedBySubjectId[grain.subject_id] = [];
        }

        var grainIndex = this._foldedListMappedBySubjectId[grain.subject_id].indexOf(grain);

        if (grainIndex !== -1) {
            this._foldedListMappedBySubjectId[grain.subject_id].splice(grainIndex, 1);
        } else {
            this._foldedListMappedBySubjectId[grain.subject_id].push(grain);
        }

        return grainIndex !== -1;
    };

    public foldGrainListBySubjectId = function(id:number):void {
        if (angular.isUndefined(this._foldedListMappedBySubjectId[id])) {
            this._foldedListMappedBySubjectId[id] = [];
        }
        
        var self = this;
        this._grainService.getListBySubject(this._subjectService.getById(id)).then(
            function(grainList:IGrain[]) {
                angular.forEach(grainList, function(grain:IGrain)  {
                    if (!self.isGrainFolded(grain)) {
                        self._foldedListMappedBySubjectId[grain.subject_id].push(grain);
                    }
                });
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public isGrainFolded = function(grain:IGrain):boolean {
        if (angular.isUndefined(this._foldedListMappedBySubjectId[grain.subject_id])) {
            this._foldedListMappedBySubjectId[grain.subject_id] = [];
        }

        return this._foldedListMappedBySubjectId[grain.subject_id].indexOf(grain) !== -1;
    };

    public getGrainSelectedListBySubjectId = function(id:number):IGrain[] {
        if (angular.isUndefined(this._selectedListMappedBySubjectId[id])) {
            this._selectedListMappedBySubjectId[id] = [];
        }
        
        return this._selectedListMappedBySubjectId[id];
    };
    
    public getGrainFoldedListBySubjectId = function(id:number):IGrain[] {
        if (angular.isUndefined(this._foldedListMappedBySubjectId[id])) {
            this._foldedListMappedBySubjectId[id] = [];
        }
        
        return this._foldedListMappedBySubjectId[id];
    };
}