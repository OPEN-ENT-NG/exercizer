import { ng, routes } from 'entcore';

import { subjectCopyDomino } from './app/components/dashboard/student_dashboard/common/directives/subject-copy-domino';
import { studentDashboardFinishSubjectCopyList } from './app/components/dashboard/student_dashboard/student_dashboard_finish_subject_copy_list/directives/studentDashBoardFinishSubjectCopyList';
import { studentDashboardSubjectCopyList } from './app/components/dashboard/student_dashboard/student_dashboard_subject_copy_list/directives/studentDashBoardSubjectCopyList';
import { dashboardTeacherTab } from './app/components/dashboard/teacher_dashboard/common/directives/dashboardTeacherTab';
import { reminders } from './app/components/dashboard/teacher_dashboard/common/directives/reminders';
import { sharePanelModal } from './app/components/dashboard/teacher_dashboard/common/directives/share-panel-light-box';
import { subjectScheduleAssignAt } from './app/components/dashboard/teacher_dashboard/common/directives/subject-scheduled-assign-at';
import { teacherDashboardCorrectionCopyList } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_correction_tab/directives/teacherDashboardCorrectionCopyList';
import { teacherDashboardCorrectionSubjectScheduledList } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_correction_tab/directives/teacherDashboardCorrectionSubjectScheduledList';
import { teacherDashboardSimpleCorrectionCopyList } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_correction_tab/directives/teacherDashboardSimpleCorrectionCopyList';
import { teacherDashboardCopyPaste } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/directives/teacherDashboardCopyPaste';
import { teacherDashboardFolderEdit } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/directives/teacherDashboardFolderEdit';
import { teacherDashboardMove } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/directives/teacherDashboardMove';
import { teacherDashboardPublishToLibrary } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/directives/teacherDashboardPublishToLibrary';
import { teacherDashboardRemoveSelectedFolderAndSubject } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/directives/teacherDashboardRemoveSelectedFolderAndSubject';
import { teacherDashboardSubjectEdit } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/directives/teacherDashboardSubjectEdit';
import { teacherDashboardSubjectList } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/directives/teacherDashboardSubjectList';
import { teacherDashboardToaster } from './app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/directives/teacherDashboardToaster';
import { folderNavContainer } from './app/components/folder/common/folder_nav/directives/folderNavContainer';
import { folderNavItem } from './app/components/folder/common/folder_nav/directives/folderNavItem';
import { editAssociation } from './app/components/grain/association/directives/editAssociation';
import { performAssociation } from './app/components/grain/association/directives/performAssociation';
import { viewAssociation } from './app/components/grain/association/directives/viewAssociation';
import { customEditor } from './app/components/grain/common/editor/editor';
import { grainCopyFooter } from './app/components/grain/common/grain_copy/directives/grainCopyFooter';
import { grainCopyGrainDocumentList } from './app/components/grain/common/grain_copy/directives/grainCopyGrainDocumentList';
import { grainCopyHeader } from './app/components/grain/common/grain_copy/directives/grainCopyHeader';
import { grainCopyStatement } from './app/components/grain/common/grain_copy/directives/grainCopyStatement';
import { editFillText } from './app/components/grain/filltext/directives/edit';
import { performFillText } from './app/components/grain/filltext/directives/perform';
import { viewFillText } from './app/components/grain/filltext/directives/view';
import { fillZone } from './app/components/grain/filltext/directives/fillzone';
import { editMultipleAnswer } from './app/components/grain/multiple_answer/directives/editMultipleAnswer';
import { performMultipleAnswer } from './app/components/grain/multiple_answer/directives/performMultipleAnswer';
import { viewMultipleAnswer } from './app/components/grain/multiple_answer/directives/viewMultipleAnswer';
import { editOpenAnswer } from './app/components/grain/open_answer/directives/editOpenAnswer';
import { performOpenAnswer } from './app/components/grain/open_answer/directives/performOpenAnswer';
import { viewOpenAnswer } from './app/components/grain/open_answer/directives/viewOpenAnswer';
import { editOrder } from './app/components/grain/order/directives/editOrder';
import { performOrder } from './app/components/grain/order/directives/performOrder';
import { viewOrder } from './app/components/grain/order/directives/viewOrder';
import { editQcm } from './app/components/grain/qcm/directives/editQcm';
import { performQcm } from './app/components/grain/qcm/directives/performQcm';
import { viewQcm } from './app/components/grain/qcm/directives/viewQcm';
import { editSimpleAnswer } from './app/components/grain/simple_answer/directives/editSimpleAnswer';
import { performSimpleAnswer } from './app/components/grain/simple_answer/directives/performSimpleAnswer';
import { viewSimpleAnswer } from './app/components/grain/simple_answer/directives/viewSimpleAnswer';
import { editStatement } from './app/components/grain/statement/directives/editStatement';
import { performStatement } from './app/components/grain/statement/directives/performStatement';
import { viewStatement } from './app/components/grain/statement/directives/viewStatement';
import { choose } from './app/components/grain/undefined/directives/choose';
import { chooseAnswer } from './app/components/grain/undefined/directives/chooseAnswer';
import { performSummary } from './app/components/grain/undefined/directives/perform-summary';
import { viewSummary } from './app/components/grain/undefined/directives/view-summary';
import { editZoneImage } from './app/components/grain/zoneimage/directives/edit';
import { performZoneImage } from './app/components/grain/zoneimage/directives/perform';
import { viewZoneImage } from './app/components/grain/zoneimage/directives/view';
import { editZoneText } from './app/components/grain/zonetext/directives/edit';
import { performZoneText } from './app/components/grain/zonetext/directives/perform';
import { viewZoneText } from './app/components/grain/zonetext/directives/view';
import { subjectCopyLeftNav } from './app/components/subject/common/subject_copy/directives/subjectCopyLeftNav';
import { subjectEditSubjectList } from './app/components/subject/subject_edit/directives/subjectEditSubjectList';
import { subjectPerformCopyBottomNav } from './app/components/subject/subject_perform_copy/directives/subjectPerformCopyBottomNav';
import { subjectPerformCopyDisplayCurrentGrainCopy } from './app/components/subject/subject_perform_copy/directives/subjectPerformCopyDisplayCurrentGrainCopy';
import { subjectPerformCopyPreviewHeader } from './app/components/subject/subject_perform_copy/directives/subjectPerformCopyPreviewHeader';
import { subjectPerformCopyStudentHeader } from './app/components/subject/subject_perform_copy/directives/subjectPerformCopyStudentHeader';
import { subjectSchedule } from './app/components/subject/subject_schedule/directives/subjectSchedule';
import { subjectViewCopyGrainCopyList } from './app/components/subject/subject_view_copy/directives/subjectViewCopyGrainCopyList';
import { subjectViewCopyPreviewHeader } from './app/components/subject/subject_view_copy/directives/subjectViewCopyPreviewHeader';
import { subjectViewCopyStudentHeader } from './app/components/subject/subject_view_copy/directives/subjectViewCopyStudentHeader';
import { subjectViewCopyTeacherFooter } from './app/components/subject/subject_view_copy/directives/subjectViewCopyTeacherFooter';
import { subjectViewCopyTeacherHeader } from './app/components/subject/subject_view_copy/directives/subjectViewCopyTeacherHeader';
import { digitsInputRestrict } from './app/directives/input_restrictions/digitsInputRestrict';
import { 
    accessService, groupService, dateService, folderService, 
    dragService, subjectService, subjectLibraryService, subjectLessonTypeService,
    subjectCopyService, subjectLessonLevelService, subjectScheduledService, 
    grainScheduledService, grainCopyService, grainService, grainTypeService, subjectTagService
} from './app/services';

