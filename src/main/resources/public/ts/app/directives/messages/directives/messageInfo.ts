import { ng } from 'entcore';

export const messageInfo = ng.directive('messageInfo',
	[function () {
		return {
			restrict: "E",
			scope: {
				status:'@'
			},
			transclude: true,
			templateUrl: "exercizer/public/ts/app/directives/messages/template/message-info.html",
			link: function(scope, element, attr){}
		}
	}]
);