class SubjectCopyListController {

    static $inject = [
        'SubjectScheduledService',
        'DateService',
        'SubjectCopyService',
    ];
    private _subjectScheduledService;
    private _subjectCopyService;
    private _dateService;

    constructor(SubjectScheduledService, DateService, SubjectCopyService) {
        this._subjectScheduledService = SubjectScheduledService;
        this._subjectCopyService = SubjectCopyService;
        this._dateService = DateService;

    }

    public getSubjectScheduledById(id:number) {
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
                return self._dateService.compare_after(dueDate, begin, true) && self._dateService.compare_after(end, dueDate, true);
            } else {
                return false;
            }
        }
    };

    public orderBySubjectScheduledDueDate(subjectCopy) {
        var self = this;
        return function () {
            var subjectScheduled = self.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
            if (subjectScheduled) {
                return subjectScheduled.due_date;
            } else {
                return null;
            }
        }
    };

    public filterOnSubjectCopyState(filter) {
        var self = this;
        return function (subjectCopy) {
            if (filter) {
                return self._subjectCopyService.copyState(subjectCopy) == filter;
            } else {
                return true;
            }
        }
    };

    public filterOnSubjectCopyNotStartedOrStarted() {
        var self = this;
        return function (subjectCopy) {
            return self._subjectCopyService.copyState(subjectCopy) === 'has_been_started' || self._subjectCopyService.copyState(subjectCopy) === null;
        }
    };
    public filterOnSubjectCopySubmittedOrCorrectionOnGoingOrCorrected() {
        var self = this;
        return function (subjectCopy) {
            return self._subjectCopyService.copyState(subjectCopy) === 'is_submitted' || self._subjectCopyService.copyState(subjectCopy) === 'is_correction_on_going' || self._subjectCopyService.copyState(subjectCopy) === 'is_corrected';
        }
    };

}