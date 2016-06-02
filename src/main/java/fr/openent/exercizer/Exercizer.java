package fr.openent.exercizer;

import fr.openent.exercizer.controllers.*;
import org.entcore.common.http.BaseServer;


public class Exercizer extends BaseServer {

    @Override
    public void start() {
        super.start();
        addController(new ExercizerController());
        addController(new FolderController());
        addController(new SubjectController());
        addController(new GrainController());
        addController(new GrainTypeController());
        addController(new SubjectScheduledController());
    }

}
