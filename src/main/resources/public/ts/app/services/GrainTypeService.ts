import { ng, idiom } from 'entcore';
import { SerializationHelper, MapToListHelper } from '../models/helpers';
import { IGrainCopy, IGrainType, GrainType } from '../models/domain';
import { StatementCustomData } from '../components/grain/statement/models/StatementCustomData';
import { StatementCustomCopyData } from '../components/grain/statement/models/StatementCustomCopyData';
import { SimpleAnswerCustomData } from '../components/grain/simple_answer/models/SimpleAnswerCustomData';
import { SimpleAnswerCustomCopyData } from '../components/grain/simple_answer/models/SimpleAnswerCustomCopyData';
import { OpenAnswerCustomCopyData } from '../components/grain/open_answer/models/OpenAnswerCustomCopyData';
import { MultipleAnswerCustomData } from '../components/grain/multiple_answer/models/MultipleAnswerCustomData';
import { MultipleAnswerCustomCopyData } from '../components/grain/multiple_answer/models/MultipleAnswerCustomCopyData';
import { QcmCustomData } from '../components/grain/qcm/models/QcmCustomData';
import { QcmCustomCopyData } from '../components/grain/qcm/models/QcmCustomCopyData';
import { AssociationCustomData } from '../components/grain/association/models/AssociationCustomData';
import { AssociationCustomCopyData } from '../components/grain/association/models/AssociationCustomCopyData';
import { OrderCustomData } from '../components/grain/order/models/OrderCustomData';
import { OrderCustomCopyData } from '../components/grain/order/models/OrderCustomCopyData';
import { CustomData as FillTextCustomData } from '../components/grain/filltext/models/CustomData';
import { CustomData as ZoneTextCustomData } from '../components/grain/zonetext/models/CustomData';
import { CustomData as ZoneImageCustomData } from '../components/grain/zoneimage/models/CustomData';

export interface IGrainTypeService {
    getList():IGrainType[];
    getById(id:number):IGrainType;
    getPublicName(id:number):string;
    getIllustrationIconName(id:number):string;
    getIllustrationURL(id:number):string;
    instantiateCustomData(grainObject:any, grainTypeId:number):any;
    instantiateCustomCopyData(grainCopyObject:any, grainTypeId:number):any;
}

export class GrainTypeService implements IGrainTypeService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:IGrainType};

    constructor
    (
        private _$q,
        private _$http
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._resolve();
    }

    public getList = function():IGrainType[] {
        return MapToListHelper.toList(this._listMappedById);
    };
    
    public getById = function(id:number):IGrainType {
        return this._listMappedById[id];
    };

    public getPublicName = function(id:number):string {
        var grainType = this.getById(id);
        
        return grainType.public_name;
    };

    public getIllustrationIconName = function(id:number):string {
        var illustrationIconName = '';

        switch (id) {
            case 3:
                illustrationIconName = 'doc-text';
                break;
        }
        
        return illustrationIconName
    };

    public getIllustrationURL = function(id:number):string {
        var illustrationUrl = '',
            grainType = this.getById(id);

        if (id > 3) {
            return '/exercizer/public/assets/illustrations/' + grainType.illustration + '.html';
        }

        return illustrationUrl;
    };
    
    public instantiateCustomData = function(grainObject:any, grainTypeId:number):any {
        var customData = {};
        
        switch (grainTypeId) {
            case 3:
                customData = SerializationHelper.toInstance(new StatementCustomData(), grainObject.grain_data.custom_data);
                break;
            case 4:
                customData = SerializationHelper.toInstance(new SimpleAnswerCustomData(), grainObject.grain_data.custom_data);
                break;
            case 6:
                customData = SerializationHelper.toInstance(new MultipleAnswerCustomData(), grainObject.grain_data.custom_data);
                break;
            case 7:
                customData = SerializationHelper.toInstance(new QcmCustomData(), grainObject.grain_data.custom_data);
                break;
            case 8:
                customData = SerializationHelper.toInstance(new AssociationCustomData(), grainObject.grain_data.custom_data);
                break;
            case 9:
                customData = SerializationHelper.toInstance(new OrderCustomData(), grainObject.grain_data.custom_data);
                break;
            case 10:
                customData = new FillTextCustomData(grainObject.grain_data.custom_data);
                break;
            case 11:
                customData = new ZoneTextCustomData(grainObject.grain_data.custom_data);
                break;
            case 12:
                customData = new ZoneImageCustomData(grainObject.grain_data.custom_data);
                break;
        }
        
        return customData;
    };

    public instantiateCustomCopyData = function(grainCopyObject:any, grainTypeId:number):any {
        var customData = {};

        switch (grainTypeId) {
            case 3:
                customData = SerializationHelper.toInstance(new StatementCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 4:
                customData = SerializationHelper.toInstance(new SimpleAnswerCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 6:
                customData = SerializationHelper.toInstance(new MultipleAnswerCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 7:
                customData = SerializationHelper.toInstance(new QcmCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 8:
                customData = SerializationHelper.toInstance(new AssociationCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 9:
                customData = SerializationHelper.toInstance(new OrderCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 11:
                customData = new ZoneTextCustomData(grainCopyObject.grain_data.custom_data);
                break;
        }

        return customData;
    };

    private _resolve = function():Promise<IGrainType[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/grain-types'
            };
        
        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(this.getList());
        } else {
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};
                    
                    angular.forEach(response.data, function (grainTypeObject) {
                        var grainType = SerializationHelper.toInstance(new GrainType(), JSON.stringify(grainTypeObject));
                        grainType.public_name = idiom.translate(grainType.public_name);
                        self._listMappedById[grainType.id] = grainType;
                    });

                    deferred.resolve(self.getList());
                },
                function() {
                    deferred.reject('exercizer.error');
                }
            );
        }
        return deferred.promise;
    };
}

export const grainTypeService = ng.service('GrainTypeService', GrainTypeService);