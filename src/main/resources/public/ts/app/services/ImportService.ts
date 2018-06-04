import { ng, idiom, _, $} from 'entcore';
import { ISubject, IGrain, Grain, GrainData } from '../models/domain';
import { StatementCustomData } from '../components/grain/statement/models/StatementCustomData';
import { QcmCustomData } from '../components/grain/qcm/models/QcmCustomData';
import { AssociationCustomData } from '../components/grain/association/models/AssociationCustomData';
import { SimpleAnswerCustomData } from '../components/grain/simple_answer/models/SimpleAnswerCustomData';
import { MultipleAnswerCustomData } from '../components/grain/multiple_answer/models/MultipleAnswerCustomData';
import { CustomData, IconZone } from '../components/grain/zoneimage/models/CustomData';
import { CustomData as FillTextCustomData, TextZone } from '../components/grain/filltext/models/CustomData';

export interface IImportService {
    importFile(file, importSubject:ISubject): Promise<any>;
}

export class ImportService implements IImportService {

    static $inject = [
        '$q',
        'SubjectService',
    ];

    constructor(
        private _$q,
        private _subjectService

    ) {
        this._$q = _$q;
        this._subjectService = _subjectService;
    }

    public importFile(file, importSubject:ISubject): Promise<any> {

        var reader:FileReader = new FileReader();

        return new Promise((resolve, reject) => {

            reader.onloadend = e => {
                var xml = reader.result;
                var xmlDocument = null;
                try {
                    xmlDocument = $.parseXML(xml);
                } catch (e) {
                    reject('exercizer.import.xml.error');
                }


                var $xml = $(xmlDocument);

                var order = 1;
                var grains:IGrain[] = [];
                var mapGrainImg = {};
                var countCategory = 0;
                var unsupportedGrain = [];

                var questionsXml = $.makeArray($xml.find('question'));
                _.forEach(questionsXml, question => {
                    var grain = new Grain();
                    grain.grain_data = new GrainData();
                    var moodleGrainType = $(question).attr('type');

                    //continue
                    if (moodleGrainType === 'category') {
                        countCategory++;
                        return;
                    }

                    var title = $(question).find('name text').text();
                    grain.grain_data.title = title;

                    grain.order_by = order;
                    order++;

                    var statement:any = $(question).find('questiontext text').text();
                    if (statement && statement.length > 0) {
                        //replace italic
                        statement = statement.split("<i>").join("<span style=\"font-style: italic;\">");
                        statement = statement.split("</i>").join("</span>");
                        statement = '<div>' + statement + '</div>';
                    }

                    var imgs = {in_statement: {}, concat_statement: {}, drag_drop: {}};
                    mapGrainImg[grain.order_by] = imgs;

                    var imgStatement = $.makeArray($(question).find('questiontext file'));
                    _.forEach(imgStatement, (img, index) => {
                        let imgB64 = $(img).text();
                        let fileName = $(img).attr('name');

                        this.parseImage(index, imgs, imgB64, fileName, 'in_statement', $(img).attr('path'));
                    });

                    var imgB64 = $(question).find('image_base64').text();
                    if (imgB64 && imgB64.length > 0) {
                        var fileNameImg = $(question).find('image').text();
                        if (fileNameImg) {
                            var res = fileNameImg.split("/", 2);
                            if (res.length === 2) {
                                let fileName = res[1];
                                this.parseImage(0, imgs, imgB64, fileName, 'concat_statement');
                            }
                        }
                    }

                    var answerExplanation:any = $(question).find('generalfeedback text');
                    if (answerExplanation && answerExplanation.length > 0) {
                        answerExplanation = $("<div/>").html(answerExplanation.text()).text();
                        grain.grain_data.answer_explanation = answerExplanation;
                    }


                    if ('description' !== moodleGrainType && 'gapselect' !== moodleGrainType && 'ddwtos' !== moodleGrainType) {
                        grain.grain_data.statement = statement;
                    }

                    // in tdbase (not score)
                    var score = $(question).find('defaultgrade').text();
                    if (score) {
                        score = parseFloat(score).toFixed(2);
                    }

                    switch (moodleGrainType) {
                        case 'description':
                            //statement
                            this.fillDescription(grain, statement);
                            break;
                        case 'shortanswer':
                            //Warn : two grain type can match
                            this.fillSimpleOrMultipleAnswer(grain, question, score);
                            break;
                        case 'numerical':
                            this.fillSimpleOrMultipleAnswer(grain, question, score);
                            break;
                        case 'essay':
                            // open answer (Composition)
                            grain.grain_type_id = 5;
                            grain.grain_data.max_score = Number((score) ? score : 1);
                            break;
                        case 'multichoice':
                            //qcm, no information about error allowed, false by default
                            this.fillQcm(grain, question, score);
                            break;
                        case 'matching':
                            this.fillMatching(grain, question, score);
                            break;
                        case 'gapselect':
                            this.fillText(grain, question, score, statement);
                            break;
                        case 'ddwtos':
                            this.fillText(grain, question, score, statement);
                            break;
                        case 'truefalse':
                            this.fillQcm(grain, question, score);
                            break;
                        case 'ddimageortext':
                            this.fillAreaSelect(grain, question, score, imgs);
                            break;
                        default:{
                            order--;
                            unsupportedGrain.push(title);                            
                        }
                    }

                    if (grain.grain_type_id) {
                        grains.push(grain);
                    }
                });

                this.persistDocumentAndSubject(importSubject, grains, mapGrainImg).then((objectData) => {
                   objectData['count'] = grains.length + '/' + (questionsXml.length - countCategory);
                   objectData['unsupported'] = unsupportedGrain;
                   resolve(objectData);
                }, function (err) {
                    reject(err);
                });

            };

            reader.readAsText(file);
        });
    }

