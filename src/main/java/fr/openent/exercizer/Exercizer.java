package fr.openent.exercizer;

import fr.openent.exercizer.controllers.SubjectController;
import fr.openent.exercizer.services.SubjectService;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.service.impl.SqlSearchService;
import org.entcore.common.share.impl.SqlShareService;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;

import fr.openent.exercizer.controllers.ExercizerController;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.json.JsonArray;


public class Exercizer extends BaseServer {

    public final static String SUBJECT_RESOURCE_ID = "subjectid";
    public final static String SUBJECT_TABLE = "subject";
    public final static String SUBJECT_SHARE_TABLE = "subject_shares";

    @Override
    public void start() {
        super.start();
        final EventBus eb = getEventBus(vertx);

        // subject table
        SqlConf confSubject = SqlConfs.createConf(SubjectController.class.getName());
        confSubject.setResourceIdLabel(SUBJECT_RESOURCE_ID);
        confSubject.setTable(SUBJECT_TABLE);
        confSubject.setShareTable(SUBJECT_SHARE_TABLE);
        confSubject.setSchema(getSchema());

        // subject controllers
        SubjectController subjectController = new SubjectController();
        SqlCrudService subjectSqlCrudService = new SqlCrudService(getSchema(), SUBJECT_TABLE, SUBJECT_SHARE_TABLE, new JsonArray().addString("*"), new JsonArray().add("*"), true);
        subjectController.setCrudService(subjectSqlCrudService);
        subjectController.setShareService(new SqlShareService(getSchema(), SUBJECT_SHARE_TABLE, eb, securedActions, null));
        addController(subjectController);
    }

}
