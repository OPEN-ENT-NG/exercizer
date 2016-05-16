/**
 * Created by jun on 22/04/2016.
 */
interface IGrainScheduledService {
    createObjectGrainScheduledFromGrain(grain:IGrain) : IGrainScheduled
}

class GrainScheduledService implements IGrainScheduledService {

    static $inject = [
        'GrainService'
    ];

    private grainService;

    private _grainScheduledList;
    private _isSetGrainScheduledList;

    constructor(GrainService) {
        this.grainService = GrainService;
        this._grainScheduledList = {};
        this._isSetGrainScheduledList = []
    }

    public grainScheduledListBySubjectScheduledId(subject_scheduled_id):IGrainScheduled[] {
        return this._isSetGrainScheduledList[subject_scheduled_id] ? this._grainScheduledList[subject_scheduled_id] : [];
    }

    public createGrainScheduledList(grain_scheduled_id){
        if(!this._grainScheduledList[grain_scheduled_id]){
            this._grainScheduledList[grain_scheduled_id] = {};
        }
    }

    public createObjectGrainScheduled():IGrainScheduled {
        var grain_scheduled:IGrainScheduled = {
            id: null,
            subject_scheduled_id : null,
            grain_type_id : null,
            parent_grain_id : null,
            order : null,
            created : null,
            grain_data : this.grainService.createObjectGrain(),
            is_deleted : null
        };
        return grain_scheduled
    }

    public addGrainScheduledToGrainScheduledList(grain_scheduled:IGrainScheduled) {
        this._isSetGrainScheduledList[grain_scheduled.subject_scheduled_id] = true;
        if(!this._grainScheduledList[grain_scheduled.subject_scheduled_id]){
            throw "Grain List missing";
        }
        this._grainScheduledList[grain_scheduled.subject_scheduled_id][grain_scheduled.id] = grain_scheduled;
    }

    public createObjectGrainScheduledFromGrain(grain:IGrain):IGrainScheduled {
        var grain_scheduled = this.createObjectGrainScheduled();
        grain_scheduled.id = Math.floor((Math.random() * 1000) + 1);
        grain_scheduled.grain_data = grain.grain_data;
        grain_scheduled.order = grain.order;
        grain_scheduled.grain_type_id = grain.grain_type_id;
        grain_scheduled.parent_grain_id = grain.id;
        return grain_scheduled;
    }

}