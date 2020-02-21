import { ng, notify, idiom, model, Behaviours } from 'entcore';
import { ISubjectService } from '../../../../../services/SubjectService';
import { ISubjectLibraryService } from '../../../../../services/SubjectLibraryService';

export const dashboardTeacherTab = ng.directive('dashboardTeacherTab',  [ '$location', '$window', 'SubjectService', 'SubjectLibraryService', ($location, $window, SubjectService:ISubjectService, SubjectLibraryService:ISubjectLibraryService) => {
    return {
        restrict: 'E',
        scope: {
            currentTab: "=",
            selectedSubjectScheduled : "="
        },
        templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/common/templates/dashboard-teacher-tab.html',
        link: (scope:any) => {

            scope.switchTab = function (newTab) {
                switch (newTab){
                    case 'mySubjects':
                        SubjectService.resolve(true).then(
                            function(){
                                $location.path('/dashboard');
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );

                        break;
                    case 'correction':
                        $location.path('/dashboard/teacher/correction/');
                        break;
                    case 'library':
                        if (scope.showInternalLibrary()) {
                            $location.path('/dashboard/teacher/library');
                        } else {
                            scope.rediectToExternalLibrary();
                        }
                        break;
                    default:
                        throw 'tab ' + newTab + ' missing'
                }
            };

            scope.switchToStudentView = function () {
                $location.path('/dashboard/student');
                setTimeout(
                    function(){
                        $window.location.reload();
                    },
                    1);
            };

            scope.clickReturnExercizer = function(){
                switch (scope.currentTab){
                    case 'mySubjects':
                        break;
                    case 'correction':
                        scope.selectedSubjectScheduled = null;
                        $location.path('/dashboard');
                        break;
                    case 'library':
                        scope.selectedSubjectScheduled = null;
                        $location.path('/dashboard');
                        break;
                    default :
                        throw "tab "+scope.currentTab+"  missing"
                }

            };

            scope.clickReturnExercizerTab = function(){
                switch (scope.currentTab){
                    case 'mySubjects':
                        break;
                    case 'correction':
                        scope.selectedSubjectScheduled = null;
                        $location.path('/dashboard/teacher/correction');
                        break;
                    case 'library':
                        break;
                    default :
                        throw "tab "+scope.currentTab+"  missing"
                }

            };

            scope.clickReturnSubjectScheduledList = function(){
                if(scope.selectedSubjectScheduled.showStats){
                    scope.selectedSubjectScheduled.showStats = false;
                }else {
                    scope.selectedSubjectScheduled = null;
                    $location.path('/dashboard/teacher/correction');
                }
            };

            scope.option = {};

            scope.switchMode = function () {
                if (scope.option.mode == 'simple') {
                    scope.option.mode = 'full';
                } else {
                    scope.option.mode = 'simple';
                }
            }

            scope.export = function () {
                scope.$emit('E_EXPORT_STATS', { subjectScheduled: scope.selectedSubjectScheduled, mode: scope.option.mode });
            }

            scope.getTab = function(){
                switch (scope.currentTab){
                    case 'mySubjects':
                        return idiom.translate("exercizer.dashboard.instructer.tab1");
                    case 'correction':
                        return idiom.translate("exercizer.dashboard.instructer.tab2");
                    case 'library':
                        return idiom.translate("exercizer.dashboard.instructer.tab3");
                    default :
                        throw "tab "+scope.currentTab+"  missing"
                }
            };

            scope.showInternalLibrary = function():boolean {
                return !model.me.hasWorkflow(Behaviours.applicationsBehaviours.exercizer.rights.workflow.publish);
            }

            scope.rediectToExternalLibrary = function() {
                SubjectLibraryService.externalLibraryUrl().then((url: string) => {
                    window.location.href = `${url}?platformURL=${encodeURIComponent($location.host())}`;
                }, err => notify.error(err));
            }

            let unreadLibrarySubjects: Number = 0;
            SubjectLibraryService.countNewSubjects().then((count: Number) => unreadLibrarySubjects = count);
            scope.newLibrarySubjects = () => unreadLibrarySubjects;
            scope.newLibrarySubjectsExist = () => unreadLibrarySubjects > 0;
        }
    };
}]
);