import { orderService } from './app/components/grain/order/services/OrderService';
import { simpleAnswerService } from './app/components/grain/simple_answer/services/SimpleAnswerService';
import { multipleAnswerService } from './app/components/grain/multiple_answer/services/MultipleAnswerService';
import { associationService } from './app/components/grain/association/services/AssociationService';
import { qcmService } from './app/components/grain/qcm/services/QcmService';
import { openAnswerService } from './app/components/grain/open_answer/services/OpenAnswerService';

import * as controllers from './app/controllers';

ng.directives.push(subjectCopyDomino);
ng.directives.push(studentDashboardFinishSubjectCopyList);
ng.directives.push(studentDashboardSubjectCopyList);
ng.directives.push(dashboardTeacherTab);
ng.directives.push(reminders);
ng.directives.push(sharePanelModal);
ng.directives.push(subjectScheduleAssignAt);
ng.directives.push(teacherDashboardCorrectionCopyList);
ng.directives.push(teacherDashboardCorrectionSubjectScheduledList);
ng.directives.push(teacherDashboardSimpleCorrectionCopyList);
ng.directives.push(teacherDashboardCopyPaste);
ng.directives.push(teacherDashboardFolderEdit);
ng.directives.push(teacherDashboardMove);
ng.directives.push(teacherDashboardPublishToLibrary);
ng.directives.push(teacherDashboardRemoveSelectedFolderAndSubject);
ng.directives.push(teacherDashboardSubjectEdit);
ng.directives.push(teacherDashboardSubjectList);
ng.directives.push(teacherDashboardToaster);
ng.directives.push(folderNavContainer);
ng.directives.push(folderNavItem);
ng.directives.push(editAssociation);
ng.directives.push(performAssociation);
ng.directives.push(viewAssociation);
ng.directives.push(customEditor);
ng.directives.push(grainCopyFooter);
ng.directives.push(grainCopyGrainDocumentList);
ng.directives.push(grainCopyHeader);
ng.directives.push(grainCopyStatement);
ng.directives.push(editFillText);
ng.directives.push(performFillText);
ng.directives.push(viewFillText);
ng.directives.push(fillZone);
ng.directives.push(editMultipleAnswer);
ng.directives.push(performMultipleAnswer);
ng.directives.push(viewMultipleAnswer);
ng.directives.push(editOpenAnswer);
ng.directives.push(performOpenAnswer);
ng.directives.push(viewOpenAnswer);
ng.directives.push(editOrder);
ng.directives.push(performOrder);
ng.directives.push(viewOrder);
ng.directives.push(editQcm);
ng.directives.push(performQcm);
ng.directives.push(viewQcm);
ng.directives.push(editSimpleAnswer);
ng.directives.push(performSimpleAnswer);
ng.directives.push(editStatement);
ng.directives.push(performStatement);
ng.directives.push(viewStatement);
ng.directives.push(choose);
ng.directives.push(chooseAnswer);
ng.directives.push(performSummary);
ng.directives.push(viewSummary);
ng.directives.push(editZoneImage);
ng.directives.push(performZoneImage);
ng.directives.push(viewZoneImage);
ng.directives.push(editZoneText);
ng.directives.push(performZoneText);
ng.directives.push(viewZoneText);
ng.directives.push(subjectCopyLeftNav);
ng.directives.push(subjectEditSubjectList);
ng.directives.push(subjectPerformCopyBottomNav);
ng.directives.push(subjectPerformCopyDisplayCurrentGrainCopy);
ng.directives.push(subjectPerformCopyPreviewHeader);
ng.directives.push(subjectPerformCopyStudentHeader);
ng.directives.push(subjectSchedule);
ng.directives.push(subjectViewCopyGrainCopyList);
ng.directives.push(subjectViewCopyPreviewHeader);
ng.directives.push(subjectViewCopyStudentHeader);
ng.directives.push(subjectViewCopyTeacherFooter);
ng.directives.push(subjectViewCopyTeacherHeader);
ng.directives.push(digitsInputRestrict);

