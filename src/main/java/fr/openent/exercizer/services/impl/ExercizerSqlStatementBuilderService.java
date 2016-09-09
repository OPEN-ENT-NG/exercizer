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

    /**
     * Persists a resource.
     *
     * @param resource the resource
     * @param user the current user
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder persist(final JsonObject resource, final UserInfos user) {
        SqlStatementsBuilder statement = new SqlStatementsBuilder();
        String userQuery = "SELECT " + schema + "merge_users(?,?)";
        statement.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));
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
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder persistWithAnotherOwner(final JsonObject resource, final UserInfos user) {
        SqlStatementsBuilder statement = new SqlStatementsBuilder();
        
        String userQuery = "SELECT " + schema + "merge_users(?,?)";
        statement.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));
        
        String anotherOwnerQuery = "SELECT " + schema + "merge_users(?,?)";
        statement.prepared(anotherOwnerQuery, new JsonArray().add(resource.getString("owner")).add(resource.getString("owner_username")));
        
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
    protected SqlStatementsBuilder persistWithAnotherOwner(final JsonObject resource, final UserInfos user, SqlStatementsBuilder statement) {        
        String userQuery = "SELECT " + schema + "merge_users(?,?)";
        statement.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));
        
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
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder delete(final Number id, final String column) {
    	SqlStatementsBuilder statement = new SqlStatementsBuilder();
        String deleteQuery = "DELERE FROM " + resourceTable + " WHERE id = ?";
        statement.prepared(deleteQuery, new JsonArray().add(id));
      
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
    protected SqlStatementsBuilder delete(final Number id, final String column, SqlStatementsBuilder statement) {        
        String deleteQuery = "DELERE FROM " + resourceTable + " WHERE id = ?";
        statement.prepared(deleteQuery, new JsonArray().add(id));
      
        return statement;
    }
    
}
