export class MapToListHelper {
    static toList(map) {
        return Object.keys(map).map(function (v) {
            return map[v];
        });
    }
}