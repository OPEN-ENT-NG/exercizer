import { ng, template, idiom } from 'entcore';
import { _ } from 'entcore';
import { ISubjectCopy } from '../../../../models/domain';

export const subjectViewCopyTeacherActions = ng.directive('subjectViewCopyTeacherActions',
    ['$location', '$timeout', 'SubjectCopyService', ($location, $timeout, SubjectCopyService) => {
        return {
            restrict: 'E',
            scope: {
                subjectScheduled: '=',
                subjectCopy: '=',
                header: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/subject/subject_view_copy/templates/subject-view-copy-teacher-actions.html',
            link:(scope:any) => {

                var sortField = window.localStorage.getItem('exercizer' + scope.subjectScheduled.id + '.sortcache');
                var descSortField = window.localStorage.getItem('exercizer' + scope.subjectScheduled.id + '.sortcache.asc') == "false";

                var subjectCopyList:ISubjectCopy[] =
                    _.chain(SubjectCopyService.getListBySubjectScheduled(scope.subjectScheduled)).filter(function (subjectCopy) {
                        //filter only copy has submitted or due_date is past
                        return SubjectCopyService.canCorrectACopyAsTeacher(scope.subjectScheduled, subjectCopy);
                    }).sortBy( function(subjectCopy) {
                        if (sortField) {
                            return SubjectCopyService.orderBy(subjectCopy, sortField);
                        }
                        else {
                            return subjectCopy.owner_username;
                        }
                    }).value();
                if (descSortField) {
                    subjectCopyList = subjectCopyList.reverse()
                }

                var copiesYetToCorrect = 0;
                _.each(subjectCopyList, function(subjectCopy, index) {
                    if (SubjectCopyService.copyState(subjectCopy) != 'is_corrected') {
                        copiesYetToCorrect++;
                    }
                });
                var setCopiesYetToCorrectDisplay = function() {
                    scope.copiesYetToCorrectDisplay = idiom.translate("exercizer.copies.yet.to.correct").replace('{{number}}', `${copiesYetToCorrect}`);
                }
                setCopiesYetToCorrectDisplay();
                
                scope.redirectToDashboard = function(isCorrected:boolean) {
                    if (isCorrected) {
                        var copy = SubjectCopyService.getById(scope.subjectCopy.id);
                        copy.is_correction_on_going = true;
                        copy.is_corrected = true;
                        copiesYetToCorrect--;
                        setCopiesYetToCorrectDisplay();
                        scope.$emit('E_UPDATE_SUBJECT_COPY', copy, false);
                    } else {
                        $location.path('/dashboard/teacher/correction/'+scope.subjectScheduled.id);
                    }
                };

                scope.redirectToSubjectDashboard = function() {
                    $location.path('/dashboard');
                };

                scope.redirectToCorrectDashboard = function() {
                    $location.path('dashboard/teacher/correction');
                };

                scope.$on('E_SUBJECT_COPY_UPDATED', function(event, redirect:boolean) {
                    if (redirect) {
                        $location.path('/dashboard/teacher/correction/'+scope.subjectScheduled.id);
                    }
                });

                scope.copyIsCorrected = function(){
                    return scope.subjectCopy.is_corrected;
                };
                
                function findCopyIndexOfCurrentCopy() {
                    return _.findIndex(subjectCopyList, function(subjectCopy) { return subjectCopy.id === scope.subjectCopy.id });
                };

                scope.redirectToNextCopy = function() {
                    template.close("main");
                    let index = findCopyIndexOfCurrentCopy() + 1;
                    $timeout(function(){
                        $location.path('/subject/copy/view/'+ scope.subjectScheduled.subject_id + '/' +  subjectCopyList[index].id + '/');
                    },50);
                };

                scope.redirectToPreviousCopy = function() {
                    template.close("main");
                    let index = findCopyIndexOfCurrentCopy() - 1;
                     $timeout(function(){
                         $location.path('/subject/copy/view/'+ scope.subjectScheduled.subject_id + '/' +  subjectCopyList[index].id + '/');
                     },50);
                };

                scope.hasNextCopy = function() {
                    return scope.subjectCopy.id !== subjectCopyList[subjectCopyList.length-1].id;
                };

                scope.hasPreviousCopy = function() {
                    return scope.subjectCopy.id !== subjectCopyList[0].id;
                }

                scope.isHeader = function() {
                    return scope.header;
                }
            }
        };
    }]
);