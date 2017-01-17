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
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainCopyService;
import fr.wseduc.webutils.Either;

import java.util.Arrays;

public class GrainCopyServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IGrainCopyService {
	
	public GrainCopyServiceSqlImpl() {
        super("exercizer", "grain_copy");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject grainCopy = ResourceParser.beforeAny(resource);
    	super.persist(grainCopy, handler);
    }

	private SqlStatementsBuilder updateGrain(final JsonObject resource) {
		// update copy grain
		JsonArray values = new JsonArray();
		StringBuilder updateGrainQuery = new StringBuilder();
		for (String attr : resource.getFieldNames()) {
			updateGrainQuery.append(attr).append(" = ?, ");
			values.add(resource.getValue(attr));
		}

		SqlStatementsBuilder s = new SqlStatementsBuilder();
		s.prepared(
				"UPDATE " + resourceTable + " SET " + updateGrainQuery.toString() + "modified = NOW() " + "WHERE id = ? RETURNING *",
				values.add(resource.getInteger("id")));
		return s;
	}

	@Override
    public void update(final JsonObject resource, String subjectiCopyState, final Handler<Either<String, JsonObject>> handler) {

		SqlStatementsBuilder s = updateGrain(resource);
		// update subject copy
		s.prepared(
				"UPDATE " + schema + "subject_copy SET modified=NOW(), " + subjectiCopyState+ "=true WHERE id = ? RETURNING *",
				new JsonArray().addNumber(resource.getNumber("subject_copy_id")));

		sql.transaction(s.build(), SqlResult.validUniqueResultHandler(1, handler));
	}

	@Override
	public void updateAndScore(final JsonObject resource, String subjectiCopyState, final Handler<Either<String, JsonObject>> handler) {
		//initialize final score of resource
		if (resource.getNumber("final_score") == null) {
			resource.putNumber("final_score", resource.getNumber("calculated_score"));
		}
		SqlStatementsBuilder s = updateGrain(resource);
		// update subject copy
		s.prepared(
				"UPDATE "+schema+"subject_copy SET " +
						"modified=NOW(), " +
						"final_score=(select sum(final_score) from "+schema+"grain_copy where subject_copy_id = ?), " +
						"calculated_score=(select sum(calculated_score) from "+schema+"grain_copy where subject_copy_id = ?), "
						+ subjectiCopyState+ "=true WHERE id = ? RETURNING *",
				new JsonArray().addNumber(resource.getNumber("subject_copy_id"))
						.addNumber(resource.getNumber("subject_copy_id"))
						.addNumber(resource.getNumber("subject_copy_id")));

		sql.transaction(s.build(), SqlResult.validUniqueResultHandler(1, handler));
	}


    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
        super.list(resource, "subject_copy_id", "exercizer.subject_copy", handler);
    }

}
