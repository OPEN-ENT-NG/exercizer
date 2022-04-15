import { ng } from 'entcore';
import { IGrain } from '../../../../models/domain';
import { $ } from 'entcore';

export const subjectEditSubjectList = ng.directive('subjectEditSubjectList',
    [
        'FolderService','SubjectService','GrainService','GrainTypeService',
        (FolderService, SubjectService, GrainService, GrainTypeService
            ) => {
            return {
                restrict: 'E',
                scope: {
                    spreaded: '=?isSpreaded'
                },
                templateUrl: 'exercizer/public/ts/app/components/subject/subject_edit/templates/subject-edit-subject-list.html',
                link: (scope:any, element:any) => {
                    /* don't work
                     element.find('.list-view').on('startDrag', '.subject-dragged-grain', function(event) {
                     console.log('test');

                     });

                     element.on('startDrag', '.subject-dragged-grain', function(event) {
                     console.log('test');

                     });
                     */

                    $('body').on('startDrag', '.subject-dragged-grain', function(event) {                        
                        scope.$root.$broadcast('E_SUBJECTEDIT_DROPABLE_ACTIVATED', true);
                    });
                    
                    scope.autocomplete = {
                        subjectList: null
                    };

                    scope.grainList = [];
                    
                    scope.subjectList = function () {
                        return SubjectService.getList();
                    };

                    scope.getGrainIllustrationURL = function(grainTypeId:number) {
                        return GrainTypeService.getIllustrationURL(grainTypeId);
                    };
                    
                    scope.getGrainName = function (grain:IGrain) {
                        if (grain.grain_data && grain.grain_data.title) {
                            return grain.grain_data.title;
                        } else {
                            var grainType = GrainTypeService.getById(grain.grain_type_id);
                            return grainType.public_name;
                        }
                    };

                    scope.toggle = function () {
                        scope.spreaded = !scope.spreaded;
                    };
                    

                    /**
                     * AUTOCOMPLETE
                     */

                    scope.clickOnAutoComplete = function () {
                        if (scope.subjectList()) {
                            scope.autocomplete.subjectList = createListAutoComplete();
                        }
                    };

                    scope.clickOnItem = function(subjectFromAutoComplete){
                        scope.subject = SubjectService.getById(subjectFromAutoComplete.id);
                        GrainService.getListBySubject(scope.subject).then(
                            function(data){
                                scope.grainList = data;
                            }
                        )

                    };

                    function createListAutoComplete() {
                        var array = [];
                        angular.forEach(scope.subjectList(), function (value) {
                            var folder = null,
                                folderString = "";
                            if (value.folder_id) {
                                folder = FolderService.folderById(value.folder_id);
                                if (folder) {
                                    folderString = " (" + folder.label + ")";
                                }
                            }
                            var obj = {
                                title: value.title,
                                name: value.title + folderString,
                                id: value.id,
                                toString: function () {
                                    return this.name;
                                }
                            };
                            array.push(obj);
                        });
                        return array;
                    }
                }
            };
        }
    ]
);
