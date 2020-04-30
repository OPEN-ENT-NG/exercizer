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
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainScheduledService;
import fr.wseduc.webutils.Either;

public class GrainScheduledServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IGrainScheduledService {
	
	public GrainScheduledServiceSqlImpl() {
        super("exercizer", "grain_scheduled");
    }

    @Override
    public void canListGrains(final Integer subjectScheduledId, final UserInfos user, final Handler<Boolean> handler){
        final String query = "SELECT COUNT(*) FROM exercizer.subject_scheduled ss " +
        "WHERE ss.id = ? AND (ss.owner = ? OR  EXISTS ( " +
        "SELECT id FROM exercizer.subject_copy sc WHERE sc.owner = ? AND ss.id = sc.subject_scheduled_id AND ss.due_date < NOW()" +
        "))";
        final JsonArray values = new JsonArray().add(subjectScheduledId).add(user.getUserId()).add(user.getUserId());
    	sql.prepared(query, values, message -> {
            Long count = SqlResult.countResult(message);
			handler.handle(count != null && count > 0);
        }); 
    }
    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject grainScheduled = ResourceParser.beforeAny(resource);
    	super.persist(grainScheduled, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
        super.list(resource, "subject_scheduled_id", "exercizer.subject_scheduled", handler);
    }

}
