/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	console.log('Exercizer behaviours loaded');
	entcore_1.Behaviours.register('exercizer', {
	    rights: {
	        workflow: {
	            create: 'fr.openent.exercizer.controllers.SubjectController|persist',
	            import: 'fr.openent.exercizer.controllers.SubjectController|importSubjectGrains',
	            publish: 'fr.openent.exercizer.controllers.SubjectController|publish',
	            list: 'fr.openent.exercizer.controllers.SubjectController|listSubject',
	            view: 'fr.openent.exercizer.controllers.SubjectController|view'
	        },
	        resource: {
	            manager: {
	                right: 'fr-openent-exercizer-controllers-SubjectController|remove'
	            },
	            contrib: {
	                right: 'fr-openent-exercizer-controllers-SubjectController|canSchedule',
	            },
	            read: {
	                right: 'com-thecodingmachine-inca-controllers-ThematicController|list'
	            }
	        }
	    },
	    dependencies: {},
	    loadResources: function (callback) { }
	});


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = entcore;

/***/ })
/******/ ]);
//# sourceMappingURL=behaviours.js.map