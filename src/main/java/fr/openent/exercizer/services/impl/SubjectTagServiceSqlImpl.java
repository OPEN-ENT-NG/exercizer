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

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.services.ISubjectTagService;
import fr.wseduc.webutils.Either;

public class SubjectTagServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectTagService {

    public SubjectTagServiceSqlImpl() {
        super("exercizer", "subject_tag");
    }
    
    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	super.persist(resource, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    public void list(final Handler<Either<String, JsonArray>> handler) {
    	JsonArray orderBy = new JsonArray();
    	orderBy.addString("ORDER BY r.label ASC");
        super.list("r", null, null, orderBy, null, null, handler);
    }
    
    /**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	public void listBySubjectId(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
		JsonArray joins = new JsonArray();
		joins.addString("JOIN exercizer.subject_library_tag slt ON r.id = slt.subject_tag_id");

		JsonArray filters = new JsonArray();
		filters.addString("WHERE");
		filters.addString("slt.subject_id = " + resource.getInteger("subject_id"));

		super.list("r", joins, filters, null, null, null, handler);
	}

}
