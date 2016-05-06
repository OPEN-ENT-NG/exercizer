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



    constructor(GrainService) {
        this.grainService = GrainService;
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


    public createObjectGrainScheduledFromGrain(grain:IGrain):IGrainScheduled {
        var grain_scheduled = this.createObjectGrainScheduled();
        grain_scheduled.grain_data = grain.grain_data;
        grain_scheduled.grain_type_id = grain.grain_type_id;
        grain_scheduled.parent_grain_id = grain.id;
        return grain_scheduled;
    }

}