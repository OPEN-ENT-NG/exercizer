directives.push(
    {
        name: 'subjectCopyDomino',
        injections: ['DateService','$location','SubjectScheduledService',
            (DateService, $location, SubjectScheduledService) => {
                return {
                    restrict: 'E',
                    scope: {
                        subjectCopy: '=',
                        subjectScheduled :'='
                    },
                    templateUrl: 'exercizer/public/app/components/dashboard/student_dashboard/common/templates/subject-copy-domino.html',
                    link: (scope:any) => {

                        scope.canAccessPerform = function(){
                            // a student can not access to a copy if
                            // the subject is over
                            // OR
                            // the subject have been submitted AND the subject have option one_shot == true;
                            if(SubjectScheduledService.is_over(scope.subjectScheduled) === true){
                                return false;
                            } else {
                                if(scope.subjectScheduled.is_one_shot_submit && scope.subjectCopy.submitted_date){
                                    return false;
                                } else{
                                    return true;
                                }
                            }
                        };

                        scope.performSubjectCopy = function(subjectCopyId){
                            $location.path('/subject/copy/view/'+subjectCopyId);
                        };

                        scope.getSubjectCopyPicture = function(){
                            return scope.subjectScheduled.picture || '/assets/themes/leo/img/illustrations/poll-default.png';
                        };
                        scope.getSubjectCopyDueDate = function(){
                            if(scope.subjectScheduled.due_date){
                                return DateService.isoToDate(scope.subjectScheduled.due_date);
                            } else{
                                return '';
                            }
                        };
                        scope.getSubjectScheduledTitle = function(){
                            return scope.subjectScheduled.title || 'Titre';
                        };
                        scope.getSubjectScheduledOwner = function(){
                            return scope.subjectScheduled.owner_username || '';

                        };
                        scope.getSubjectScheduledMaxScore = function(){
                            return scope.subjectScheduled.max_score || '';

                        };

                        scope.textIfSubjectCopyStartPerforming = function(){
                            if(scope.subjectCopy.has_been_started){
                                return "Commencé - ";
                            } else{
                                return "";
                            }
                        };
                    }
                }
            }
        ]
    }
);
