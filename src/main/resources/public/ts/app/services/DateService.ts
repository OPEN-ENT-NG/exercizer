import { ng } from 'entcore';

export interface IDateService {
    addDays(date, days);
    compare_after(date_a, date_b, value_equal):boolean;
    timestampToDate(timestamp);
    isoToDate(iso);
}

export class DateService implements IDateService {

    static $inject = [];

    constructor() {

    }

    public addDays(date, days) {
        var result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    }

    public compare_after(date_a, date_b, value_equal) {
        var a = angular.copy(date_a);
        var b = angular.copy(date_b);
        a.setHours(0, 0, 0, 0);
        b.setHours(0, 0, 0, 0);
        if (a > b) {
            return true;
        } else if (a < b) {

            return false;
        } else {
            return value_equal;
        }
    }


    public timestampToDate(timestamp) {
        return new Date(parseInt(timestamp) * 1000);
    }

    public addHours(date, h){
        return new Date(date.setHours ( date.getHours() + h ));
    }

    public isoToDate(iso) {
        return new Date(iso);
    }
}

export const dateService = ng.service('DateService', DateService);