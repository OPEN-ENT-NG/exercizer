import { ng } from 'entcore';
import { SerializationHelper } from '../models/helpers';
import { IGrain, IGrainCopy, GrainCopy, IGrainScheduled, GrainCopyData, IGrainCustomCopy, GrainCustomCopy, ISubjectCopy } from '../models/domain';
import { StatementCustomCopyData } from '../components/grain/statement/models/StatementCustomCopyData';
import { SimpleAnswerCustomCopyData } from '../components/grain/simple_answer/models/SimpleAnswerCustomCopyData';
import { OpenAnswerCustomCopyData } from '../components/grain/open_answer/models/OpenAnswerCustomCopyData';
import { MultipleAnswerCustomCopyData } from '../components/grain/multiple_answer/models/MultipleAnswerCustomCopyData';
import { QcmCustomCopyData } from '../components/grain/qcm/models/QcmCustomCopyData';
import { AssociationCustomCopyData } from '../components/grain/association/models/AssociationCustomCopyData';
import { OrderCustomCopyData } from '../components/grain/order/models/OrderCustomCopyData';
import { makeZoneCustomDataCopy } from '../components/grain/common/zonegrain/model';
import { CustomData as FillTextCustomData } from '../components/grain/filltext/models/CustomData';
import { CustomData as ZoneTextCustomData } from '../components/grain/zonetext/models/CustomData';
import { CustomData as ZoneImageCustomData } from '../components/grain/zoneimage/models/CustomData';

export interface IGrainCopyService {
    persist(grainCopy:IGrainCopy, subjectScheduled):Promise<IGrainCopy>;
    update(grainCopy:IGrainCopy):Promise<IGrainCopy>;
    correct(grainCopy:IGrainCopy):Promise<IGrainCopy>;
    addToCache(grainCopydRaw: any): void;
    getListBySubjectCopy(subjectCopy:ISubjectCopy):Promise<IGrainCopy[]>;
    instantiateGrainCopy(grainCopyObject:any): IGrainCopy;
    createGrainCopyList(grainScheduledList:IGrainScheduled[]):IGrainCopy[];
    getListByNotCorrectedSubjectCopies(subjectCopyList:ISubjectCopy[], isOneShotSubmit:boolean):ISubjectCopy[];
    getById(id:number):IGrainCopy;
}

