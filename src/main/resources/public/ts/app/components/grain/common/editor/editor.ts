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
                trackInputEvent: "=",
                placeholder: "@?"
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/common/editor/editor.html',
            link:(scope:any, element) => {
                scope.safeApply = function(fn) {
                    var phase = this.$root.$$phase;
                    if(phase == '$apply' || phase == '$digest') {
                      if(fn && (typeof(fn) === 'function')) {
                        fn();
                      }
                    } else {
                      this.$apply(fn);
                    }
                };
                scope.textEditor = scope.text;

                scope.update = () => {
                    scope.text = StringISOHelper.toISO(scope.textEditor);
                    scope.safeApply();
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };
            }
        };
    }]
);
