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

package fr.openent.exercizer.services;

import fr.wseduc.webutils.Either;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface ISubjectScheduledService {

    void retieve(String id, Handler<Either<String, JsonObject>> handler);

    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void list(final UserInfos user, final Handler<Either<String, JsonArray>> handler);

    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void listBySubjectCopyList(final UserInfos user, final Handler<Either<String, JsonArray>> handler);
    
    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void getById(final String id, final UserInfos user, final Handler<Either<String, JsonObject>> handler);
    
    /**
     * Schedules a subject.
     * 
     * @param scheduledSubject the resource
     * @param user the user
     * @param handler the handler
     */
    void schedule(final JsonObject scheduledSubject, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

    /**
     * find data of subject scheduled.
     *
     * @param subjectScheduledId the id
     * @param handler the handler
     */
    void findUnscheduledData(final Long subjectScheduledId, final Handler<Either<String, JsonObject>> handler);

    /**
     * unScheduled a subject.
     *
     * @param subjectScheduledId the id
     * @param handler the handler
     */
    void unSchedule(final Long subjectScheduledId, final Handler<Either<String, JsonObject>> handler);

    /**
     * Schedules a simple subject.
     *
     * @param scheduledSubject the resource
     * @param user the user
     * @param handler the handler
     */
    void simpleSchedule(final JsonObject scheduledSubject, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

    void addCorrectedFile(final String id, final String fileId, final JsonObject metadata, final Handler<Either<String, JsonObject>> handler);

    void removeCorrectedFile(final String id, final Handler<Either<String, JsonObject>> handler);

    void getCorrectedDownloadInformation(final String id, final Handler<Either<String, JsonObject>> handler);

    void getMember(final String id, final Handler<Either<String, JsonArray>> handler);

    void getArchive(final UserInfos user, final Handler<Either<String, JsonArray>> handler);

    void getListForExport(final UserInfos user, final List<String> ids, final Handler<Either<String, JsonArray>> handler);

    void modify(final String id, JsonObject fiedls, final Handler<Either<String, JsonObject>> handler);

    void createTrainingCopy(final String subjectScheduledId, UserInfos user, final Handler<Either<String, JsonObject>> handler);
}