export class GrainCopyService implements IGrainCopyService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedBySubjectCopyId:{[subjectCopyId:number]:IGrainCopy[]};

    constructor
    (
        private _$q,
        private _$http
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._listMappedBySubjectCopyId = {};
    }

    public persist = function(grainCopy:IGrainCopy, subjectScheduled):Promise<IGrainCopy> {
        var self = this,
            deferred = this._$q.defer();

        var request = {
            method: 'POST',
            url: 'exercizer/grain-copy/' + subjectScheduled.id,
            data: grainCopy
        };

        this._$http(request).then(
            function (grainCopy) {
                if (!self._listMappedBySubjectCopyId[grainCopy.subject_copy_id]) {
                    self._listMappedBySubjectCopyId[grainCopy.subject_copy_id] = [];
                }
                self._listMappedBySubjectCopyId[grainCopy.subject_copy_id].push(grainCopy);

                deferred.resolve(grainCopy);
            },
            function () {
                deferred.reject('exercizer.error')
            }
        );
        return deferred.promise;
    };

    private write = function(grainCopy:IGrainCopy, action:String):Promise<IGrainCopy> {
        var self = this,
            deferred = this._$q.defer();

        var grainCopyObject = angular.copy(grainCopy);
        grainCopyObject.grain_copy_data = JSON.stringify(grainCopyObject.grain_copy_data);

        var request = {
            method: 'PUT',
            url: 'exercizer/grain-copy' + (action === 'UPDATE' ? '' : '/correct'),
            data: grainCopyObject
        };

        this._$http(request).then(
            function (response) {
                var grainCopy = self.instantiateGrainCopy(response.data);

                if (!self._listMappedBySubjectCopyId[grainCopy.subject_copy_id]) {
                    self._listMappedBySubjectCopyId[grainCopy.subject_copy_id] = [];
                }

                var index = self._listMappedBySubjectCopyId[grainCopy.subject_copy_id].indexOf(grainCopy);
                self._listMappedBySubjectCopyId[grainCopy.subject_copy_id][index] = grainCopy;

                deferred.resolve(grainCopy);
            },
            function () {
                deferred.reject('exercizer.error')
            }
        );

        return deferred.promise;
    };

    public update = function(grainCopy:IGrainCopy):Promise<IGrainCopy> {
        return this.write(grainCopy, 'UPDATE');
    };

    public correct = function(grainCopy:IGrainCopy):Promise<IGrainCopy> {
        return this.write(grainCopy, 'CORRECT');
    };

    public addToCache = function(grainCopyRaw: any): void {
        var grainCopy = SerializationHelper.toInstance(new GrainCopy(), JSON.stringify(grainCopyRaw));

        if (!this._listMappedBySubjectCopyId[grainCopy.subject_copy_id]) {
            this._listMappedBySubjectCopyId[grainCopy.subject_copy_id] = [];
        }

        var index = this._listMappedBySubjectCopyId[grainCopy.subject_copy_id].indexOf(grainCopy);
        this._listMappedBySubjectCopyId[grainCopy.subject_copy_id][index] = grainCopy;
    };

    public getListBySubjectCopy = function(subjectCopy:ISubjectCopy, force:boolean=false):Promise<IGrainCopy[]> {
        var self = this,
            deferred = this._$q.defer();
        subjectCopy.offset = new Date().getTimezoneOffset();
        var request = {
                method: 'POST',
                url: 'exercizer/grains-copy',
                data: subjectCopy
            };

        if (this._listMappedBySubjectCopyId[subjectCopy.id] && !force) {
            deferred.resolve(this._listMappedBySubjectCopyId[subjectCopy.id]);
        } else {
            this._listMappedBySubjectCopyId[subjectCopy.id] = [];
            this._$http(request).then(
                function (response) {
                    response.data.forEach(function (grainCopyObject) {
                        self._listMappedBySubjectCopyId[subjectCopy.id].push(self.instantiateGrainCopy(grainCopyObject));
                    });
                    self._listMappedBySubjectCopyId[subjectCopy.id].sort((a:IGrainCopy, b:IGrainCopy) => {
                        if (a.display_order && b.display_order) {
                            return a.display_order - b.display_order;
                        }
                        return a.order_by - b.order_by;
                    });
                    deferred.resolve(self._listMappedBySubjectCopyId[subjectCopy.id]);
                },
                function () {
                    deferred.reject('exercizer.error');
                }
            );
        }
        
        return deferred.promise;
    };

    public getListBySubjectCopies = function(subjectCopies:ISubjectCopy[]):Promise<{[subjectCopyId:number]:IGrainCopy[]}> {
        var copyIds = [];
        var self = this, deferred = this._$q.defer();
        var listMapped: {[subjectCopyId:number]:IGrainCopy[]} ={};
        subjectCopies.forEach( copy => {
            if(!this._listMappedBySubjectCopyId[copy.id]) {
                copyIds.push(copy.id)
                this._listMappedBySubjectCopyId[copy.id] = [];
            }
            listMapped[copy.id] = this._listMappedBySubjectCopyId[copy.id];
        });

        if(copyIds.length < 1)
            deferred.resolve(listMapped);
        else {
            var request = {
                method: 'POST',
                url: 'exercizer/grains-copy-by-subjects',
                data: {"ids": copyIds}
            };

            this._$http(request).then(
                function (response) {
                    response.data.forEach(function (grainCopyObject) {
                        self._listMappedBySubjectCopyId[grainCopyObject.subject_copy_id].push(self.instantiateGrainCopy(grainCopyObject));
                    });
                    copyIds.forEach(id => {
                        listMapped[id] = self._listMappedBySubjectCopyId[id];
                    })
                    deferred.resolve(listMapped);
                },
                function () {
                    deferred.reject('exercizer.error');
                }
            );
        }
        return deferred.promise;
    };

    public getById = function(id:number):IGrainCopy {
        return this._listMappedBySubjectCopyId[id];
    };
    //Return only copies with no score and submitted 
    public getListByNotCorrectedSubjectCopies = function (subjectCopyList:ISubjectCopy[], isOneShotSubmit:boolean):ISubjectCopy[]{
        let notCorrectedAlreadySubmitted:ISubjectCopy[] =  [];
      
        angular.forEach(subjectCopyList, function (subjectCopy) {
            if (subjectCopy.calculated_score === null && subjectCopy.submitted_date != null && isOneShotSubmit) {
               notCorrectedAlreadySubmitted.push(subjectCopy);
            } else if (subjectCopy.submitted_date != null && !isOneShotSubmit && !subjectCopy.is_correction_on_going && !subjectCopy.is_corrected) {
                notCorrectedAlreadySubmitted.push(subjectCopy);
            }
        });

       return notCorrectedAlreadySubmitted;       
    };
    
    public instantiateGrainCopy = function (grainCopyObject:any):IGrainCopy {
        var grainCopy = SerializationHelper.toInstance(new GrainCopy(), JSON.stringify(grainCopyObject));
        if (grainCopyObject.grain_copy_data) {
            grainCopy.grain_copy_data = SerializationHelper.toInstance(new GrainCopyData(), grainCopyObject.grain_copy_data);
            //hack for grain statement : custom_data contains title and description
            if (grainCopy.grain_copy_data.custom_data) {
                grainCopy.grain_copy_data.custom_copy_data = new StatementCustomCopyData();
                //title is set in custom_data if only a statement is entered else grain_copy_data.title is used
                if (grainCopy.grain_copy_data.custom_data.title) {
                    grainCopy.grain_copy_data.title = grainCopy.grain_copy_data.custom_data.title;
                }
                grainCopy.grain_copy_data.custom_copy_data.statement = grainCopy.grain_copy_data.custom_data.statement;
            }
        }

        return grainCopy;
    };

    public createGrainCopyList = function(grainScheduledList:IGrainScheduled[]):IGrainCopy[] {
        var grainCopyList = [],
            self = this;

        grainScheduledList.forEach(function(grainScheduled:IGrainScheduled) {
            grainCopyList.push(self.createFromGrainScheduled(grainScheduled));
        });

        return grainCopyList;
    };

    public createFromGrainScheduled = function(grainScheduled:IGrainScheduled):IGrainCopy {
        var grainCopy = new GrainCopy();

        grainCopy.grain_type_id = grainScheduled.grain_type_id;

        if (grainScheduled.id) {
            grainCopy.grain_scheduled_id = grainScheduled.id;
        }

        grainCopy.order_by = grainScheduled.order_by;
        grainCopy.grain_copy_data = new GrainCopyData();
        grainCopy.grain_copy_data.title = grainScheduled.grain_data.title;
        grainCopy.grain_copy_data.max_score = grainScheduled.grain_data.max_score;
        grainCopy.grain_copy_data.statement = grainScheduled.grain_data.statement;
        grainCopy.grain_copy_data.document_list = grainScheduled.grain_data.document_list;
        grainCopy.grain_copy_data.answer_hint = grainScheduled.grain_data.answer_hint;

        this.generateCustomCopyData(grainScheduled, grainCopy);

        return grainCopy;
    };

    public createGrainCopyCustomList = function(grainList:IGrain[]):IGrainCustomCopy[] {
        var grainCopyList = [],
            self = this;

        grainList.forEach(function(grain:IGrain) {
            if (grain.grain_type_id > 3) {
                grainCopyList.push(self.createFromGrain(grain));
            }
        });

        return grainCopyList;
    };

    public createFromGrain = function(grain:IGrain):IGrainCustomCopy {
        var grainCopy = new GrainCustomCopy();

        grainCopy.grain_id = grain.id;

        grainCopy.grain_copy_data = new GrainCopyData();
        grainCopy.grain_copy_data.title = grain.grain_data.title;
        grainCopy.grain_copy_data.max_score = grain.grain_data.max_score;
        grainCopy.grain_copy_data.statement = grain.grain_data.statement;
        grainCopy.grain_copy_data.document_list = grain.grain_data.document_list;
        grainCopy.grain_copy_data.answer_hint = grain.grain_data.answer_hint;

        this.generateCustomCopyData(grain, grainCopy);

        return grainCopy;
    };

    private generateCustomCopyData(grain:any, grainCopy:any) {
        switch (grain.grain_type_id) {
            case 3:
                grainCopy.grain_copy_data.custom_copy_data = new StatementCustomCopyData(grain.grain_data.custom_data);
                break;
            case 4:
                grainCopy.grain_copy_data.custom_copy_data = new SimpleAnswerCustomCopyData();
                break;
            case 5:
                grainCopy.grain_copy_data.custom_copy_data = new OpenAnswerCustomCopyData();
                break;
            case 6:
                grainCopy.grain_copy_data.custom_copy_data = new MultipleAnswerCustomCopyData();
                if (grain.grain_data && grain.grain_data.custom_data) {
                    angular.forEach(grain.grain_data.custom_data.correct_answer_list, function (correct_answer) {
                        grainCopy.grain_copy_data.custom_copy_data.filled_answer_list.push({text: ""})
                    });
                }

                break;
            case 7:
                // QCM
                grainCopy.grain_copy_data.custom_copy_data = new QcmCustomCopyData();
                if (grain.grain_data && grain.grain_data.custom_data) {
                    angular.forEach(grain.grain_data.custom_data.correct_answer_list, function (correct_answer) {
                        grainCopy.grain_copy_data.custom_copy_data.filled_answer_list.push({text: correct_answer.text})
                    });
                }
                break;
            case 8:
                // Association
                grainCopy.grain_copy_data.custom_copy_data = new AssociationCustomCopyData();
                grainCopy.grain_copy_data.custom_copy_data.show_left_column = grain.grain_data.custom_data.show_left_column;
                if (grain.grain_data && grain.grain_data.custom_data) {
                    if (grain.grain_data.custom_data.show_left_column) {
                        angular.forEach(grain.grain_data.custom_data.correct_answer_list, function (correct_answer) {
                            grainCopy.grain_copy_data.custom_copy_data.filled_answer_list.push({
                                text_left: correct_answer.text_left,
                                text_right: null
                            })
                        });
                        var rand,
                            notSet,
                            self = this,
                            protectionCompteur;
                        angular.forEach(grain.grain_data.custom_data.correct_answer_list, function (correct_answer) {
                            notSet = true;
                            protectionCompteur = 0;
                            while (notSet) {
                                rand = self._getRandomIntInclusive(0, grain.grain_data.custom_data.correct_answer_list.length - 1);
                                if (grainCopy.grain_copy_data.custom_copy_data.possible_answer_list[rand]) {
                                    // one more loop
                                } else {
                                    grainCopy.grain_copy_data.custom_copy_data.possible_answer_list[rand] = {
                                        text_right: correct_answer.text_right
                                    };
                                    notSet = false;
                                }
                                if (protectionCompteur > 100) {
                                    console.error(grainCopy.grain_copy_data.custom_copy_data);
                                    throw "infiny loop"
                                } else {
                                    protectionCompteur++;
                                }
                            }
                        });
                    } else {
                        grainCopy.grain_copy_data.custom_copy_data.all_possible_answer = [];
                        angular.forEach(grain.grain_data.custom_data.correct_answer_list, function (correct_answer) {
                            grainCopy.grain_copy_data.custom_copy_data.filled_answer_list.push({
                                text_left: null,
                                text_right: null
                            });
                            grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.push({
                                item: correct_answer.text_left,
                                rank: 0.5 - Math.random()
                            });
                            grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.push({
                                item: correct_answer.text_right,
                                rank: 0.5 - Math.random()
                            });
                        });
                    }
                }

                break;
            case 9:
                // Order by
                grainCopy.grain_copy_data.custom_copy_data = new OrderCustomCopyData();
                var newOrder = [],
                    rand,
                    notSet,
                    alreadySet,
                    self = this;
                if (grain.grain_data && grain.grain_data.custom_data) {
                    var correctSize = grain.grain_data.custom_data.correct_answer_list.length;

                    angular.forEach(grain.grain_data.custom_data.correct_answer_list, function (correct_answer, key) {
                        notSet = true;
                        while (notSet) {
                            var currentOrder = correct_answer.order_by;
                            rand = self._getRandomIntInclusive(1, grain.grain_data.custom_data.correct_answer_list.length, currentOrder);
                            alreadySet = false;
                            angular.forEach(newOrder, function (value) {
                                if (value == rand) {
                                    alreadySet = true;
                                }
                            });

                            //avoid infinite loop : the last order can be randomly the same as the origin
                            if (alreadySet && newOrder.length == (correctSize - 1)) {
                                var noMoreChoice = true;
                                angular.forEach(newOrder, function (value) {
                                    if (value == currentOrder) {
                                        noMoreChoice = false;
                                    }
                                });

                                //permutation
                                if (noMoreChoice) {
                                    notSet = false;
                                    newOrder[key] = newOrder[key-1];
                                    newOrder[key-1] = currentOrder;
                                }
                            }

                            if (!alreadySet) {
                                newOrder[key] = rand;
                                notSet = false;
                            }
                        }
                    });
                    angular.forEach(grain.grain_data.custom_data.correct_answer_list, function (correct_answer, key) {
                        grainCopy.grain_copy_data.custom_copy_data.filled_answer_list.push({
                            text: correct_answer.text,
                            order_by: newOrder[key],
                            index: newOrder[key] - 1,

                        })
                    });
                }
                break;
            case 10:
                grainCopy.grain_copy_data.custom_copy_data = makeZoneCustomDataCopy(grain.grain_data.custom_data, FillTextCustomData);
                break;
            case 12:
                grainCopy.grain_copy_data.custom_copy_data = makeZoneCustomDataCopy(grain.grain_data.custom_data, ZoneImageCustomData);
                break;
            case 11:
                grainCopy.grain_copy_data.custom_copy_data = makeZoneCustomDataCopy(grain.grain_data.custom_data, ZoneTextCustomData);
                break;
            default:
                console.error('specific part of grain copy is not defined when creating from grain scheduled', grain);

        }

        if (grain.grain_data.custom_data && grainCopy.grain_copy_data.custom_copy_data && grain.grain_type_id > 5) {
            grainCopy.grain_copy_data.custom_copy_data.no_error_allowed = grain.grain_data.custom_data.no_error_allowed;
        }
    };

    // On renvoie un entier aléatoire entre une valeur min (incluse)
    // et une valeur max (incluse).
    // Attention : si on utilisait Math.round(), on aurait une distribution
    // non uniforme !
    private _getRandomIntInclusive(min, max, responseValue=-1) {
        var newValue = responseValue;
        while (newValue == responseValue) {
            newValue = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return newValue;
    }
}

export const grainCopyService = ng.service('GrainCopyService', GrainCopyService);