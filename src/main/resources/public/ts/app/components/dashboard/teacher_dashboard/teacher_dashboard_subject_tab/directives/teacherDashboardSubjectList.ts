
import { ng, model, Behaviours, notify, skin } from 'entcore';
import { Subject, IGrain, Grain, GrainData } from '../../../../../models/domain';
import { _ } from 'entcore';
import { StatementCustomData } from '../../../../grain/statement/models/StatementCustomData';
import { QcmCustomData } from '../../../../grain/qcm/models/QcmCustomData';
import { AssociationCustomData } from '../../../../grain/association/models/AssociationCustomData';
import { SimpleAnswerCustomData } from '../../../../grain/simple_answer/models/SimpleAnswerCustomData';
import { MultipleAnswerCustomData } from '../../../../grain/multiple_answer/models/MultipleAnswerCustomData';
import { $ } from 'entcore';

export const teacherDashboardSubjectList = ng.directive('teacherDashboardSubjectList', ['SubjectService', 'FolderService', 'DragService', '$location','AccessService',
    (SubjectService, FolderService, DragService, $location, AccessService) => {
        return {
            restrict: 'E',
            scope: {
                subject: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-subject-list.html',
            link: (scope:any) => {

                /**
                 * INIT
                 */
                scope.displayList = 'domino';
                scope.currentFolderId = null;
                scope.autocomplete = {
                    subjectList: null
                };
                scope.data = {};

                scope.isImportDisplayed = false;
                scope.fileImportName = '';
                scope.importSubject = new Subject();
                scope.stateImport = 'import';
                scope.grainImportCount = 0;

                scope.$on('E_RESET_SELECT_ALL', function (event) {
                    scope.data.selectAll = false;
                });


                /**
                 * AUTOCOMPLETE
                 */

                scope.clickOnAutoComplete = function () {
                    if (scope.subjectList()) {
                        scope.autocomplete.subjectList = createListAutoComplete();
                    }
                };

                scope.clickOnItem = function(subjectFromAutoComplete){
                    var subject = SubjectService.getById(subjectFromAutoComplete.id);
                    scope.$emit('E_RESET_SELECTED_LIST', subject);
                    subject.selected = true;
                    scope.$emit('E_SELECT_SUBJECT', subject);
                    scope.currentFolderId =  subject.folder_id || null;

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

                /**
                 * GETTER
                 */


                scope.amITheAuthor = function(subject){
                    return model.me.hasRight(subject, 'owner');
                };

                scope.subjectList = function () {
                    return SubjectService.getList();
                };

                scope.folderList = function () {
                    return FolderService.getList();
                };

                scope.canManageFolder = function (fodler) {
                    return true;
                };
                scope.canManageSubject = function (subject) {
                    return true;
                };

                scope.getSubjectPicture = function (subject) {
                    var defaultPicture = skin.basePath + 'img/illustrations/image-default.svg';
                    return subject.picture || defaultPicture;
                };

                /**
                 * EVENT
                 */

                scope.clickOnFolderTitle = function (folder) {
                    scope.data.selectAll = false;
                    scope.setCurrentFolder(folder);
                };

                scope.canAccessSubject = function(subject){
                    if(model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.manager) || model.me.hasRight(subject, 'owner')){
                        return true;
                    } else{
                        return false;
                    }
                };

                scope.setCurrentFolder = function (folder) {
                    scope.$emit('E_RESET_SELECTED_LIST');
                    scope.display.tab = 'mySubject';
                    scope.currentFolderId = folder.id;
                };

                scope.clickOnSubjectTitle = function (subject) {
                    if (subject.id) {
                        if ('simple' === subject.type) {
                            $location.path('/subject/edit/simple/' + subject.id);
                        } else {
                            if (model.me.hasRight(subject, 'owner')) {
                                $location.path('/subject/edit/' + subject.id);
                            } else if (model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.manager)) {
                                $location.path('/subject/edit/' + subject.id);
                            } else if (model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.contrib)) {
                                $location.path('/subject/edit/' + subject.id);
                            } else {
                                AccessService.reader = true;
                                $location.path('/subject/copy/preview/perform/' + subject.id);
                            }
                        }
                    }
                };
                scope.viewPreview = function (subject) {
                    if (subject.id) {
                        $location.path('/subject/copy/preview/perform/' + subject.id);
                    }
                };

                scope.selectFolder = function (folder) {
                    folder.selected = folder.selected ? true : false;
                    scope.$emit('E_SELECT_FOLDER', folder);
                };
                
                scope.selectSubject = function (subject) {
                    subject.selected = subject.selected ? true : false;
                    scope.$emit('E_SELECT_SUBJECT', subject);

                };

                scope.clickCreateFolder = function () {
                    scope.$emit('E_CREATE_FOLDER');
                };

                scope.addNewSubject = function(currentFolderId) {
                    scope.$emit('E_ADD_NEW_SUBJECT', currentFolderId);
                };

                scope.importNewSubject = function() {
                    scope.importSubject = new Subject();
                    scope.isImportDisplayed = true;
                };

                scope.setFilesName = function(event) {
                    scope.fileImportName = '';
                    scope.newFiles = event.newFiles;

                    if (scope.newFiles.length > 0) {
                        var file = scope.newFiles[0];
                        scope.fileImportName = file.name;
                    }
                };

                scope.saveImportSubject = function() {
                    if (!scope.importSubject.title || scope.importSubject.title.length === 0) {
                        notify.error('exercizer.check.title');
                    } else if (!scope.fileImportName || scope.fileImportName.length === 0) {
                        notify.error('exercizer.import.check.file');
                    } else {
                        scope.importSubject.folder_id = scope.currentFolderId;

                        var reader:FileReader = new FileReader();

                        reader.onloadend = function (e) {
                            var xml = reader.result;
                            var xmlDocument = null;
                            try {
                                xmlDocument = $.parseXML(xml);
                            } catch(e) {
                                notify.error('exercizer.import.xml.error');
                                return;
                            }

                            var $xml = $(xmlDocument);

                            var order = 1;
                            var grains:IGrain[] = [];
                            var mapImg = {};

                            var questionsXml = $.makeArray($xml.find('question'));
                            _.forEach(questionsXml, function (question) {
                                var grain = new Grain();
                                grain.grain_data = new GrainData();
                                var grainTypeTdBase = $(question).attr('type');
                                var title = $(question).find('name text').text();
                                grain.grain_data.title = title;

                                var statement:any = $(question).find('questiontext text').text();
                                if (statement && statement.length > 0) {
                                    statement = '<div>' + statement + '</div>';
                                }

                                var answerExplanation:any = $(question).find('generalfeedback text');
                                if (answerExplanation && answerExplanation.length > 0) {
                                    answerExplanation = answerExplanation.html(answerExplanation.text()).text();
                                    grain.grain_data.answer_explanation = answerExplanation;
                                }

                                grain.order_by = order;
                                order++;

                                if (!('description' === grainTypeTdBase)) {
                                    grain.grain_data.statement = statement;
                                }

                                var imgB64 = $(question).find('image_base64').text();
                                if (imgB64 && imgB64.length > 0) {
                                    var arrayBuff = _base64ToArrayBuffer(imgB64);

                                    var fileNameImg = $(question).find('image').text();
                                    if (fileNameImg) {
                                        var res = fileNameImg.split("/",2);
                                        if (res.length === 2) {
                                            var fileName = res[1];
                                            var extFile = fileName.split(".",2);
                                            if (extFile.length === 2) {
                                                var blob = new Blob([arrayBuff], {type: "image/" + extFile[1]});
                                                mapImg[grain.order_by] = {blob: blob, name: fileName};
                                            }
                                        }
                                    }
                                }
                                
                                switch (grainTypeTdBase) {
                                    case 'description':
                                        //statement
                                        grain.grain_type_id = 3;
                                        var statementCustomData = new StatementCustomData();
                                        statementCustomData.statement = statement;
                                        grain.grain_data.custom_data = statementCustomData;
                                        break;
                                    case 'shortanswer':
                                        //Warn : two grain type can match
                                        fillSimpleOrMultipleAnswer(grain, question);
                                        break;
                                    case 'numerical':
                                        fillSimpleOrMultipleAnswer(grain, question);
                                        break;
                                    case 'essay':
                                        // open answer
                                        grain.grain_type_id = 5;
                                        grain.grain_data.max_score = 1;
                                        break;
                                    case 'multichoice':
                                        //qcm, no information about error allowed, false by default
                                        grain.grain_type_id = 7;
                                        var qcmCustomData = new QcmCustomData();
                                        qcmCustomData.no_error_allowed = false;

                                        var countCorrect = 0;
                                        var answers = $.makeArray($(question).find('answer'));
                                        _.forEach(answers, function (answer) {
                                            var isCorrect = Number($(answer).attr('fraction')) > 0;
                                            if (isCorrect) {
                                                countCorrect++;
                                            }

                                            var textAnswer = $(answer).find('text').text();
                                            qcmCustomData.correct_answer_list.push({
                                                text: textAnswer,
                                                isChecked: isCorrect
                                            });
                                        });
                                        grain.grain_data.max_score = countCorrect;
                                        grain.grain_data.custom_data = qcmCustomData;
                                        break;
                                    case 'matching':
                                        grain.grain_type_id = 8;
                                        var customData = new AssociationCustomData();
                                        // no information about showing left column and error allowed, false by default
                                        customData.show_left_column = false;
                                        customData.no_error_allowed = false;
                                        var countCorrect = 0;
                                        var subQuestions = $.makeArray($(question).find('subquestion'));
                                        _.forEach(subQuestions, function (subQuestion) {
                                            countCorrect++;
                                            var textLeft = $(subQuestion).find('text:first').text();
                                            var textRight = $(subQuestion).find('answer text').text();
                                            customData.correct_answer_list.push({
                                                text_left: textLeft,
                                                text_right: textRight
                                            });
                                        });
                                        grain.grain_data.max_score = countCorrect;
                                        grain.grain_data.custom_data = customData;
                                        break;
                                }

                                if (grain.grain_type_id) {
                                    grains.push(grain);
                                }

                            });
                            
                            if (grains.length === 0) {
                                notify.error('exercizer.import.xml.empty');
                            } else {
                                var countCallBackWorkspace = _.size(mapImg);

                                if (countCallBackWorkspace > 0) {
                                    var currentCall = 0;
                                    _.forEach(mapImg, function (elem) {
                                        SubjectService.importImage(elem.blob, elem.name).then(function (id) {
                                            //console.log(id);
                                            currentCall++;
                                            elem.link = "<div></div><div><img src=\"/workspace/document/" + id + "\" draggable=\"\" native=\"\"><div><div></div>";

                                            if (currentCall == countCallBackWorkspace) {
                                                persistImportSubject(grains, mapImg);
                                            }
                                        }, function (err) {
                                            currentCall++;
                                            elem.link = "";
                                            if (currentCall == countCallBackWorkspace) {
                                                persistImportSubject(grains, mapImg);
                                            }
                                        });
                                    });
                                } else {
                                    persistImportSubject(grains, undefined);
                                }
                            }
                        };

                        reader.readAsText(scope.newFiles[0]);
                    }
                };

                function persistImportSubject(grains, mapImg) {
                    if (mapImg) {
                        _.forEach(grains, function (grain) {
                            if (mapImg[grain.order_by]) {
                                if (grain.grain_data.custom_data.statement) {
                                    grain.grain_data.custom_data.statement = mapImg[grain.order_by].link + grain.grain_data.custom_data.statement;
                                } else {
                                    grain.grain_data.statement = mapImg[grain.order_by].link + grain.grain_data.statement;
                                }
                            }
                        });
                    }
                    SubjectService.importSubject(scope.importSubject, grains).then(function (subject) {
                        SubjectService.currentSubjectId = subject.id;
                        scope.stateImport = 'result';
                        scope.grainImportCount = grains.length;
                    }, function (err) {
                        notify.error(err);
                    });
                };


                function _base64ToArrayBuffer(base64) {
                    var binaryString =  window.atob(base64);
                    var len = binaryString.length;
                    var bytes = new Uint8Array( len );
                    for (var i = 0; i < len; i++)        {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    return bytes.buffer;
                };

                function fillSimpleOrMultipleAnswer(grain, question) {
                    var answers = $.makeArray($(question).find('answer text'));
                    if (answers.length === 1) {
                        grain.grain_type_id= 4;
                        grain.grain_data.max_score = 1;
                        let customData = new SimpleAnswerCustomData($(answers[0]).text());
                        grain.grain_data.custom_data = customData;
                    } else {
                        grain.grain_type_id= 6;
                        grain.grain_data.max_score = answers.length;
                        let customData = new MultipleAnswerCustomData();
                        customData.no_error_allowed = false;
                        _.forEach(answers, function (answer) {
                            customData.correct_answer_list.push({text: $(answer).text()});
                        });
                        grain.grain_data.custom_data = customData;
                    }
                };

                scope.goToSubjectAfterImport = function() {
                    scope.closeImportLightbox();
                    $location.path('/subject/edit/' + SubjectService.currentSubjectId);
                };

                scope.closeImportLightbox = function() {
                    scope.isImportDisplayed = false;
                    scope.stateImport = 'import';
                    scope.grainImportCount = 0;
                    scope.fileImportName = '';
                };

                scope.goToRoot = function () {
                    scope.$emit('E_RESET_SELECTED_LIST');
                    scope.currentFolderId = null;
                };

                scope.selectAllFn = function(selectAll){
                    angular.forEach(scope.folderList(), function(folder){
                        if(isSelectableFolder(folder)){
                            folder.selected = selectAll ? true : false;
                            scope.$emit('E_SELECT_FOLDER', folder);
                        }
                    });
                    angular.forEach(scope.subjectList(), function(subject){
                        if(isSelectableSubject(subject)){
                            subject.selected = selectAll ? true : false;
                            scope.$emit('E_SELECT_SUBJECT', subject);
                        }
                    });
                };

                function isSelectableFolder(folder){
                    var parent_id;
                    if(scope.currentFolderId){
                        parent_id =  folder.parent_folder_id == scope.currentFolderId
                    } else{
                        parent_id =  folder.parent_folder_id == null;
                    }
                    return parent_id && scope.display.tab  === 'mySubject'
                }

                function isSelectableSubject(subject){
                    var parent_id;
                    var owner;
                    if(scope.display.tab == 'subjectShared'){
                        parent_id =  true;
                    } else{
                        if(scope.currentFolderId){
                            parent_id =  subject.folder_id == scope.currentFolderId
                        } else{
                            parent_id =  subject.folder_id == null;
                        }
                    }
                    //
                    if(model.me.hasRight(subject, 'owner') && scope.display.tab == 'mySubject'){
                        owner =  true
                    } else if(!model.me.hasRight(subject, 'owner') && scope.display.tab == 'subjectShared') {
                        owner =  true

                    } else{
                        owner =  false;
                    }
                    return parent_id && owner;
                }


                /**
                 * FILTER
                 */

                scope.filterFolderByParentFolderId = function () {
                    return function (folder) {
                        if(scope.currentFolderId){
                            return folder.parent_folder_id == scope.currentFolderId
                        } else{
                            return folder.parent_folder_id == null;
                        }
                    };
                };

                scope.filterFolderTab = function (currentTab) {
                    return function (folder) {
                        if(currentTab  === 'mySubject'){
                            return true
                        } else{
                            return false;
                        }

                    };
                };

                scope.filterSubjectTab = function (currentTab) {
                    return function (subject) {
                        if(model.me.hasRight(subject, 'owner') && currentTab == 'mySubject'){
                            return true
                        } else if(!model.me.hasRight(subject, 'owner') && currentTab == 'subjectShared') {
                            return true

                        } else{
                            return false;
                        }
                    };
                };

                scope.filterSubjectByParentFolderId = function (currentTab) {
                    return function (subject) {
                        if(currentTab == 'subjectShared'){
                            return true;
                        } else{
                            if(scope.currentFolderId){
                                return subject.folder_id == scope.currentFolderId
                            } else{
                                return subject.folder_id == null;
                            }
                        }


                    };
                };

                /**
                 * DRAG
                 */

                scope.drag = function (item, $originalEvent) {
                    DragService.drag(item, $originalEvent);
                };

                scope.dragFolderCondition = function (item) {
                    return DragService.canDragFolderInPage(item);
                };
                scope.dragSubjectCondition = function (item) {
                    return DragService.canDragSubjectInPage(item);
                };

                scope.dropTo = function (targetItem, $originalEvent) {
                    DragService.dropTo(targetItem, $originalEvent, scope);
                };

                scope.dropFolderCondition = function (targetItem) {
                    return DragService.canDropOnFolderInPage(targetItem);

                };
                scope.dropSubjectCondition = function (targetItem) {
                    return DragService.canDropOnSubjectInPage(targetItem);
                };

                scope.dropToRoot = function ($originalEvent) {
                    DragService.dropTo(null, $originalEvent, scope);
                };

                scope.openArchive = function () {
                    $location.path('/dashboard/teacher/archive');
                }
            }
        };
    }]
);
