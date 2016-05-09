interface IFolderService {
    createFolder(folder : IFolder, callbackSuccess, callBackFail);
    updateFolder(folder : IFolder, callbackSuccess, callBackFail);
    deleteFolder(folder : IFolder, callbackSuccess, callbackFail);
    getFolderById(params, callbackSuccess, callbackFail);
    folderList : IFolder[];
}

class FolderService implements IFolderService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    private serverUrl : string;
    private $http : any;

    private _folderList : IFolder[];

    constructor(
        serverUrl,
        $http
    ) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        this._folderList = [];

    }


    public get folderList() : IFolder[] {
        return this._folderList;
    }

    public createFolder(folder : IFolder, callbackSuccess, callBackFail) {
        var self = this;
        this._createFolder(
            folder,
            function(data){
                self.addFolderToFolderList(data);
                callbackSuccess(data);
            },
            function(err){
                console.error(err);
            }
        );
    }

    public updateFolder(folder : IFolder, callbackSuccess, callbackFail){
        this._updateFolder(
            folder,
            function(data){
                this.addFolderToFolderList(data);
                callbackSuccess(data);
            },
            function(err){
                console.error(err);
            }
        )
    }

    public deleteFolder(folder : IFolder, callbackSuccess, callbackFail){
        this._deleteFolder(
            folder,
            function(data){
                this.removeFolderToFolderList(data);
                callbackSuccess(data);
            },
            function(err){
                console.error(err);
            }
        )
    }

    public getFolderById(params, callbackSuccess, callbackFail){
        var self = this;
        if(params.folder.id in this._folderList){
            callbackSuccess(this._folderList[params.folder.id])
        } else {
            this._getFolderById(params.folder.id,
                function(data) {
                    self._folderList[params.folder.id] = data;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    private removeFolderToFolderList(folder : IFolder) {
        delete this._folderList[folder.id];
    }

    private addFolderToFolderList(folder : IFolder){
        if(this._folderList[folder.id]){
            // overwrite
        }
        this._folderList[folder.id] = folder;
    }



    private _getFolderById(params, callbackSuccess, callbackFail){
        var req: any;
        var self = this;
        req = this.$http({
            method: 'GET',
            url: self.serverUrl+'/folders/get',
            params: {
                "folder_id": params.folder.id,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA  : list of folder
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

    private _updateFolder(folder : IFolder, callbackSuccess, callbackFail){
        var req: any;
        var self = this;
        req = this.$http({
            method: 'POST',
            url: self.serverUrl+'/folders/update/' + folder.id,
            params: {
                "folder": folder,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA : folder
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

    private _createFolder(folder : IFolder, callbackSuccess, callbackFail){
        /**
         * TEMP
         */
        folder.id = Math.floor((Math.random() * 1000) + 1);
        callbackSuccess(folder);
        /*
         var req: any;
         var self = this;
         req = this.$http({
         method: 'POST',
         url: self.serverUrl+'/Folders/create/',
         params: {
         "folder": folder,
         },
         paramSerializer: '$httpParamSerializerJQLike'
         });
         req
         .success(function (data, status, headers, config) {
         if (status == 200) {
         // DATA : folder
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

    private _deleteFolder(folder : IFolder, callbackSuccess, callbackFail) {
        // TODO
    }



}