    private parseImage = function(num:any, imgs:any, imgB64:any, fileName:String, type:string, path:String="") {
        if (imgB64 && imgB64.length > 0) {
            var arrayBuff = this._base64ToArrayBuffer(imgB64);
            var extFile = fileName.split(".", 2);
            if (extFile.length === 2) {
                var blob = new Blob([arrayBuff], {type: "image/" + extFile[1]});
                imgs[type][num] = {blob: blob, name: fileName, type: type, path: path};
            }
        }
    };

    private persistDocumentAndSubject = function(importSubject, grains, mapGrainImg) : Promise<any> {
        var deferred = this._$q.defer();

        var countCallBackWorkspace = 0;
        if (_.size(mapGrainImg) > 0) {
            _.forEach(mapGrainImg, function (grainImg) {
                _.forEach(grainImg, function (categories) {
                    countCallBackWorkspace += _.size(categories);
                });
            });
        }

        if (countCallBackWorkspace > 0) {
            var currentCall = 0;
            _.forEach(mapGrainImg, grainImg => {
                _.forEach(grainImg, categories => {
                    _.forEach(categories, file => {
                        this._subjectService.importImage(file.blob, file.name).then(id => {
                            //console.log(id);
                            currentCall++;
                            file.link = "/workspace/document/" + id;

                            if (currentCall == countCallBackWorkspace) {
                                this.persistImportSubject(importSubject, grains, mapGrainImg).then(function (objectData) {
                                        deferred.resolve(objectData);
                                    },
                                    function (e) {
                                        deferred.reject(e);
                                    }
                                );
                            }
                        }, err => {
                            currentCall++;
                            file.link = "";
                            if (currentCall == countCallBackWorkspace) {
                                this.persistImportSubject(importSubject, grains, mapGrainImg).then(function (objectData) {
                                        deferred.resolve(objectData);
                                    },
                                    function (e) {
                                        deferred.reject(e);
                                    }
                                );
                            }
                        });
                    });
                });
            });
        } else {
            this.persistImportSubject(importSubject, grains, undefined).then(function (objectData) {
                    deferred.resolve(objectData);
                },
                function (e) {
                    deferred.reject(e);
                }
            );
        }

        return deferred.promise;
    };

