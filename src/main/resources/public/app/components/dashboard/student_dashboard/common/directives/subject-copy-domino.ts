directives.push(
    {
        name: 'subjectCopyDomino',
        injections: ['DateService', '$location', 'SubjectScheduledService','SubjectCopyService',
            (DateService, $location, SubjectScheduledService, SubjectCopyService) => {
                return {
                    restrict: 'E',
                    scope: {
                        subjectCopy: '=',
                        subjectScheduled: '='
                    },
                    templateUrl: 'exercizer/public/app/components/dashboard/student_dashboard/common/templates/subject-copy-domino.html',
                    link: (scope:any) => {

                        /**
                         * ACCESS Perform, view
                         */

                        scope.selectTitle = function(){
                            if (scope.subjectScheduled.type === 'simple') {
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

                        /**
                         * GET subject Scheduled information
                         */

                        scope.getSubjectCopyPicture = function () {
                            return scope.subjectScheduled.picture || (window as any).skin.basePath + 'img/illustrations/image-default.svg';
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
                            return scope.subjectScheduled.max_score || '0';
                        };


                        scope.tooLate = function(){
                            if(!scope.subjectCopy.submitted_date){
                                return DateService.compare_after(new Date(), DateService.isoToDate(scope.subjectScheduled.due_date), false);
                            } else{
                                return false;
                            }

                        };

                        scope.submitCopyLate = function(){
                            if (scope.subjectScheduled.type === 'simple') {
                                $location.path('/subject/copy/perform/simple/' + scope.subjectCopy.id);
                            } else {
                                scope.subjectCopy.submitted_date = new Date().toISOString();
                                SubjectCopyService.submit(scope.subjectCopy).then(
                                    function (subjectCopy:ISubjectCopy) {
                                        notify.info("Votre copie à été rendue.");
                                    },
                                    function (err) {
                                        notify.error(err);
                                    }
                                );
                            }
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

                        scope.copyStateBackGroundColorClass = function(){
                            return SubjectCopyService.copyStateBackGroundColorClass(scope.subjectCopy);
                        };

                        scope.textBeforeTitle = function(){
                            return SubjectCopyService.copyStateText(scope.subjectCopy)?  SubjectCopyService.copyStateText(scope.subjectCopy) + " - " : "";
                        };

                        scope.isDueDateDisplayed = function(){
                          return !scope.subjectCopy.submitted_date;
                        };

                        scope.isSubmittedDateDisplayed = function(){
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
                            return  (scope.subjectScheduled.type !== 'simple') ? false : canShowCorrected() && this.subjectScheduled.corrected_file_id !== null;
                        };

                        scope.canShowIndividualCorrected = function(){
                            //if corrected date has passed and subject copy corrected exist
                            return  (scope.subjectScheduled.type !== 'simple') ? false : canShowCorrected() && this.subjectCopy.corrected_file_id !== null;
                        };

                        function canShowCorrected() {
                            //if corrected date has passed
                            return  DateService.compare_after(new Date(), DateService.isoToDate(scope.subjectScheduled.corrected_date), false);
                        };



                    }
                }
            }
        ]
    }
);
