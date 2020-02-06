import { ng } from 'entcore';
import { angular } from 'entcore';
import { moment } from 'entcore';
import { _ } from 'entcore';
import { SubjectCopy } from '../models/domain';

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

    public scheduledThisWeek(subjectCopies: SubjectCopy[]): SubjectCopy[] {
        return _.filter(subjectCopies, function (subjectCopy) {
            let subjectScheduled = this.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
            if (subjectScheduled) {
                return moment().week() >= moment(subjectScheduled.due_date).week()
                    && (moment().year() >= moment(subjectScheduled.due_date).year() ||
                    (moment().month() == 11 && moment().week() == 1 &&
                    moment().year() == (moment(subjectScheduled.due_date).year() -1) ));
            }
        }.bind(this));
    };

    public orderByDueDate(subjectCopies: SubjectCopy[]): SubjectCopy[] {
        subjectCopies = _.map(subjectCopies, function (copy: SubjectCopy) {
            let subjectScheduled = this.getSubjectScheduledById(copy.subject_scheduled_id);
            if (subjectScheduled) {
                copy.dueDate = subjectScheduled.due_date;
            }
            
            return copy;
        }.bind(this));

        subjectCopies.sort((a, b) => {
            return moment(a.dueDate).unix() - moment(b.dueDate).unix();
        });

        return subjectCopies;
    }

    public filterOnSubjectCopyState(filter) {
        var self = this;
        return function (subjectCopy) {
            if (filter) {
                return angular.isUndefined(filter) || filter === null || filter.length === 0 || filter.indexOf(self._subjectCopyService.copyState(subjectCopy)) !== - 1;
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

    public filterOnSubjectCopyTraining() {
        return subjectCopy => !subjectCopy.is_training_copy;
    }


    public filterOnSubjectCopyTrainingState(filter) {
        var self = this;
        return function (subjectCopy) {
            var res = false;
            if (filter && !angular.isUndefined(filter) && filter !== null && filter.length !== 0) {
                if (filter.includes('is_done')) {
                    res = res || !!subjectCopy.submitted_date && !subjectCopy.has_been_started;
                }
                if (filter.includes('is_on_going')) {
                    res = res || subjectCopy.has_been_started;
                }
                if (filter.includes('is_sided')) {
                    res = res || (!subjectCopy.submitted_date && !subjectCopy.has_been_started);
                }
            } else {
                res = true;
            }
            return res && subjectCopy.is_training_copy;
        }
    }

}

export const subjectCopyListController = ng.controller('SubjectCopyListController', SubjectCopyListController);