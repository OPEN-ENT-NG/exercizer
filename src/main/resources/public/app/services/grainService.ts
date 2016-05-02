/**
 * Created by jun on 22/04/2016.
 */
interface IGrainService {
    createGrain(grain:IGrain, callbackSuccess, callBackFail);
    updateGrain(grain:IGrain, callbackSuccess, callbackFail)
    getGrainListBySubjectId(subject_id, callbackSuccess, callbackFail);
    reorderGrain(grain, array_grain);
    grainListBySubjectId(subject_id) : IGrain[];
    isSetGrainListBySubjectId(subject_id) : boolean;
}

class GrainService implements IGrainService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    private serverUrl:string;
    private $http:any;

    private _grainList:IGrain[][];
    private _isSetGrainList:boolean[];

    constructor(serverUrl,
                $http) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        this._grainList = [];
        this._isSetGrainList = [];
    }


    public grainListBySubjectId(subject_id):IGrain[] {
        return this._isSetGrainList[subject_id] ? this._grainList[subject_id] : [];
    }


    public isSetGrainListBySubjectId(subject_id):boolean {
        return !!this._isSetGrainList[subject_id];
    }

    public createGrain(grain:IGrain, callbackSuccess, callBackFail) {
        var self = this;
        this._createGrain(
            grain,
            function (data) {
                self.addGrainToGrainList(grain);
                callbackSuccess(data);
            },
            function (err) {
                console.error(err);
            }
        );
    }

    public updateGrain(grain:IGrain, callbackSuccess, callbackFail) {
        this._updateGrain(
            grain,
            function (data) {
                this.addGrainToGrainList(data);
                callbackSuccess(data);
            },
            function (err) {
                console.error(err);
            }
        )
    }

    private addGrainToGrainList(grain:IGrain) {
        if (this._grainList[grain.subject_id][grain.id]) {
            // overwrite
        }
        this._grainList[grain.subject_id][grain.id] = grain;
    }

    public getGrainListBySubjectId(subject_id, callbackSuccess, callbackFail) {
        var self = this;
        if (this._isSetGrainList[subject_id]) {
            callbackSuccess(this._grainList[subject_id])
        } else {
            this._getGrainListBySubjectId(subject_id,
                function (data) {
                    self._grainList[subject_id] = data;
                    self._isSetGrainList[subject_id] = true;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    public reorderGrain(grain, array_grain){
        // var
        var currentPrevious;
        var previous = null;
        var next = null;
        var oneIterationAfterMatch = false;
        // loop
        angular.forEach(array_grain, function(item_grain) {
            if(grain.id == item_grain.id){
                // match current grain
                previous = currentPrevious;
                oneIterationAfterMatch = true;
            }
            if(oneIterationAfterMatch == true){
                // one iteration after match current grain
                next = item_grain;
                oneIterationAfterMatch == false;
            }
            currentPrevious = item_grain;
        });
        // average
        var average = null;
        if(previous && next){
            average = (previous.order + next.order) / 2
        } else{
            if(previous){
                average = previous.order -1;
            } else if(next){
                average = next.order +1;
            } else {
                throw "Not Possible";
            }
        }
        // reorder
        grain.order = average;

    }

    /**
     *  PRIVATE HTTP
     */

    private _getGrainListBySubjectId(subject_id, callbackSuccess, callbackFail) {
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
            });
    }

    private _updateGrain(grain:IGrain, callbackSuccess, callbackFail) {
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