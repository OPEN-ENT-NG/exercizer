package fr.openent.exercizer;

import fr.openent.exercizer.controllers.ExercizerController;
import fr.openent.exercizer.controllers.FolderController;
import fr.openent.exercizer.controllers.GrainController;
import fr.openent.exercizer.controllers.SubjectController;
import org.entcore.common.http.BaseServer;


public class Exercizer extends BaseServer {

    @Override
    public void start() {
        super.start();
        addController(new ExercizerController());
        addController(new FolderController());
        addController(new SubjectController());
        addController(new GrainController());
    }

}
