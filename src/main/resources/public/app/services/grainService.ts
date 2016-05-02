/**
 * Created by jun on 22/04/2016.
 */
interface IGrainService {
    createGrain(grain : IGrain, callbackSuccess, callBackFail) : IGrain;
    updateGrain(grain : IGrain, callbackSuccess, callbackFail)
    getGrainList(params, callbackSuccess, callbackFail);
    grainList : IGrain[];
    isSetGrainList : boolean;
}

class GrainService implements IGrainService {

    static $inject = [
        'serverUrl'
    ];

    private _grainList :[];
    private _isSetGrainList : boolean;

    constructor(
        serverUrl
    ) {
        this._isSetGrainList = false;
        this._grainList = [];

        this.serverUrl = serverUrl;
    }


    public get grainList():IGrain[] {
        return this._grainList;
    }


    public get isSetGrainList():boolean {
        return this._isSetGrainList;
    }

    /**
     * Set isSetGrainList is used to force refresh grain list
      * @param value
     */
    public set isSetGrainList(value:boolean) {
        this._isSetGrainList = value;
    }

    public createGrain(grain : IGrain, callbackSuccess, callBackFail) : IGrain{
        var self = this;
        this._createGrain(
            grain,
            function(data){
                self.addGrainToGrainList(grain);
                callbackSuccess(data);
            },
            function(err){
                console.error(err);
            }
        );
    }

    public updateGrain(grain : IGrain, callbackSuccess, callbackFail){
        this._updateGrain(
            grain,
            function(data){
                this.addGrainToGrainList(data);
                callbackSuccess(data);
            },
            function(err){
                console.error(err);
            }
        )
    }

    private addGrainToGrainList(grain : IGrain){
        if(this._grainList[grain.id]){
            // overwrite
        }
        this._grainList[grain.id] = grain;
    }

    public getGrainList(params, callbackSuccess, callbackFail){
        var self = this;
        if(this._isSetGrainList){
            callbackSuccess(this._grainList)
        } else{
            this._getGrainList(params,
                function(data){
                    self._grainList = data;
                    self._isSetGrainList = true;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    private _getGrainList(params, callbackSuccess, callbackFail){
        var req: any;
        var self = this;
        req = this.$http({
            method: 'GET',
            url: self.serverUrl+'/grains/get',
            params: {
                "user_id": params.user.id,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA  : list of grain
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
    }

    private _updateGrain(grain : IGrain, callbackSuccess, callbackFail){
        var req: any;
        var self = this;
        req = this.$http({
            method: 'POST',
            url: self.serverUrl+'/grains/update/' + grain.id,
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
    }

    private _createGrain(grain : IGrain, callbackSuccess, callbackFail){
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