    private persistImportSubject = function(importSubject, grains, mapGrainImg) : Promise<any> {
        var deferred = this._$q.defer();

        if (grains.length === 0) {
            deferred.reject('exercizer.import.xml.empty');
        } else {
            if (mapGrainImg) {
                var imgRegex = new RegExp("(?<=<img).*?(?=>)", 'g');
                _.forEach(grains, function (grain) {
                    var grainImgs = mapGrainImg[grain.order_by];
                    if (_.size(grainImgs["concat_statement"]) > 0) {
                        var oneElem = grainImgs["concat_statement"][0];
                        //one img per question
                        oneElem.link = "<div></div><div><img src=\"" + oneElem.link + "\" draggable=\"\" native=\"\"><div><div></div>";

                        if (grain.grain_data.custom_data.statement) {
                            grain.grain_data.custom_data.statement = oneElem.link + grain.grain_data.custom_data.statement;
                        } else {
                            grain.grain_data.statement = oneElem.link + grain.grain_data.statement;
                        }
                    }
                    if (_.size(grainImgs["drag_drop"]) > 0) {
                        var imgs = grainImgs["drag_drop"];
                        var firstElem = imgs[0];

                        // special case for ddimageortext type
                        var options = [];
                        grain.grain_data.custom_data._guideImage = firstElem.link;
                        _.forEach(grain.grain_data.custom_data.zones, function (iZone:IconZone) {
                            iZone.answer = imgs[iZone.answer].link;
                            options.push(iZone.answer);
                        });

                        grain.grain_data.custom_data.options = options;
                    }
                    if (_.size(grainImgs["in_statement"]) > 0) {
                        var statement = (grain.grain_data.statement) ? grain.grain_data.statement : grain.grain_data.custom_data.statement;

                        //specific case for gapselect
                        if (grain.grain_type_id === 10) {
                            statement = grain.grain_data.custom_data.htmlContent;
                        }

                        if (statement) {
                            _.forEach(grainImgs["in_statement"], function (img) {
                                statement = statement.replace(imgRegex, function (matched) {
                                    //.split(' ').join('%20'
                                    var search = '@@PLUGINFILE@@' + img.path + encodeURIComponent(img.name);
                                    var index = matched.indexOf(search);
                                    if (index > -1) {
                                        return " src=\"" + img.link + "\"/";

                                    }
                                    return matched;
                                });
                            });
                        }

                        if (grain.grain_type_id === 10) {
                            grain.grain_data.custom_data.htmlContent = statement;
                        } else if (grain.grain_data.statement) {
                            grain.grain_data.statement = statement;
                        } else {
                            grain.grain_data.custom_data.statement = statement;
                        }
                    }
                });
            }
            this._subjectService.importSubject(importSubject, grains).then(function (subject) {
                    var objectData = {subject : subject};
                    deferred.resolve(objectData);
                },
                function() {
                    deferred.reject("exercizer.error");
                }
            );
        }

        return deferred.promise;
    };

