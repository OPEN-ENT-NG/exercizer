System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Exercice, Exercizer;
    return {
        setters:[],
        execute: function() {
            Exercice = (function () {
                function Exercice() {
                }
                Exercice.prototype.pouetpouet = function () {
                    console.log('truc');
                };
                return Exercice;
            }());
            exports_1("Exercice", Exercice);
            exports_1("Exercizer", Exercizer = {
                Exercice: Exercice
            });
        }
    }
});
