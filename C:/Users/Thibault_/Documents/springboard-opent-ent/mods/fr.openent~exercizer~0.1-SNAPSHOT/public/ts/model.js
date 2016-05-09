System.register(['./exercizer'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var exercizer_1;
    return {
        setters:[
            function (exercizer_1_1) {
                exercizer_1 = exercizer_1_1;
            }],
        execute: function() {
            model.build = function () {
                model.makeModels(exercizer_1.Exercizer);
                this.ex = new exercizer_1.Exercizer.Exercice();
                this.ex.pouetpouet();
            };
        }
    }
});
