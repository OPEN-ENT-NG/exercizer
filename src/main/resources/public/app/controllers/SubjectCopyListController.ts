class SubjectCopyListController {

    static $inject = [
        'SubjectScheduledService',
        'DateService'
    ];
    private _subjectScheduledService;
    private _dateService;

    constructor(SubjectScheduledService, DateService) {
        this._subjectScheduledService = SubjectScheduledService;
        this._dateService = DateService;

    }

    public getSubjectScheduledById(id : number){
        if (!angular.isUndefined(this._subjectScheduledService.listMappedById)) {
            return this._subjectScheduledService.listMappedById[id];
        }
    };

    public filterOnSubjectScheduledTitle(text) {
        var self = this;
        return function (subjectCopy) {
            var subjectScheduled = self.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
            if (subjectScheduled) {
                if (text) {
                    if (subjectScheduled.title.toLowerCase().search(text.toLowerCase()) === -1) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }

        };
    };

    public filterOnSubjectScheduledDueDate(begin, end) {
        var self = this;
        return function (subjectCopy) {
            var subjectScheduled = self.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
            if (subjectScheduled) {
                var dueDate = self._dateService.isoToDate(subjectScheduled.due_date);
                if (!begin || !end) {
                    throw "begin or end date in params missing"
                }
                return self._dateService.compare_after(dueDate, begin) && self._dateService.compare_after(end, dueDate);
            } else {
                return false;
            }
        }
    };

    public orderBySubjectScheduledDueDate(subjectCopy) {
        var self = this;
        return function (){
            var subjectScheduled = self.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
            if (subjectScheduled) {
                return subjectScheduled.due_date;
            } else {
                return null;
            }
        }
    };

    public filterOnSubjectScheduledState (filter){
    return function(subjectCopy){
        var res = null;
        switch(filter) {
            case 'corrected':
                res =  subjectCopy.is_corrected;
                break;
            case 'givenBack':
                res =  subjectCopy.submitted_date;
                break;
            case 'pending':
                res =  subjectCopy.is_correction_on_going;
                break;
            default:
                res =  true;
        }
        return res;
    }
};
}
