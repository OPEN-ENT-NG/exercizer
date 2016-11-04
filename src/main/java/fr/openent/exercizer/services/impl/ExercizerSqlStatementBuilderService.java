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

import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;


class ExercizerSqlStatementBuilderService extends SqlCrudService {

	ExercizerSqlStatementBuilderService(String schema, String table, String shareTable) {
        super(schema, table, shareTable);
    }

	ExercizerSqlStatementBuilderService(String schema, String table) {
        super(schema, table);
    }

	protected SqlStatementsBuilder persist(final JsonObject resource, SqlStatementsBuilder statement) {
		if (statement == null) statement = new SqlStatementsBuilder();
		statement.insert(resourceTable, resource, "*");
		return statement;
	}

    /**
     * Persists a resource.
     *
     * @param resource the resource
     * @param user the current user
     * @param statement the current statement
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder persist(final JsonObject resource, final UserInfos user, SqlStatementsBuilder statement) {
		if (statement == null) statement = new SqlStatementsBuilder();
		String userQuery = "SELECT " + schema + "merge_users(?,?)";
        statement.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));
        statement.insert(resourceTable, resource, "*");
        
        return statement;
    }

    /**
     * Persists a resource which contains another owner as the current user.
     *
     * @param resource the resource
     * @param user the current user
     * @param statement the current statement
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder persistWithAnotherOwner(final JsonObject resource, SqlStatementsBuilder statement) {
		if (statement == null) statement = new SqlStatementsBuilder();
        String anotherOwnerQuery = "SELECT " + schema + "merge_users(?,?)";
        statement.prepared(anotherOwnerQuery, new JsonArray().add(resource.getString("owner")).add(resource.getString("owner_username")));
        
        statement.insert(resourceTable, resource, "*");
        
        return statement;
    }

    /**
     * Deletes a resource.
     *
     * @param id the id
     * @param column the column
     * @param statement the current statement
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder delete(final Number id, final String column) {
		SqlStatementsBuilder statement = new SqlStatementsBuilder();
		String deleteQuery = "DELETE FROM " + resourceTable + " WHERE id = ?";
        statement.prepared(deleteQuery, new JsonArray().add(id));
      
        return statement;
    }
    
}
