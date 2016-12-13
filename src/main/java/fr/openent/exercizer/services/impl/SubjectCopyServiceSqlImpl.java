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

package fr.openent.exercizer.services.impl;

import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.ISubjectCopyService;
import fr.wseduc.webutils.Either;

public class SubjectCopyServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectCopyService {

	public SubjectCopyServiceSqlImpl() {
		super("exercizer", "subject_copy");
	}

	@Override
	public void submitCopy(final long id, final Handler<Either<String, JsonObject>> handler) {
		sql.prepared(
				"UPDATE " + schema + "subject_copy SET submitted_date=NOW() WHERE id = ? RETURNING *",
				new JsonArray().addNumber(id),
				SqlResult.validUniqueResultHandler(handler)
		);
	}

	/**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
	@Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        JsonObject subjectCopy = ResourceParser.beforeAny(resource);
        super.persistWithAnotherOwner(subjectCopy, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        JsonObject subjectCopy = ResourceParser.beforeAny(resource);
        super.update(subjectCopy, user, handler);
    }
    
    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list(user, handler);
    }
    
    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectScheduled(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
    	super.list(resource, "subject_scheduled_id", "exercizer.subject_scheduled", handler);
    }
    
    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectScheduledList(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list("subject_scheduled_id", "exercizer.subject_scheduled", Boolean.TRUE, user, handler);
    }
    
    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void getById(final String id, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        super.getById(id, user, handler);
    }

}
