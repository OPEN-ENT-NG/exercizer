import { ng } from 'entcore';

export const autoExpand = ng.directive('autoExpand',
	[function () {
		return {
			restrict: "EA",
			link: function(scope, element, attr){
                let messageLastScrollHeight = element[0].scrollHeight;

                element[0].setAttribute("rows", "1");
                
                element[0].addEventListener('keydown', handleAutoExand);
                element[0].addEventListener('focus', () => {
                    let calc = element[0].scrollHeight / 16;
                    
                    if (element[0].value.length === 0) {
                        element[0].setAttribute("rows", "1");
                    } else {
                        element[0].setAttribute('rows', parseInt(String(calc)));
                    }
                }, { once: true })

                function handleAutoExand () {
                    let rows = parseInt(element[0].getAttribute("rows"));
                    element[0].setAttribute("rows", "1");
                    if (element[0].value === '') {
                        rows = 1;
                    }
                    
                    if (element[0].scrollHeight > messageLastScrollHeight) {
                        rows++;
                    } else if (rows > 1 && element[0].scrollHeight < messageLastScrollHeight) {
                        rows--;
                    }
                    
                    messageLastScrollHeight = element[0].scrollHeight;
                    element[0].setAttribute("rows", rows);
                };
            }
		}
	}]
);