interface IFolderService {
    createFolder(folder : IFolder, callbackSuccess, callBackFail);
    updateFolder(folder : IFolder, callbackSuccess, callBackFail);
    deleteFolder(folder : IFolder, callbackSuccess, callbackFail);
    getFolderById(params, callbackSuccess, callbackFail);
    createObjectFolder() : IFolder;
    modifyFolderAParentIdByFolderBId(folderId, parentFolderId);
    folderList : IFolder[];
    currentFolderId;
}

class FolderService implements IFolderService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    private serverUrl : string;
    private $http : any;

    private _folderList : any;
    private _folderTree;
    private _currentFolderId;

    constructor(
        serverUrl,
        $http
    ) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        // init folder list as an object
        this._folderList = {
        };
    }


    public get currentFolderId() {
        return this._currentFolderId;
    }

    public set currentFolderId(value) {
        this._currentFolderId = value;
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
                if(callbackSuccess){
                    callbackSuccess(data);
                }
            },
            function(err){
                console.error(err);
            }
        );
    }

    public createObjectFolder() : IFolder {
        return {
            id: null,
            label : null,
            parent_folder_id : null
        }
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

    public getFolderById(folderId, callbackSuccess, callbackFail){
        var self = this;
        if(this._folderList[folderId]){
            callbackSuccess(this._folderList[folderId])
        } else {
            this._getFolderById(folderId,
                function(data) {
                    self._folderList[folderId] = data;
                    callbackSuccess(data);
                },
                callbackFail
            );
        }
    }


    public modifyFolderAParentIdByFolderBId(folderId, parentFolderId){
        if(this._folderList[folderId]){
            this._folderList[folderId].parent_folder_id = parentFolderId;
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
        throw "not implemented";
        /*var req: any;
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
            });*/
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