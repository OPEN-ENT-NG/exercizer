package fr.openent.exercizer.services.impl;

import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;


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
        SqlStatementsBuilder s = new SqlStatementsBuilder();
        String userQuery = "SELECT " + schema + "merge_users(?,?)";
        s.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));
        s.insert(resourceTable, resource, "*");
        
        return s;
    }
    
    /**
     * Gets a resource by id.
     *
     * @param id
     * @param user the current user
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder getById(final String id, final UserInfos user) {
    	SqlStatementsBuilder s = new SqlStatementsBuilder();
        String getQuery = "SELECT * FROM " + resourceTable  + " WHERE id = ?";
        s.prepared(getQuery, new JsonArray().add(Integer.parseInt(id)));
        
        return s; 
    }
    
    /**
     * Persists a resource which contains another owner as the current user.
     *
     * @param resource the resource
     * @param user the current user
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder persistWithAnotherOwner(final JsonObject resource, final UserInfos user) {
        SqlStatementsBuilder s = new SqlStatementsBuilder();
        
        String userQuery = "SELECT " + schema + "merge_users(?,?)";
        s.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));
        
        String anotherOwnerQuery = "SELECT " + schema + "merge_users(?,?)";
        s.prepared(anotherOwnerQuery, new JsonArray().add(resource.getString("owner")).add(resource.getString("owner_username")));
        
        s.insert(resourceTable, resource, "*");
        
        return s;
    }

    /**
     * Updates a resource.
     *
     * @param resource the resource
     * @param user the current user
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder update(final JsonObject resource, final UserInfos user) {
    	SqlStatementsBuilder s = new SqlStatementsBuilder();
    	StringBuilder query = new StringBuilder();
        JsonArray values = new JsonArray();

        for (String attr : resource.getFieldNames()) {
                query.append(attr).append(" = ?, ");
                values.add(resource.getValue(attr));
        }

        String updateQuery = "UPDATE " + resourceTable + " SET " + query.toString() + "modified = NOW() " + "WHERE id = ? RETURNING *";
        s.prepared(updateQuery, values.add(resource.getInteger("id")));
        
        return s;
    }

    /**
     * Deletes a resource.
     *
     * @param resource the resource
     * @param user the current user
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder delete(final JsonObject resource, final UserInfos user) {
    	SqlStatementsBuilder s = new SqlStatementsBuilder();
    	String query = "DELETE FROM " + resourceTable + " WHERE id = ? RETURNING *";
		s.prepared(query, new JsonArray().add(resource.getInteger("id")));
		
		return s;
    }
    
    /**
     * List resources according to parameters.
     * 
     * @param resourceAlias the resource alias
     * @param joins the joins
     * @param filters the filters
     * @param orderBy the orders by
     * @param limit the limit
     * @param offset the offset
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder list(final String resourceAlias, final JsonArray joins, final JsonArray filters, final JsonArray orderBy, final String limit, final String offset) {
    	SqlStatementsBuilder s = new SqlStatementsBuilder();
    	StringBuilder query = new StringBuilder();
    	
    	query.append("SELECT ").append(resourceAlias).append(".* FROM ").append(resourceTable).append(" AS ").append(resourceAlias);
    	
    	if (joins != null && joins.size() > 0) {
    		for (Object join : joins) {
                query.append(" ").append(join);
            }
    	}
    	
    	if (filters != null && filters.size() > 0) {
            for (Object filter : filters) {
                query.append(" ").append(filter);
            }
    	}
    	
    	if (orderBy != null && orderBy.size() > 0) {
    		for (Object currentOrderBy : orderBy) {
                query.append(" ").append(currentOrderBy);
            }
    		
    		if (limit != null && offset != null && limit.length() > 0 && offset.length() > 0) {
    			query.append(" LIMIT ").append(limit).append(" OFFSET ").append(offset);
    		}
    	}
    	
    	s.prepared(query.toString(), new JsonArray());
    	
    	return s;
    }
    
    /**
     * Count resources according to parameters.
     * 
     * @param resourceAlias the resource alias
     * @param joins the joins
     * @param filters the filters
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder count(final String resourceAlias, final JsonArray joins, final JsonArray filters) {
    	SqlStatementsBuilder s = new SqlStatementsBuilder();
    	StringBuilder query = new StringBuilder();
    	
    	query.append("SELECT COUNT(").append(resourceAlias).append(".*) FROM ").append(resourceTable).append(" AS ").append(resourceAlias);
    	
    	if (joins != null && joins.size() > 0) {
    		for (Object join : joins) {
                query.append(" ").append(join);
            }
    	}
    	
    	if (filters != null && filters.size() > 0) {
            for (Object filter : filters) {
                query.append(" ").append(filter);
            }
    	}
    	
    	s.prepared(query.toString(), new JsonArray());
    	
    	return s;
    }

    /**
     * Returns the list of shared resources according to the current user.
     *
     * @param filters some custom filters
     * @param groupsAndUserIds the groups and user ids
     * @param user the current user
     * @return SqlStatementsBuilder
     */
    protected SqlStatementsBuilder list(final JsonArray filters, final List<String> groupsAndUserIds, final UserInfos user) {
    	SqlStatementsBuilder s = new SqlStatementsBuilder();
    	StringBuilder query = new StringBuilder();
        JsonArray values = new JsonArray();

        query.append("SELECT r.*,")
                .append(" json_agg(row_to_json(row(rs.member_id,rs.action)::")
                .append(schema)
                .append("share_tuple)) AS shared,")
                .append(" array_to_json(array_agg(m.group_id)) AS groups")
                .append(" FROM ")
                .append(resourceTable)
                .append(" AS r")
                .append(" LEFT JOIN ")
                .append(shareTable)
                .append(" AS rs ON r.id = rs.resource_id")
                .append(" LEFT JOIN ")
                .append(schema)
                .append("members as m ON (rs.member_id = m.id AND m.group_id IS NOT NULL)");

        query.append(" WHERE (rs.member_id IN ").append(Sql.listPrepared((groupsAndUserIds.toArray())));
        
        for (String groupOrUser : groupsAndUserIds) {
            values.add(groupOrUser);
        }

        query.append(" OR r.owner = ?) ");
        values.add(user.getUserId());

        if (filters.size() > 0 ) {
            for (Object filter : filters) {
                query.append(" AND ").append(filter.toString());
            }
        }

        query.append(" GROUP BY r.id").append(" ORDER BY r.id");

        s.prepared(query.toString(), values);
        
        return s;
    }
    
}
