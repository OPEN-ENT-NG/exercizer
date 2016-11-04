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

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainService;
import fr.wseduc.webutils.Either;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

public class GrainServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IGrainService {

    public GrainServiceSqlImpl() {
        super("exercizer", "grain");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject grain = ResourceParser.beforeAny(resource);
    	super.persist(grain, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject grain = ResourceParser.beforeAny(resource);
        super.update(grain, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void remove(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        super.delete(resource, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
        super.list(resource, "subject_id", "exercizer.subject", handler);
    }
    
    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectForLibrary(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
    	JsonArray joins = new JsonArray();
    	joins.addString("JOIN exercizer.subject s ON r.subject_id = s.id AND s.is_library_subject = true AND s.id = " + resource.getField("id"));
    	
    	super.list("r", joins, null, null, null, null, handler);
    }
}
