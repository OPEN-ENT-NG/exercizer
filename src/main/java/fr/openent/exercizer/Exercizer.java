package fr.openent.exercizer;

import fr.openent.exercizer.controllers.*;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.sql.ShareAndOwner;
import org.entcore.common.share.impl.SqlShareService;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.vertx.java.core.eventbus.EventBus;


public class Exercizer extends BaseServer {

    @Override
    public void start() {
        super.start();
        final EventBus eb = getEventBus(vertx);

        this.setDefaultResourceFilter(new ShareAndOwner());

        SqlConf subjectConf = SqlConfs.createConf(SubjectController.class.getName());
        subjectConf.setTable("subject");
        subjectConf.setShareTable("subject_shares");
        subjectConf.setSchema("exercizer");

        SubjectController subjectController = new SubjectController();
        subjectController.setShareService(new SqlShareService("exercizer", "subject_shares", eb, securedActions, null));

        addController(new ExercizerController());
        addController(new FolderController());
        addController(subjectController);
        addController(new GrainController());
        addController(new GrainTypeController());
        addController(new SubjectScheduledController());
    }

}
