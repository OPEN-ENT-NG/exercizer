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

public interface ISubjectCopyService {
    enum FileType {
        CORRECTED,
        HOMEWORK
    }

    void submitCopy(final long id, int timezoneOffset, final Handler<Either<String, JsonObject>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void list(final UserInfos user, final Handler<Either<String, JsonArray>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void listBySubjectScheduled(final JsonObject resource, final Handler<Either<String, JsonArray>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void listBySubjectScheduledList(final UserInfos user, final Handler<Either<String, JsonArray>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void getById(final String id, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

    void getDownloadInformation(final List<String> ids, final Handler<Either<String, JsonArray>> handler);

    void correctedInProgress(final List<String> ids, final Handler<Either<String, JsonObject>> handler);

    void getMetadataOfSubject(final String id, final FileType fileType, final Handler<Either<String, JsonObject>> handler);

    void addFile(final String id, final String fileId, final JsonObject metadata, final FileType fileType, int timezoneOffset, final Handler<Either<String, JsonObject>> handler);

    void removeIndividualCorrectedFile(final String id, final Handler<Either<String, JsonObject>> handler);

    void getOwners(final JsonArray ids, final Handler<Either<String, JsonArray>> handler);

    void getArchive(final List<String> ids, final Handler<Either<String, JsonArray>> handler);

    void exclude(final JsonArray ids, final Handler<Either<String, JsonArray>> handler);

    void getSubmittedBySubjectScheduled(final String scheduledId, final Handler<Either<String, JsonArray>> handler);

    void subjectCopyTrainingExists(UserInfos user, final String subjectScheduledId, Handler<Either<String, Boolean>> handler);

    void setCurrentGrain(final String subjectCopyId, final String grainCopyId, Handler<Either<String, JsonObject>> handler);
}
