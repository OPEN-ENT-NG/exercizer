import { ng } from 'entcore';

export const digitsInputRestrict = ng.directive('digitsInputRestrict', [ () => {
        return {
            restrict: 'A',
            link:(scope:any, element:any) => {
                var inputElement = element[0], 
                    inputValue = inputElement.value;

                inputElement.addEventListener('keyup', function() {

                    var digits = inputElement.value.replace(/[^0-9.]/g, '');

                    if (digits.split('.').length > 2) {
                        digits = digits.substring(0, digits.length - 1);
                    }
                    
                    if (digits.indexOf('.') !== -1 && digits.indexOf('.') === digits.length -1) {
                        return;
                    }

                    if (digits !== inputValue) {
                        inputElement.value = digits;
                        inputValue = inputElement.value;
                    } else {
                        inputElement.value = inputValue;
                    }
                });

            }
        };
    }]
);