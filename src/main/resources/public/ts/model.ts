import {Exercizer} from './exercizer';

model.build = function(){
    model.makeModels(Exercizer);
    this.ex = new Exercizer.Exercice();
    this.ex.pouetpouet()
}
