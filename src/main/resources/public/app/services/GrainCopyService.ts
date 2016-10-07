interface IGrainCopyService {
    persist(grainCopy:IGrainCopy, subjectScheduled):ng.IPromise<IGrainCopy>;
    update(grainCopy:IGrainCopy):ng.IPromise<IGrainCopy>;
    correct(grainCopy:IGrainCopy):ng.IPromise<IGrainCopy>;
    addToCache(grainCopydRaw: any): void;
    getListBySubjectCopy(subjectCopy:ISubjectCopy):ng.IPromise<IGrainCopy[]>;
    instantiateGrainCopy(grainCopyObject:any): IGrainCopy;
    createGrainCopyList(grainScheduledList:IGrainScheduled[]):IGrainCopy[];
}

class GrainCopyService implements IGrainCopyService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedBySubjectCopyId:{[subjectCopyId:number]:IGrainCopy[]};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._listMappedBySubjectCopyId = {};
    }

    public persist = function(grainCopy:IGrainCopy, subjectScheduled):ng.IPromise<IGrainCopy> {
        var self = this,
            deferred = this._$q.defer();

        var request = {
            method: 'POST',
            url: 'exercizer/grain-copy/' + subjectScheduled.id,
            data: grainCopy
        };

        this._$http(request).then(
            function (grainCopy) {
                if (angular.isUndefined( self._listMappedBySubjectCopyId[grainCopy.subject_copy_id])) {
                    self._listMappedBySubjectCopyId[grainCopy.subject_copy_id] = [];
                }
                self._listMappedBySubjectCopyId[grainCopy.subject_copy_id].push(grainCopy);

                deferred.resolve(grainCopy);
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la création d\'un élément d\'une copie.')
            }
        );
        return deferred.promise;
    };

    private write = function(grainCopy:IGrainCopy, action:String):ng.IPromise<IGrainCopy> {
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

                if (angular.isUndefined(self._listMappedBySubjectCopyId[grainCopy.subject_copy_id])) {
                    self._listMappedBySubjectCopyId[grainCopy.subject_copy_id] = [];
                }

                var index = self._listMappedBySubjectCopyId[grainCopy.subject_copy_id].indexOf(grainCopy);
                self._listMappedBySubjectCopyId[grainCopy.subject_copy_id][index] = grainCopy;

                deferred.resolve(grainCopy);
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la mise à jour de l\'élément de la copie.')
            }
        );

        return deferred.promise;
    };

    public update = function(grainCopy:IGrainCopy):ng.IPromise<IGrainCopy> {
        return this.write(grainCopy, 'UPDATE');
    };

    public correct = function(grainCopy:IGrainCopy):ng.IPromise<IGrainCopy> {
        return this.write(grainCopy, 'CORRECT');
    };

    public addToCache = function(grainCopyRaw: any): void {
        var grainCopy = SerializationHelper.toInstance(new GrainCopy(), JSON.stringify(grainCopyRaw));

        if (angular.isUndefined(this._listMappedBySubjectCopyId[grainCopy.subject_copy_id])) {
            this._listMappedBySubjectCopyId[grainCopy.subject_copy_id] = [];
        }

        var index = this._listMappedBySubjectCopyId[grainCopy.subject_copy_id].indexOf(grainCopy);
        this._listMappedBySubjectCopyId[grainCopy.subject_copy_id][index] = grainCopy;
    };

    public getListBySubjectCopy = function(subjectCopy:ISubjectCopy):ng.IPromise<IGrainCopy[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/grains-copy',
                data: subjectCopy
            };

        if (!angular.isUndefined(this._listMappedBySubjectCopyId[subjectCopy.id])) {
            deferred.resolve(this._listMappedBySubjectCopyId[subjectCopy.id]);
        } else {
            this._listMappedBySubjectCopyId[subjectCopy.id] = [];
            this._$http(request).then(
                function (response) {
                    angular.forEach(response.data, function (grainCopyObject) {
                        self._listMappedBySubjectCopyId[subjectCopy.id].push(self.instantiateGrainCopy(grainCopyObject));
                    });
                    deferred.resolve(self._listMappedBySubjectCopyId[subjectCopy.id]);
                },
                function () {
                    deferred.reject('Une erreur est survenue lors de la récupération des éléments de la copie.');
                }
            );
        }
        
        return deferred.promise;
    };
    
    public instantiateGrainCopy = function (grainCopyObject:any):IGrainCopy {
        var grainCopy = SerializationHelper.toInstance(new GrainCopy(), JSON.stringify(grainCopyObject));
        grainCopy.grain_copy_data = SerializationHelper.toInstance(new GrainCopyData(), grainCopyObject.grain_copy_data);
        return grainCopy;
    };

    public createGrainCopyList = function(grainScheduledList:IGrainScheduled[]):IGrainCopy[] {
        var grainCopyList = [],
            self = this;

        angular.forEach(grainScheduledList, function(grainScheduled:IGrainScheduled) {
            grainCopyList.push(self.createFromGrainScheduled(grainScheduled));
        });

        return grainCopyList;
    };

    public createFromGrainScheduled = function(grainScheduled:IGrainScheduled):IGrainCopy {
        var grainCopy = new GrainCopy();

        grainCopy.grain_type_id = grainScheduled.grain_type_id;

        if (!angular.isUndefined(grainScheduled.id)) {
            grainCopy.grain_scheduled_id = grainScheduled.id;
        }

        grainCopy.order_by = grainScheduled.order_by;
        grainCopy.grain_copy_data = new GrainCopyData();
        grainCopy.grain_copy_data.title = grainScheduled.grain_data.title;
        grainCopy.grain_copy_data.max_score = grainScheduled.grain_data.max_score;
        grainCopy.grain_copy_data.statement = grainScheduled.grain_data.statement;
        grainCopy.grain_copy_data.document_list = grainScheduled.grain_data.document_list;
        grainCopy.grain_copy_data.answer_hint = grainScheduled.grain_data.answer_hint;
        grainCopy.grain_copy_data.document_list = grainScheduled.grain_data.document_list;
      
        switch (grainScheduled.grain_type_id) {
            case 3:
                grainCopy.grain_copy_data.custom_copy_data = new StatementCustomCopyData(grainScheduled.grain_data.custom_data);
                break;
            case 4:
                grainCopy.grain_copy_data.custom_copy_data = new SimpleAnswerCustomCopyData();
                break;
            case 5:
                grainCopy.grain_copy_data.custom_copy_data = new OpenAnswerCustomCopyData();
                break;
            case 6:
                grainCopy.grain_copy_data.custom_copy_data = new MultipleAnswerCustomCopyData();
                if(grainScheduled.grain_data && grainScheduled.grain_data.custom_data){
                    angular.forEach(grainScheduled.grain_data.custom_data.correct_answer_list, function(correct_answer){
                        grainCopy.grain_copy_data.custom_copy_data.filled_answer_list.push({text : ""})
                    });
                }

                break;
            case 7:
                // QCM
                grainCopy.grain_copy_data.custom_copy_data = new QcmCustomCopyData();
                if(grainScheduled.grain_data && grainScheduled.grain_data.custom_data) {
                    angular.forEach(grainScheduled.grain_data.custom_data.correct_answer_list, function (correct_answer) {
                        grainCopy.grain_copy_data.custom_copy_data.filled_answer_list.push({text: correct_answer.text})
                    });
                }
                break;
            case 8:
                // Association
                grainCopy.grain_copy_data.custom_copy_data = new AssociationCustomCopyData();
                grainCopy.grain_copy_data.custom_copy_data.show_left_column = grainScheduled.grain_data.custom_data.show_left_column;
                if(grainScheduled.grain_data && grainScheduled.grain_data.custom_data) {
                    if (grainScheduled.grain_data.custom_data.show_left_column) {
                        angular.forEach(grainScheduled.grain_data.custom_data.correct_answer_list, function (correct_answer) {
                            grainCopy.grain_copy_data.custom_copy_data.filled_answer_list.push({
                                text_left: correct_answer.text_left,
                                text_right: null
                            })
                        });
                        var rand,
                            notSet,
                            self = this,
                            protectionCompteur;
                        angular.forEach(grainScheduled.grain_data.custom_data.correct_answer_list, function (correct_answer) {
                            notSet = true;
                            protectionCompteur = 0;
                            while (notSet) {
                                rand = self._getRandomIntInclusive(0, grainScheduled.grain_data.custom_data.correct_answer_list.length - 1);
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
                        angular.forEach(grainScheduled.grain_data.custom_data.correct_answer_list, function (correct_answer) {
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
                if(grainScheduled.grain_data && grainScheduled.grain_data.custom_data) {

                    angular.forEach(grainScheduled.grain_data.custom_data.correct_answer_list, function (correct_answer, key) {
                        notSet = true;
                        while (notSet) {
                            rand = self._getRandomIntInclusive(1, grainScheduled.grain_data.custom_data.correct_answer_list.length);
                            alreadySet = false;
                            angular.forEach(newOrder, function (value) {
                                if (value == rand) {
                                    alreadySet = true;
                                }
                            });
                            if (!alreadySet) {
                                newOrder[key] = rand;
                                notSet = false;
                            }
                        }
                    });
                    angular.forEach(grainScheduled.grain_data.custom_data.correct_answer_list, function (correct_answer, key) {
                        grainCopy.grain_copy_data.custom_copy_data.filled_answer_list.push({
                            text: correct_answer.text,
                            order_by: newOrder[key],
                            index: newOrder[key] - 1,

                        })
                    });
                }
                break;
                case 10:
                grainCopy.grain_copy_data.custom_copy_data = zonegrain.makeCopy(grainScheduled.grain_data.custom_data, filltext.CustomData);
                break;
                case 12:
                grainCopy.grain_copy_data.custom_copy_data = zonegrain.makeCopy(grainScheduled.grain_data.custom_data, zoneimage.CustomData);
                break;
                case 11:
                grainCopy.grain_copy_data.custom_copy_data = zonegrain.makeCopy(grainScheduled.grain_data.custom_data, zonetext.CustomData);
                break;
            default:
                console.error('specific part of grain copy is not defined when creating from grain scheduled', grainScheduled);

        }

        if (grainScheduled.grain_data.custom_data && grainCopy.grain_copy_data.custom_copy_data && grainCopy.grain_type_id > 5) {
            grainCopy.grain_copy_data.custom_copy_data.no_error_allowed = grainScheduled.grain_data.custom_data.no_error_allowed;
        }

        return grainCopy;
    };

    // On renvoie un entier aléatoire entre une valeur min (incluse)
    // et une valeur max (incluse).
    // Attention : si on utilisait Math.round(), on aurait une distribution
    // non uniforme !
    private _getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min +1)) + min;
    }
}
