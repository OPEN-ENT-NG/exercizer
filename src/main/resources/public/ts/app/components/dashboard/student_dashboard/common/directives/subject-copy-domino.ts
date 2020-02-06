import { ng, idiom, skin, notify } from 'entcore'

export let subjectCopyDomino = ng.directive('subjectCopyDomino', ['DateService', '$location', '$timeout', 'SubjectScheduledService','SubjectCopyService',
    (DateService, $location, $timeout, SubjectScheduledService, SubjectCopyService) => {
        return {
            restrict: 'E',
            scope: {
                subjectCopy: '=',
                subjectScheduled: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/dashboard/student_dashboard/common/templates/subject-copy-domino.html',
            link: (scope:any) => {

                /**
                 * ACCESS Perform, view
                 */

                scope.selectTitle = function(){
                    if (scope.subjectCopy.is_training_copy) {
                        if (scope.subjectCopy.has_been_started || !scope.subjectCopy.submitted_date) {
                            return 'perform';
                        } else {
                            return 'training';
                        }
                    }
                    if (scope.subjectScheduled.type === 'simple') {
                        if(!DateService.compare_after(new Date(), DateService.isoToDate(scope.subjectScheduled.begin_date), true))
                            return 'text'
                        return 'perform'
                    } else if(SubjectCopyService.canPerformACopyAsStudent(scope.subjectScheduled, scope.subjectCopy)){
                        return 'perform'
                    } else if(SubjectCopyService.canAccessViewAsStudent(scope.subjectScheduled, scope.subjectCopy)){
                        return 'view'
                    } else{
                        return 'text'
                    }
                };

                scope.performSubjectCopy = function (subjectCopyId) {
                    if (scope.subjectScheduled.type === 'simple') {
                        $location.path('/subject/copy/perform/simple/' + subjectCopyId);
                    } else {
                        $location.path('/subject/copy/perform/' + subjectCopyId);
                    }
                };

                scope.viewSubjectCopy = function (subjectCopyId) {
                    $location.path('/subject/copy/view/' + subjectCopyId);
                };

                scope.viewSubjectCopyFinalScore = function (subjectCopyId) {
                    $location.path('/subject/copy/view/final-score/' + subjectCopyId);
                };

                /**
                 * GET subject Scheduled information
                 */

                scope.getSubjectCopyPicture = function () {
                    return scope.subjectScheduled.picture || skin.basePath + 'img/illustrations/image-default.svg';
                };

                scope.getSubjectCopySubmittedDate = function () {
                    if (scope.subjectCopy.submitted_date) {
                        scope.submittedDate = DateService.isoToDate(scope.subjectCopy.submitted_date);
                    } else {
                        scope.submittedDate = '';
                    }
                    return scope.submittedDate;
                };
                scope.getSubjectScheduledTitle = function () {
                    return scope.subjectScheduled.title || idiom.translate("exercizer.domino.default.title");
                };
                scope.getSubjectScheduledMaxScore = function () {
                    return scope.subjectScheduled.max_score || '0';
                };


                scope.tooLate = function(){
                    if(!scope.subjectCopy.submitted_date){
                        return DateService.compare_after(new Date(), DateService.isoToDate(scope.subjectScheduled.due_date), false);
                    } else{
                        return false;
                    }

                };

                scope.cantSart = function(){
                    return  DateService.compare_after(DateService.isoToDate(scope.subjectScheduled.begin_date), new Date(), true)
                };

                /**
                 * Get subject copy information
                 */

                scope.getSubjectCopyDueDate = function () {
                    if (scope.subjectScheduled.due_date) {
                        scope.dueDate = DateService.isoToDate(scope.subjectScheduled.due_date);
                    } else {
                        scope.dueDate = '';
                    }
                    return scope.dueDate;
                };

                /**
                 * DISPLAY
                 */

                scope.isColorColumnDisplay = function () {
                    if (scope.subjectCopy.submitted_date
                        || scope.subjectCopy.is_correction_on_going
                        || scope.subjectCopy.is_corrected
                    ){
                        return true;
                    } else {
                        return false;
                    }
                };

                scope.copyStateColorClass = function(){
                    return SubjectCopyService.copyStateColorClass(scope.subjectCopy);
                };

                scope.textBeforeTitle = function(){
                    return SubjectCopyService.copyStateText(scope.subjectCopy)?  SubjectCopyService.copyStateText(scope.subjectCopy) + " - " : "";
                };

                scope.isDueDateDisplayed = function(){
                    scope.getSubjectCopyDueDate();
                    return !scope.subjectCopy.submitted_date;
                };

                scope.isSubmittedDateDisplayed = function(){
                    scope.getSubjectCopySubmittedDate();
                    return scope.subjectCopy.submitted_date;
                };

                scope.downloadGeneralCorrectedFile = function() {
                    window.location.href = '/exercizer/subject-scheduled/corrected/download/' + scope.subjectScheduled.id;
                };

                scope.downloadCorrectedFile = function() {
                    window.location.href = '/exercizer/subject-copy/corrected/download/' + scope.subjectCopy.id;
                };

                scope.canShowGeneralCorrected = function() {
                    //if corrected date has passed and subject scheduled corrected exist
                    return  (scope.subjectScheduled.type !== 'simple') ? false : scope.canShowCorrected() && this.subjectScheduled.corrected_file_id !== null;
                };

                scope.canShowIndividualCorrected = function(){
                    //if corrected date has passed and subject copy corrected exist
                    return  (scope.subjectScheduled.type !== 'simple') ? false : scope.canShowCorrected() && this.subjectCopy.corrected_file_id !== null;
                };

                scope.canShowCorrected = function() {
                    //if corrected date has passed
                    return  DateService.compare_after(new Date(), DateService.isoToDate(scope.subjectScheduled.corrected_date), true);
                };

                scope.canShowTrainingOption = function() {
                    return scope.subjectCopy.submitted_date && !scope.subjectCopy.is_training_copy;
                };

                scope.canCreateTraining = function() {
                    return scope.subjectScheduled.is_training_permitted && (scope.subjectCopy.is_corrected || (scope.subjectScheduled.corrected_date && scope.canShowCorrected()));
                }

                scope.canSoonCreateTraining = function() {
                    return scope.subjectScheduled.is_training_permitted && !(scope.subjectCopy.is_corrected || (scope.subjectScheduled.corrected_date && scope.canShowCorrected()));
                }

                scope.createTrainingCopy = function() {
                    SubjectScheduledService.createTrainingCopy(scope.subjectScheduled.id).then(function () {
                        notify.info("exercizer.notify.create.training.success");
                        $timeout(function(){
                            window.location.reload();
                        },3000);
                    }, function (err) {
                        notify.error(err);
                    });
                }

            }
        }
    }
]
);
