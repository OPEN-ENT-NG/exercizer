package fr.openent.exercizer;

import fr.openent.exercizer.controllers.*;
import org.entcore.common.http.BaseServer;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.share.impl.SqlShareService;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.vertx.java.core.eventbus.EventBus;


public class Exercizer extends BaseServer {

    @Override
    public void start() {
        super.start();
        
        final EventBus eb = getEventBus(vertx);
        
        SqlConf folderConf = SqlConfs.createConf(FolderController.class.getName());
        folderConf.setSchema("exercizer");
        folderConf.setTable("folder");

        SqlConf subjectConf = SqlConfs.createConf(SubjectController.class.getName());
        subjectConf.setSchema("exercizer");
        subjectConf.setTable("subject");
        subjectConf.setShareTable("subject_shares");
        
        SubjectController subjectController = new SubjectController();
        subjectController.setShareService(new SqlShareService("exercizer", "subject_shares", eb, securedActions, null));
        subjectController.setCrudService(new SqlCrudService("exercizer", "subject"));

        SqlConf subjectScheduledConf = SqlConfs.createConf(SubjectScheduledController.class.getName());
        subjectScheduledConf.setSchema("exercizer");
        subjectScheduledConf.setTable("subject");
        subjectScheduledConf.setShareTable("subject_shares");
        
        SqlConf grainScheduledConf = SqlConfs.createConf(GrainScheduledController.class.getName());
        grainScheduledConf.setSchema("exercizer");
        grainScheduledConf.setTable("subject");
        grainScheduledConf.setShareTable("subject_shares");
        
        SqlConf subjectCopyConf = SqlConfs.createConf(SubjectCopyController.class.getName());
        subjectCopyConf.setSchema("exercizer");
        subjectCopyConf.setTable("subject_scheduled");

        SqlConf subjectLibraryMainInformationConf = SqlConfs.createConf(SubjectLibraryMainInformationController.class.getName());
        subjectLibraryMainInformationConf.setSchema("exercizer");
        subjectLibraryMainInformationConf.setTable("subject");
        
        SqlConf subjectLibraryTagConf = SqlConfs.createConf(SubjectLibraryTagController.class.getName());
        subjectLibraryTagConf.setSchema("exercizer");
        subjectLibraryTagConf.setTable("subject");
        
        addController(new ExercizerController());
        addController(new FolderController());
        addController(subjectController);
        addController(new GrainTypeController());
        addController(new SubjectScheduledController());
        addController(new GrainScheduledController());
        addController(new SubjectCopyController());
        addController(new SubjectLessonLevelController());
        addController(new SubjectLessonTypeController());
        addController(new SubjectTagController());
        addController(new SubjectLibraryMainInformationController());
        addController(new SubjectLibraryTagController());
        
    }

}
