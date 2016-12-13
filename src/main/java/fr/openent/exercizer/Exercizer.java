/*
 * Copyright © Région Nord Pas de Calais-Picardie.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

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
    }

}
