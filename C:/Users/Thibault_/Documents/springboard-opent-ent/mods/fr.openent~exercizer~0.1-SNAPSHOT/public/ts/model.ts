import {Exercizer} from './exercizer';

(window as any).AngularExtensions = {
    init: function(module){
        module.directive('maDirective')
    }
}

model.build = function(){
    model.makeModels(Exercizer);
    this.ex = new Exercizer.Exercice();
    this.ex.pouetpouet()
}