/**
 * Services
 */

ng.services.push(subjectService);
ng.services.push(subjectLibraryService);
ng.services.push(subjectLessonTypeService);
ng.services.push(subjectLessonLevelService);
ng.services.push(subjectTagService);
ng.services.push(subjectScheduledService);
ng.services.push(subjectCopyService);
ng.services.push(grainService);
ng.services.push(grainScheduledService);
ng.services.push(grainCopyService);
ng.services.push(grainTypeService);
ng.services.push(simpleAnswerService);
ng.services.push(multipleAnswerService);
ng.services.push(associationService);
ng.services.push(qcmService);
ng.services.push(openAnswerService);
ng.services.push(orderService);
ng.services.push(dragService );
ng.services.push(folderService );
ng.services.push(dateService );
ng.services.push(groupService );
ng.services.push(accessService );

/**
 * Controllers
 */
for(let prop in controllers){
    ng.controllers.push(controllers[prop]);
}

routes.define(function($routeProvider){
    $routeProvider
        .when('/dashboard', {
            action: 'dashboard'
        })
        .when('/dashboard/student', {
            action: 'dashboardStudent'
        })
        .when('/dashboard/teacher/correction/:subjectScheduledId?', {
            action: 'dashboardTeacherCorrection'
        })
        .when('/dashboard/teacher/library', {
            action: 'dashboardTeacherLibrary'
        })
        .when('/subject/edit/:subjectId/', {
            action: 'editSubject'
        })
        .when('/subject/edit/simple/:subjectId/', {
            action: 'editSimpleSubject'
        })
        .when('/subject/create/simple/', {
            action: 'editSimpleSubject'
        })
        .when('/subject/copy/preview/perform/:subjectId/', {
            action: 'previewPerformSubjectCopy'
        })
        // perform as student
        .when('/subject/copy/perform/:subjectCopyId/', {
            action: 'performSubjectCopy'
        })
        .when('/subject/edit/simple/preview/:subjectPreviewId/', {
            action: 'previewEditSubjectSimpleCopy'
        })
        .when('/subject/copy/perform/simple/:subjectCopyId/', {
            action: 'performSimpleSubjectCopy'
        })
        .when('/subject/copy/view/preview/:subjectId/', {
            action: 'previewViewSubjectCopy'
        })
        .when('/subject/copy/view/:subjectId/:subjectCopyId/', {
            action: 'viewSubjectCopyAsTeacher'
        })
        // view as student
        .when('/subject/copy/view/:subjectCopyId/', {
            action: 'viewSubjectCopy'
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
});

ng.onInit((module) => {
    module.config(['$httpProvider', function($httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors

        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    }]);


    /**
     * Filters
     */

    module.filter('orderObjectBy', function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if(reverse) filtered.reverse();
            return filtered;
        };
    });

    module.filter('filterIf', function() {
        return function(i,b) {
            if(b){
                return i;
            }
        };
    });


    function floorFigure(figure : number, decimals : number){
        if (!decimals) decimals = 2;
        var d = Math.pow(10,decimals);
        return ((figure*d)/d).toFixed(decimals);
    }

    module.filter('truncateNumber', function () {
        return function (item) {
            if(!item){
                // if item is not a number return an empty string
                return ""
            } else {
                if(parseFloat(item) == parseInt(item)){
                    return item;
                }
                return floorFigure(parseFloat(item), 2);
            }

        };
    });
})