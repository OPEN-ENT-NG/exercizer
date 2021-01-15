import { ng } from 'entcore';
import { StringISOHelper } from '../../../../models/helpers';

export const customEditor = ng.directive('customEditor',
    [() => {
        return {
            restrict: 'E',
            replace : true,
            scope : {
                text :"=",
                grain : "=",
                trackInputEvent: "="
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/common/editor/editor.html',
            link:(scope:any, element) => {

                scope.textEditor = scope.text;

                scope.update = () => {
                    scope.text = StringISOHelper.toISO(scope.textEditor);
                    scope.$apply();
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };
            }
        };
    }]
);
