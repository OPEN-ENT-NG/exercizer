directives.push(
    {
        name: 'subjectCopyDomino',
        injections: ['DateService', '$location', 'SubjectScheduledService',
            (DateService, $location, SubjectScheduledService) => {
                return {
                    restrict: 'E',
                    scope: {
                        subjectCopy: '=',
                        subjectScheduled: '='
                    },
                    templateUrl: 'exercizer/public/app/components/dashboard/student_dashboard/common/templates/subject-copy-domino.html',
                    link: (scope:any) => {

                        /**
                         * ACCESS perform
                         */

                        scope.canAccessPerform = function () {
                            // a student can not access to a copy if
                            // the subject is over
                            // OR
                            // the subject have been submitted AND the subject have option one_shot == true;
                            if (SubjectScheduledService.is_over(scope.subjectScheduled) === true) {
                                return false;
                            } else {
                                if (scope.subjectScheduled.is_one_shot_submit && scope.subjectCopy.submitted_date) {
                                    return false;
                                } else {
                                    if(isCorrectionOnGoing() || is_corrected()){
                                        return false
                                    } else{
                                        return true;
                                    }
                                }
                            }
                        };
                        scope.canAccessView = function () {
                            if(SubjectScheduledService.is_over(scope.subjectScheduled) === true){
                                if(scope.subjectScheduled.has_automatic_display){
                                    return true;
                                } else{
                                    if(is_corrected()){
                                        return true;
                                    } else{
                                        return false;
                                    }
                                }
                            } else{
                                return false
                            }
                        };

                        scope.performSubjectCopy = function (subjectCopyId) {
                            $location.path('/subject/copy/perform/' + subjectCopyId);
                        };

                        scope.viewSubjectCopy = function (subjectCopyId) {
                            $location.path('/subject/copy/view/' + subjectCopyId);
                        };

                        /**
                         * GET subject Scheduled information
                         */

                        scope.getSubjectCopyPicture = function () {
                            return scope.subjectScheduled.picture || '/assets/themes/leo/img/illustrations/poll-default.png';
                        };

                        scope.getSubjectCopySubmittedDate = function () {
                            if (scope.subjectCopy.submitted_date) {
                                return DateService.isoToDate(scope.subjectCopy.submitted_date);
                            } else {
                                return '';
                            }
                        };
                        scope.getSubjectScheduledTitle = function () {
                            return scope.subjectScheduled.title || 'Titre';
                        };
                        scope.getSubjectScheduledOwner = function () {
                            return scope.subjectScheduled.owner_username || '';
                        };
                        scope.getSubjectScheduledMaxScore = function () {
                            return scope.subjectScheduled.max_score || '';
                        };

                        /**
                         * Get subject copy information
                         */

                        scope.getSubjectCopyDueDate = function () {
                            if (scope.subjectScheduled.due_date) {
                                return DateService.isoToDate(scope.subjectScheduled.due_date);
                            } else {
                                return '';
                            }
                        };

                        /**
                         * Specific
                         */

                        scope.isColorColumnDisplay = function () {
                            if (isSubmitted() || isCorrectionOnGoing() || is_corrected()){
                                return true;
                            } else {
                                return false;
                            }
                        };

                        scope.getColorColumn = function () {
                            if (is_corrected()) {
                                return "#72BB53";
                            } else if (isCorrectionOnGoing()) {
                                return "#FF8351";
                            } else if (isSubmitted()) {
                                return "#00A4D3";
                            } else if (hasBeenStarted()) {
                                return "#FF8351";
                            }
                        };

                        scope.textBeforeTitle = function () {
                            if (is_corrected()) {
                                return "Corrigé - ";
                            } else if (isCorrectionOnGoing()) {
                                return "En cours de correction - ";
                            } else if (isSubmitted()) {
                                return "Rendu - ";
                            } else if (hasBeenStarted()) {
                                return "Commencé - ";
                            } else {
                                return "";
                            }
                        };

                        scope.isDueDateDisplayed = function(){
                          return !isSubmitted();
                        };
                        scope.isSubmittedDateDisplayed = function(){
                          return isSubmitted();
                        };

                        /**
                         * private function
                         */

                        function hasBeenStarted() {
                            return scope.subjectCopy.has_been_started;
                        }

                        function isSubmitted() {
                            return scope.subjectCopy.submitted_date;
                        }

                        function isCorrectionOnGoing() {
                            return scope.subjectCopy.is_correction_on_going;
                        }

                        function is_corrected() {
                            return scope.subjectCopy.is_corrected;
                        }
                    }
                }
            }
        ]
    }
);
