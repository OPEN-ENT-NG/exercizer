import {ng} from "entcore";
import {IGrainScheduled, IGrainCopy, ISubjectCopy, ISubjectScheduled} from "../models/domain/";
import {automaticCorrection} from "../components/grain/common/zonegrain/model";

export interface ICorrectionService {
    automaticCorrection(subjectCopyList:ISubjectCopy[], subjectScheduled:ISubjectScheduled): void;
}

export class CorrectionService implements ICorrectionService {

    static $inject = [
        '$q',
        '$http',
        'GrainScheduledService',
        'GrainCopyService',
        'SubjectCopyService',
        'AssociationService',
        'OrderService',
        'MultipleAnswerService',
        'OpenAnswerService',
        'QcmService',
        'SimpleAnswerService'
    ];

    constructor
    (
        private _$q,
        private _$http,
        private _grainScheduledService,
        private _grainCopyService,
        private _subjectCopyService,
        private _associationService,
        private _orderService,
        private _multipleAnswerService,
        private _openAnswerService,
        private _qcmService,
        private _simpleAnswerService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._grainScheduledService = _grainScheduledService;
        this._grainCopyService = _grainCopyService;
        this._subjectCopyService = _subjectCopyService;
        this._associationService = _associationService;
        this._orderService = _orderService;
        this._multipleAnswerService = _multipleAnswerService;
        this._openAnswerService = _openAnswerService;
        this._qcmService = _qcmService;
        this._simpleAnswerService = _simpleAnswerService
    }

    public automaticCorrection = function (subjectCopyList:ISubjectCopy[], subjectScheduled:ISubjectScheduled) {
        this._grainScheduledService.getListBySubjectScheduled(subjectScheduled).then(
            (grainScheduledList: IGrainScheduled[]) => {
                let notCorrectedAlreadySubmitted:ISubjectCopy[] =  this._grainCopyService.getListByNotCorrectedSubjectCopies(subjectCopyList, subjectScheduled.is_one_shot_submit);
                notCorrectedAlreadySubmitted.forEach((subjectCopy) => {
                    this._grainCopyService.getListBySubjectCopy(subjectCopy, true).then((grainCopyList: IGrainCopy[]) => {
                        var score = 0;
                        grainCopyList.forEach((grain) => {
                            score += this.genericCorrection(grainScheduledList.find((grainScheduled) => {return grainScheduled.id === grain.grain_scheduled_id}), grain);
                        });
                        subjectCopy.calculated_score = score;
                        this._subjectCopyService.update(subjectCopy);
                    })
                })
            }
        )
    }

    private genericCorrection = function(grainScheduled:IGrainScheduled, grainCopy:IGrainCopy):number {
        switch(grainScheduled.grain_type_id) {

            case 4:
                return this._simpleAnswerService.automaticCorrection(grainScheduled, grainCopy).calculated_score;
            case 5:
                return this._openAnswerService.automaticCorrection(grainScheduled, grainCopy).calculated_score;
            case 6:
                return this._multipleAnswerService.automaticCorrection(grainScheduled, grainCopy).calculated_score;
            case 7:
                return this._qcmService.automaticCorrection(grainScheduled, grainCopy).calculated_score;
            case 8:
                 return this._associationService.automaticCorrection(grainScheduled, grainCopy).calculated_score;
            case 9:
                return this._orderService.automaticCorrection(grainScheduled, grainCopy).calculated_score;
            case 10:
            case 11:
            case 12:
                return automaticCorrection(grainScheduled, grainCopy).calculated_score;
            default:
                return 0;
        }
    }
}

export const correctionService = ng.service('CorrectionService', CorrectionService);
