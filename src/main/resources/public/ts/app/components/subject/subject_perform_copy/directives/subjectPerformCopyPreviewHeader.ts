import { ng, notify } from 'entcore';
import { IFolder } from '../../../../models/domain';

export const subjectPerformCopyPreviewHeader = ng.directive('subjectPerformCopyPreviewHeader',
    ['$location', 'SubjectCopyService', 'SubjectLibraryService', 'SubjectService', ($location, SubjectCopyService, SubjectLibraryService, SubjectService) => {
        return {
            restrict: 'E',
            scope: {
                subjectScheduled: '=',
                subjectCopy: '=',
                grainScheduledList: '=',
                grainCopyList: '=',
                previewingFromLibrary: '=',
                previewingReader: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/subject/subject_perform_copy/templates/subject-perform-copy-preview-header.html',
            link:(scope:any) => {
                
                scope.displayModalCopyPaste = function() {
                    if (scope.previewingFromLibrary) {
                        var subjectTmpArray = [];
                        subjectTmpArray.push(SubjectLibraryService.tmpSubjectForPreview);
                        scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE', subjectTmpArray, [], true);
                    }
                };

                scope.$on('E_CONFIRM_COPY_PASTE', function(event, folder:IFolder) {
                    if (scope.previewingFromLibrary) {

                        let subjectIds = [];
                        subjectIds.push(SubjectLibraryService.tmpSubjectForPreview.id);

                        let folderId = (folder) ? folder.id : null;

                        SubjectService.duplicateSubjectsFromLibrary(subjectIds, folderId).then(
                            function() {
                                notify.info('exercizer.service.save.library.dup');
                                $location.path('/dashboard/teacher/library');
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    }
                });

                scope.redirectToDashBoard = function() {
                    $location.path('/dashboard');
                };

                scope.redirectToTeacherDashboardLibraryTab = function() {
                    if (scope.previewingFromLibrary) {
                        $location.path('/dashboard/teacher/library');
                    }
                };

                scope.redirectToSubjectEdit = function() {
                    if (!scope.previewingFromLibrary) {
                        $location.path('/subject/edit/' + scope.subjectScheduled.subject_id + '/');
                    }
                };
                
                scope.redirectToSubjectPreviewViewCopy = function() {
                    SubjectCopyService.tmpPreviewData = {
                        subjectScheduled: scope.subjectScheduled,
                        subjectCopy: scope.subjectCopy,
                        grainScheduledList: scope.grainScheduledList,
                        grainCopyList: scope.grainCopyList,
                    };

                    $location.path('/subject/copy/view/preview/' + scope.subjectScheduled.subject_id + '/');
                };
            }
        };
    }]
);