import { ng } from 'entcore';
import { angular } from 'entcore';
import { moment } from 'entcore';
import { _ } from 'entcore';
import { SubjectCopy, SubjectScheduled } from '../models/domain';
import { DateService } from '../services';

class SubjectCopyListController {

    static $inject = [
        'SubjectScheduledService',
        'DateService',
        'SubjectCopyService',
        '$location'
    ];
    private _subjectScheduledService;
    private _subjectCopyService;
    private _dateService;
    private $location;

    constructor(SubjectScheduledService, DateService, SubjectCopyService, $location) {
        this._subjectScheduledService = SubjectScheduledService;
        this._subjectCopyService = SubjectCopyService;
        this._dateService = DateService;
        this.$location = $location;
    }

    public openCorrection(subjectCopy:SubjectCopy) {
        const self:SubjectCopyListController = this;
        const subjectScheduled:SubjectScheduled = self.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
        if(!subjectScheduled){
            return;
        }
        const canShowGeneralCorrected = () => {
            //if corrected date has passed and subject scheduled corrected exist
            return  (subjectScheduled.type !== 'simple') ? false : canShowCorrected() && (subjectScheduled).corrected_file_id !== null;
        };
        const canShowIndividualCorrected = () => {
            //if corrected date has passed and subject copy corrected exist
            return  (subjectScheduled.type !== 'simple') ? false : canShowCorrected() && (subjectCopy).corrected_file_id !== null;
        };

        const canShowCorrected = () => {
            //if corrected date has passed
            return  new DateService().compare_after(new Date(), new DateService().isoToDate(subjectScheduled.corrected_date), true);
        };
        if(canShowIndividualCorrected() || canShowGeneralCorrected()) {
            this.$location.path('/subject/copy/perform/simple/' + subjectCopy.id);
        }
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
                return (!begin || self._dateService.compare_after(dueDate, begin, true)) &&
                    (!end || self._dateService.compare_after(end, dueDate, true));
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