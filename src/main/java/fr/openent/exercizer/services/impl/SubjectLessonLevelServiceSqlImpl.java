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

import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import fr.openent.exercizer.services.ISubjectLessonLevelService;
import fr.wseduc.webutils.Either;

public class SubjectLessonLevelServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectLessonLevelService {

    public SubjectLessonLevelServiceSqlImpl() {
        super("exercizer", "subject_lesson_level");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    public void list(final Handler<Either<String, JsonArray>> handler) {
    	JsonArray orderBy = new fr.wseduc.webutils.collections.JsonArray();
    	orderBy.add("ORDER BY r.label ASC");
        super.list("r", null, null, orderBy, null, null, handler);
    }
    
    /**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	public void listBySubjectIdList(final JsonObject resources, final Handler<Either<String, JsonArray>> handler) {
		JsonArray subjectIdList = resources.getJsonArray("subject_id_list");
		
		JsonArray joins = new fr.wseduc.webutils.collections.JsonArray();
		joins.add("JOIN exercizer.subject_library_main_information slmi ON r.id = slmi.subject_lesson_level_id");

		JsonArray filters = new fr.wseduc.webutils.collections.JsonArray();
		filters.add("WHERE");
		filters.add("slmi.subject_id = " + subjectIdList.getValue(0));

		for (Object subjectId : subjectIdList) {
			if (!subjectIdList.getValue(0).equals(subjectId)) {
				filters.add("OR slmi.subject_id = " + subjectId);
			}
		}
		
		JsonArray orderBy = new fr.wseduc.webutils.collections.JsonArray();
		orderBy.add("ORDER BY slmi.subject_id ASC");

		super.list("r", joins, filters, orderBy, null, null, handler);
	}

}
