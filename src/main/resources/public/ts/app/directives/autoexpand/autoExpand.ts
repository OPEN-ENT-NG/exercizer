import { ng } from 'entcore';

export const autoExpand = ng.directive('autoExpand',
	[function () {
		return {
			restrict: "EA",
			link: function(scope, element, attributes){
                function handleInputDimension() {
                    if (element[0].value === '') {
                        if (attributes.vertical === "true") {
                            element[0].style.width = 150 + "px";
                        } else {
                            element[0].style.height = 50 + "px";
                        }
                    }
                }

                function onInputChange() {
                    if (attributes.vertical === "true") {
                        element[0].style.width = "";
                        element[0].style.width = element[0].scrollWidth + "px";
                    } else {
                        element[0].style.height = "";
                        element[0].style.height = Math.min(element[0].scrollHeight, 300) + "px";
                    }
                    handleInputDimension();
                }

                handleInputDimension();

                element[0].addEventListener('input', onInputChange);
            }
		}
	}]
);