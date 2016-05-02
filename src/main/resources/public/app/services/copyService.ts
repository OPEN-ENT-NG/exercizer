/**
 * Created by jun on 22/04/2016.
 */
/**
 * Created by jun on 22/04/2016.
 */
interface ICopyService {
    createCopy(copy : ICopy, callbackSuccess, callBackFail) : ICopy;
    updateCopy(copy : ICopy, callbackSuccess, callbackFail)
    getCopyList(params, callbackSuccess, callbackFail);
    copyList : ICopy[];
    isSetCopyList : boolean;
}

class CopyService implements ICopyService {

    static $inject = [
        'serverUrl'
    ];

    private _copyList :[];
    private _isSetCopyList : boolean;

    constructor(
        serverUrl
    ) {
        this._isSetCopyList = false;
        this._copyList = [];

        this.serverUrl = serverUrl;
    }


    public get copyList():ICopy[] {
        return this._copyList;
    }


    public get isSetCopyList():boolean {
        return this._isSetCopyList;
    }

    /**
     * Set isSetCopyList is used to force refresh copy list
     * @param value
     */
    public set isSetCopyList(value:boolean) {
        this._isSetCopyList = value;
    }

    public createCopy(copy : ICopy, callbackSuccess, callBackFail) : ICopy{
        var self = this;
        this._createCopy(
            copy,
            function(data){
                self.addCopyToCopyList(copy);
                callbackSuccess(data);
            },
            function(err){
                console.error(err);
            }
        );
    }

    public updateCopy(copy : ICopy, callbackSuccess, callbackFail){
        this._updateCopy(
            copy,
            function(data){
                this.addCopyToCopyList(data);
                callbackSuccess(data);
            },
            function(err){
                console.error(err);
            }
        )
    }

    private addCopyToCopyList(copy : ICopy){
        if(this._copyList[copy.id]){
            // overwrite
        }
        this._copyList[copy.id] = copy;
    }

    public getCopyList(params, callbackSuccess, callbackFail){
        var self = this;
        if(this._isSetCopyList){
            callbackSuccess(this._copyList)
        } else{
            this._getCopyList(params,
                function(data){
                    self._copyList = data;
                    self._isSetCopyList = true;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    private _getCopyList(params, callbackSuccess, callbackFail){
        var req: any;
        var self = this;
        req = this.$http({
            method: 'GET',
            url: self.serverUrl+'/copies/get',
            params: {
                "user_id": params.user.id,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA  : list of copy
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

    private _updateCopy(copy : ICopy, callbackSuccess, callbackFail){
        var req: any;
        var self = this;
        req = this.$http({
            method: 'POST',
            url: self.serverUrl+'/copies/update/' + copy.id,
            params: {
                "copy": copy,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA : copy
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

    private _createCopy(copy : ICopy, callbackSuccess, callbackFail){
        /**
         * TEMP
         */
        copy.id = Math.floor((Math.random() * 1000) + 1);
        callbackSuccess(copy);
        /*
         var req: any;
         var self = this;
         req = this.$http({
         method: 'POST',
         url: self.serverUrl+'/copies/create/',
         params: {
         "copy": copy,
         },
         paramSerializer: '$httpParamSerializerJQLike'
         });
         req
         .success(function (data, status, headers, config) {
         if (status == 200) {
         // DATA : copy
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