    private _base64ToArrayBuffer = function(base64) {
        var binaryString = window.atob(base64);
        var len = binaryString.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    private fillDescription = function(grain, statement) {
        grain.grain_type_id = 3;
        var statementCustomData = new StatementCustomData();
        statementCustomData.statement = statement;
        grain.grain_data.custom_data = statementCustomData;
    };

    private fillText = function(grain, question, score, statement) {
        grain.grain_type_id = 10;

        var ddwtosGrainType = $(question).attr('type') === "ddwtos";

        var fillZoneTemplate = "<fill-zone zone-id=\"@ID@\" class=\"ng-isolate-scope\"><text-zone ng-class=\"{ success: optionData.correction &amp;&amp; optionData.isCorrect, error: optionData.correction &amp;&amp; !optionData.isCorrect }\"><!-- ngIf: optionData.mode === 'edit' -->" +
            "<i class=\"close ng-scope\" ng-click=\"removeFillZone($event)\" ng-if=\"optionData.mode === 'edit'\"></i><!-- end ngIf: optionData.mode === 'edit' --><!-- ngIf: optionData.mode === 'edit' --><i class=\"edit ng-scope\" ng-if=\"optionData.mode === 'edit'\">" +
            "</i><!-- end ngIf: optionData.mode === 'edit' --><!-- ngIf: optionData.mode === 'view' --><!-- ngIf: optionData.mode === 'edit' --><input type=\"text\" disabled=\"\" placeholder=\"@answer@\" ng-if=\"optionData.mode === 'edit'\" class=\"ng-scope\">" +
            "<!-- end ngIf: optionData.mode === 'edit' --><!-- ngIf: optionData.mode === 'perform-text' --><!-- ngIf: optionData.mode === 'perform-list' --><!-- ngIf: optionData.mode === 'perform-drag' --></text-zone></fill-zone>&nbsp;</span>";

        var countCorrect = 0;
        var fillTextCustomData = new FillTextCustomData();
        var fillTextPattern = new RegExp("\\[\\[\\d+\\]\\]", 'g');
        var mapFillIdGroup = {};
        var answers = $.makeArray($(question).find((ddwtosGrainType) ? 'dragbox' : 'selectoption'));
        var generalOptions:string[] = [];

        statement = statement.replace(fillTextPattern, function (matched) {
            var fillId = Number(matched.substring(2, matched.length - 2));
            _.forEach(answers, (answer, index) => {
                var optionId = index + 1;

                if (optionId === fillId) {
                    var response = $(answer).find('text:first').text();
                    mapFillIdGroup[index] = $(answer).find('group:first').text();
                    matched = new String(fillZoneTemplate).replace('@ID@', index).replace('@answer@', response);
                    return false;
                }

            });
            return matched;
        });

        var zones:TextZone[] = [];

        _.forEach(answers, (answer, index) => {
            if (mapFillIdGroup[index]) {
                countCorrect++;
                var options:string[] = [];
                var response = $(answer).find('text:first').text();
                options.push(response);

                var groupId = mapFillIdGroup[index];
                _.forEach(answers, (answer, index2) => {
                    if (!mapFillIdGroup[index2]) {
                        if ($(answer).find('group:first').text() === groupId) {
                            options.push($(answer).find('text:first').text());
                        }
                    }
                });

                if (ddwtosGrainType) {
                    generalOptions = _.union(generalOptions, options);
                    options = [];
                }
                zones.push({answer: response, options: options, id: index});
            }
        });


        fillTextCustomData.options = generalOptions;
        fillTextCustomData.zones = zones;
        fillTextCustomData.answersType = ddwtosGrainType ? "drag" : "list";
        fillTextCustomData.htmlContent = statement;

        grain.grain_data.max_score = Number((score) ? score : countCorrect);
        grain.grain_data.custom_data = fillTextCustomData;
    };

    private fillQcm = function(grain, question, score) {
        grain.grain_type_id = 7;
        var qcmCustomData = new QcmCustomData();

        var trueFalseMoodleType = ("truefalse" === $(question).attr('type'));

        var no_error_allowed = (trueFalseMoodleType) ? "true" : $(question).find('single').text();
        qcmCustomData.no_error_allowed = (no_error_allowed && no_error_allowed === "true");

        var countCorrect = 0;
        var answers = $.makeArray($(question).find('answer'));
        _.forEach(answers, answer => {
            var isCorrect = Number($(answer).attr('fraction')) > 0;
            if (isCorrect) {
                countCorrect++;
            }

            var textAnswer = "";
            if (trueFalseMoodleType) {
                textAnswer = idiom.translate("exercizer.import.truefalse." + $(answer).find('text:first').text());
            } else {
                textAnswer = $("<div/>").html($(answer).find('text:first').text()).text();
            }

            qcmCustomData.correct_answer_list.push({
                text: textAnswer,
                isChecked: isCorrect
            });
        });
        grain.grain_data.max_score = Number((score) ? score : countCorrect);
        grain.grain_data.custom_data = qcmCustomData;
    };

    private fillMatching = function(grain, question, score) {
        grain.grain_type_id = 8;
        var assoCustomData = new AssociationCustomData();
        // no information about showing left column and error allowed, true by default
        assoCustomData.show_left_column = true;
        assoCustomData.no_error_allowed = false;
        var countCorrect = 0;
        var subQuestions = $.makeArray($(question).find('subquestion'));
        _.forEach(subQuestions, subQuestion => {
            countCorrect++;
            var textLeft = $("<div/>").html($(subQuestion).find('text:first').text()).text();
            var textRight = $("<div/>").html($(subQuestion).find('answer text').text()).text();
            assoCustomData.correct_answer_list.push({
                text_left: textLeft,
                text_right: textRight
            });
        });
        grain.grain_data.max_score = Number((score) ? score : countCorrect);
        grain.grain_data.custom_data = assoCustomData;
    };

    private fillSimpleOrMultipleAnswer = function(grain, question, score) {
        var answers = $.makeArray($(question).find('answer'));

        if (answers.length === 1) {
            grain.grain_type_id = 4;
            grain.grain_data.max_score = Number((score) ? score : 1);
            let customData = new SimpleAnswerCustomData($(answers[0]).find('text:first').text());
            grain.grain_data.custom_data = customData;
        } else {
            grain.grain_type_id = 6;

            let customData = new MultipleAnswerCustomData();
            customData.no_error_allowed = false;
            _.forEach(answers, answer => {
                if (Number($(answer).attr('fraction')) > 0) {
                    customData.correct_answer_list.push({text: $(answer).find('text:first').text()});
                }
            });

            grain.grain_data.max_score = Number((score) ? score : customData.correct_answer_list.length);
            grain.grain_data.custom_data = customData;
        }
    };

    private fillAreaSelect = function(grain, question, score, imgs) {
        grain.grain_type_id = 12;
        var customData = new CustomData();

        var countCorrect = 0;

        var fileTag = $(question).children('file');
        var guideB64 = fileTag.text();
        var guideNameImg = fileTag.attr('name');
        this.parseImage(0, imgs, guideB64, guideNameImg, 'drag_drop');

        var mapDrag = {};

        var dragElems = $.makeArray($(question).find('drag'));
        _.forEach(dragElems, dragElem => {
            var numDrag = $(dragElem).find('no').text();
            var fileDrag = $(dragElem).find('file');
            if (fileDrag && fileDrag.text().length > 0) {
                this.parseImage(Number(numDrag), imgs, fileDrag.text(), $(fileDrag).attr('name'), 'drag_drop');
            } else {
                var textDrag = $(dragElem).find('text').text();
                var canvas = document.createElement('canvas');
                var tCtx = canvas.getContext('2d');
                tCtx.canvas.width = tCtx.measureText(textDrag).width;
                tCtx.canvas.height = 20;
                tCtx.fillText(textDrag, 0, 10);
                this.parseImage(Number(numDrag), imgs, tCtx.canvas.toDataURL().replace(/^data:image\/\w+;base64,/, ""), textDrag.replace(/[^\w]/gi, '') + '.png', 'drag_drop');
            }
        });

        var dropElems = $.makeArray($(question).find('drop'));
        _.forEach(dropElems, dropElem => {
            countCorrect++;
            var choiceDrop = $(dropElem).find('choice').text();
            var xleft = $(dropElem).find('xleft').text();
            var ytop = $(dropElem).find('ytop').text();
            var numDrop = $(dropElem).find('no').text();

            var iZone:IconZone = {
                position: {
                    x: Number(xleft),
                    y: Number(ytop),
                    z: Number(numDrop)
                }, answer: choiceDrop
            };

            customData.addZone(iZone);

        });

        grain.grain_data.max_score = Number((score) ? score : countCorrect);
        grain.grain_data.custom_data = customData;
    }
}

export const importService = ng.service('ImportService', ImportService);