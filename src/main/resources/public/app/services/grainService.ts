interface IGrainService {
    createGrain(grain:IGrain, callbackSuccess, callBackFail);
    updateGrain(grain:IGrain, callbackSuccess, callbackFail)
    getGrainListBySubjectId(subject_id, callbackSuccess, callbackFail);
    createObjectGrainData() : IGrainData
    grainListBySubjectId(subject_id) : IGrain[];
    isSetGrainListBySubjectId(subject_id) : boolean;
    getGrainLabel(grain : IGrain);
}

class GrainService implements IGrainService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    private serverUrl:string;
    private $http:any;

    private _grainList:any;
    private _isSetGrainList:boolean[];

    constructor(serverUrl,
                $http) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        this._grainList = {};
        this._isSetGrainList = [];

    }


    public grainListBySubjectId(subject_id):IGrain[] {
        return this._isSetGrainList[subject_id] ? this._grainList[subject_id] : {};
    }


    public isSetGrainListBySubjectId(subject_id):boolean {
        return !!this._isSetGrainList[subject_id];
    }

    public grainByIdAndSubjectId(grain_id, subject_id) : IGrain{
        return this._grainList[subject_id][grain_id];

    }

    public createObjectGrain() :IGrain{
        return {
            id: null,
            subject_id: null,
            grain_type_id: null,
            order: null,
            original_grain_id: null,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            grain_data: this.createObjectGrainData(),
            is_library_grain: null
        }
    }

    public createObjectGrainData() : IGrainData{
        return {
            title: null,
            max_score: null,
            statement: null,
            documentList: null,
            hint: null,
            correction : null,
            custom_data: null
        };
    }

    public createGrain(grain:IGrain, callbackSuccess, callBackFail) {
        var self = this;
        this._createGrain(
            grain,
            function (data) {
                self.addGrainToGrainList(grain);
                if(!self.hasGrainOrder(grain)){
                    self.setOrderToThisGrain(grain);
                } else{
                    // this grain have order yet
                }
                console.info('createGrain', data);
                if(callbackSuccess){
                    callbackSuccess(data);
                }
            },
            function (err) {
                console.error(err);
            }
        );
    }

    private hasGrainOrder(grain : IGrain){
        return !! grain.order;
    }

    /**
     * The grain will be the last (order) of the list
     * @param grain
     */
    private setOrderToThisGrain(grain : IGrain){
        if(!this.grainListBySubjectId(grain.subject_id)){
            // not possible
           throw "List not found"
        }
        var max_order = null;
        angular.forEach(this.grainListBySubjectId(grain.subject_id), function(item_grain) {
            if(item_grain.order){
                if(item_grain.order > max_order){
                    max_order = item_grain.order;
                }
                if(item_grain.order > max_order){
                    // not possible
                    throw "Two grain have the same order"
                }
            } else{
                // not possible
                if(grain.id === item_grain.id){
                    // the params grain have not a order yet
                } else{
                    console.error(grain);
                    throw "A grain have no order"
                }
            }
        });
        var new_order : number;
        if(max_order){
            new_order = Math.ceil(parseFloat(max_order)) + 1;
        } else {
            new_order = 1;
        }
        // set
        grain.order = new_order;
    }

    public updateGrain(grain:IGrain, callbackSuccess, callbackFail) {
        this._updateGrain(
            grain,
            function (data) {
                // At this moment, the grain is already in the list
                //this.addGrainToGrainList(data);
                console.info('updateGrain', data);
                callbackSuccess(data);
            },
            callbackFail
        )
    }

    public deleteGrain(grain : IGrain, callbackSuccess, callBackFail){
        var self = this;
        this._deleteGrain(
            grain,
            function(data){
                // success
                self._removeGrainFromItsOwnList(grain);
                console.info('deleteGrain', data);
                callbackSuccess()
            },
            callBackFail
        )
    }

    private _createGrainList(subject_id){
        if(!this._grainList[subject_id]){
            this._grainList[subject_id] = {};
        }
    }

    private _removeGrainFromItsOwnList(grain : IGrain){
        delete this._grainList[grain.subject_id][grain.id];
    }

    private addGrainToGrainList(grain:IGrain) {
        if(!this._grainList[grain.subject_id]){
            var err = "Grain List missing";
            console.error(err);
            throw err;
        }
        this._grainList[grain.subject_id][grain.id] = grain;
    }

    public getGrainListBySubjectId(subject_id, callbackSuccess, callbackFail) {
        var self = this;
        if (this._isSetGrainList[subject_id]) {
            callbackSuccess(this.grainListBySubjectId(subject_id))
        } else {
            this._getGrainListBySubjectId(subject_id,
                function (data) {
                    // data is an array of grain
                    self._createGrainList(subject_id);
                    angular.forEach(data, function(grain, key) {
                        self.addGrainToGrainList(grain);
                    });
                    self._isSetGrainList[subject_id] = true;
                    if(callbackSuccess){
                        callbackSuccess(data);
                    }
                },
                callbackFail
            );
        }
    }


    public getGrainLabel(grain : IGrain){
        if(grain.grain_data.title){
            return grain.grain_data.title
        } else{
            return 'Enoncé';
        }
    }

    /**
     *  PRIVATE HTTP
     */

    private _getGrainListBySubjectId(subject_id, callbackSuccess, callbackFail) {
        /**
         * TEMP
         */
        callbackSuccess();

        /*
        var req:any;
        var self = this;
        req = this.$http({
            method: 'GET',
            url: self.serverUrl + '/grains/get',
            params: {
                "subject_id": subject_id,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA  : list of grain
                    callbackSuccess(data);
                } else {
                    callbackFail(data);
                }
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                console.error(status);
                console.error(headers);
                console.error(config);
                callbackFail(data);
            });*/
    }

    private _updateGrain(grain:IGrain, callbackSuccess, callbackFail) {
        /**
         * TEMP
         */
        grain.modified = new Date().toISOString();
        callbackSuccess(grain);
        /*
        var req:any;
        var self = this;
        req = this.$http({
            method: 'POST',
            url: self.serverUrl + '/grains/update/' + grain.id,
            params: {
                "grain": grain,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA : grain
                    callbackSuccess(data);
                } else {
                    callbackFail(data);
                }
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                console.error(status);
                console.error(headers);
                console.error(config);
                callbackFail(data);
            });
            */
    }

    private _deleteGrain(grain:IGrain, callbackSuccess, callbackFail) {
        /**
         * TEMP
         */
        callbackSuccess();
        /*
         var req:any;
         var self = this;
         req = this.$http({
         method: 'POST',
         url: self.serverUrl + '/grains/delete/' + grain.id,
         params: {
         "grain": grain,
         },
         paramSerializer: '$httpParamSerializerJQLike'
         });
         req
         .success(function (data, status, headers, config) {
         if (status == 200) {
         // DATA : grain
         callbackSuccess(data);
         } else {
         callbackFail(data);
         }
         })
         .error(function (data, status, headers, config) {
         console.error(data);
         console.error(status);
         console.error(headers);
         console.error(config);
         callbackFail(data);
         });
         */
    }

    private _createGrain(grain:IGrain, callbackSuccess, callbackFail) {
        /**
         * TEMP
         */
        grain.id = Math.floor((Math.random() * 1000) + 1);
        callbackSuccess(grain);
        /*
         var req: any;
         var self = this;
         req = this.$http({
         method: 'POST',
         url: self.serverUrl+'/grains/create/',
         params: {
         "grain": grain,
         },
         paramSerializer: '$httpParamSerializerJQLike'
         });
         req
         .success(function (data, status, headers, config) {
         if (status == 200) {
         // DATA : grain
         callbackSuccess(data);
         } else{
         callbackFail(data);
         }
         })
         .error(function (data, status, headers, config) {
         console.error(data);
         console.error(status);
         console.error(headers);
         console.error(config);
         callbackFail(data);
         });
         */
    }


}