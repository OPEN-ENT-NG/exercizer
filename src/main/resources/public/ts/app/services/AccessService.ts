import { ng } from 'entcore';

export interface IAccessService {
    reader : boolean
}

export class AccessService implements IAccessService {

    public reader : boolean;
}

export const accessService = ng.service('AccessService', AccessService);