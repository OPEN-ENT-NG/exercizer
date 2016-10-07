package fr.openent.exercizer.services.impl;

import fr.wseduc.webutils.Either;

import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

abstract class AbstractExercizerServiceSqlImpl extends SqlCrudService {

    AbstractExercizerServiceSqlImpl(String schema, String table, String shareTable) {
        super(schema, table, shareTable);
    }

    AbstractExercizerServiceSqlImpl(String schema, String table) {
        super(schema, table);
    }

	protected void persist(final JsonObject resource, final Handler<Either<String, JsonObject>> handler) {
		sql.transaction(
				new SqlStatementsBuilder().insert(resourceTable, resource, "*").build(),
				SqlResult.validUniqueResultHandler(0, handler));
	}

	/**
	 * Persists a resource and merge de owner in users table
	 *
	 * @param resource the resource
	 * @param user the current user
	 * @param handler the handler
	 */
	protected void persist (final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		SqlStatementsBuilder s = new SqlStatementsBuilder();
		String userQuery = "SELECT " + schema + "merge_users(?,?)";
		s.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));

		s.insert(resourceTable, resource, "*");
		sql.transaction(s.build(), SqlResult.validUniqueResultHandler(1, handler));
	}

    /**
     * get a ressource by id.
     *
     * @param id
     * @param user the current user
     * @param handler the handler
     */
    protected void getById(final String id, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String getQuery = "SELECT * FROM " + resourceTable  + " WHERE id = ?";
        Integer id_integer = Integer.parseInt(id);

        sql.prepared(getQuery, values.add(id_integer), SqlResult.validUniqueResultHandler(handler));    
    }
    
    /**
     * Persists a resource which contains another owner as the current user.
     *
     * @param resource the resource
     * @param handler the handler
     */
    protected void persistWithAnotherOwner(final JsonObject resource, final Handler<Either<String, JsonObject>> handler) {
        SqlStatementsBuilder s = new SqlStatementsBuilder();
        String anotherOwnerQuery = "SELECT " + schema + "merge_users(?,?)";
        s.prepared(anotherOwnerQuery, new JsonArray().add(resource.getString("owner")).add(resource.getString("owner_username")));
        
        s.insert(resourceTable, resource, "*");
        sql.transaction(s.build(), SqlResult.validUniqueResultHandler(2, handler));
    }

    /**
     * Updates a resource.
     *
     * @param resource the resource
     * @param user the current user
     * @param handler the handler
     */
    protected void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        StringBuilder query = new StringBuilder();
        JsonArray values = new JsonArray();

        for (String attr : resource.getFieldNames()) {
                query.append(attr).append(" = ?, ");
                values.add(resource.getValue(attr));
        }

        String updateQuery = "UPDATE " + resourceTable + " SET " + query.toString() + "modified = NOW() " + "WHERE id = ? RETURNING *";
		sql.prepared(updateQuery, values.add(resource.getInteger("id")), SqlResult.validUniqueResultHandler(handler));
    }

    /**
     * Deletes a resource.
     *
     * @param resource the resource
     * @param user the current user
     * @param handler the handler
     */
    protected void delete(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	String query = "DELETE FROM " + resourceTable + " WHERE id = ? RETURNING *";
		sql.prepared(query, new JsonArray().add(resource.getInteger("id")), SqlResult.validUniqueResultHandler(handler));
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
     * @param handler the handler
     */
    protected void list(final String resourceAlias, final JsonArray joins, final JsonArray filters, final JsonArray orderBy, final String limit, final String offset, final Handler<Either<String, JsonArray>> handler) {
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
    	
    	sql.prepared(query.toString(), new JsonArray(), SqlResult.validResultHandler(handler)); 
    }
    
    /**
     * Count resources according to parameters.
     * 
     * @param resourceAlias the resource alias
     * @param joins the joins
     * @param filters the filters
     * @param handler the handler
     */
    protected void count(final String resourceAlias, final JsonArray joins, final JsonArray filters, final Handler<Either<String, JsonObject>> handler) {
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
    	
    	sql.prepared(query.toString(), new JsonArray(), SqlResult.validUniqueResultHandler(handler)); 
    }
    
    /**
     * Returns the list of resources.
     *
     * @param filters some custom filters
     * @param handler the handler
     * @deprecated
     */
    protected void list(final JsonArray filters, final Handler<Either<String, JsonArray>> handler) {
    	StringBuilder query = new StringBuilder();
    	
    	query.append("SELECT * FROM ").append(resourceTable);
    	
    	if (filters.size() > 0 ) {
    		query.append(" WHERE true");
            for (Object filter : filters) {
                query.append(" AND ").append(filter.toString());
            }
        }
    	
    	query.append(" ORDER BY created DESC");
    	sql.prepared(query.toString(), new JsonArray(), SqlResult.validResultHandler(handler));
    }

    /**
     * Returns the list of resources which have the current user as owner.
     *
     * @param user the current user
     * @param handler the handler
     */
    protected void list(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list(VisibilityFilter.OWNER, user, handler);
    }

    /**
     * Returns the list of shared resources according to the current user.
     *
     * @param filters some custom filters
     * @param groupsAndUserIds the groups and user ids
     * @param user the current user
     * @param handler the handler
     */
    protected void list(final JsonArray filters, final List<String> groupsAndUserIds, final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
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

        sql.prepared(query.toString(), values, SqlResult.parseShared(handler));
    }

    /**
     * Returns a list of resources according to another resource.
     *
     * @param resource the resource
     * @param resourceIdentifierName the other resource identifier in the resource table
     * @param resourceTable the other resource table (with schema)
     * @param handler the handler
     * @deprecated
     */
    protected void list(final JsonObject resource, final String resourceIdentifierName, final String resourceTable, final Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder();

        query.append("SELECT o.*")
                .append(" FROM ")
                .append(super.resourceTable)
                .append(" AS o")
                .append(" JOIN ")
                .append(resourceTable)
                .append(" AS r ON r.id = o.")
                .append(resourceIdentifierName)
                .append(" WHERE r.id = ?");

        sql.prepared(query.toString(), new JsonArray().add(resource.getInteger("id")), SqlResult.validResultHandler(handler));
    }

    /**
     * Returns a list of resources according to another resource which belongs to the current user.
     *
     * @param resourceIdentifierName the other resource identifier in the resource table
     * @param resourceTable the other resource table (with schema)
     * @param invert useful for some case
     * @param user the current user
     * @param handler the handler
     * @deprecated
     */
    protected void list(final String resourceIdentifierName, final String resourceTable, final Boolean invert, final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder();

        query.append("SELECT o.*")
                .append(" FROM ")
                .append(super.resourceTable)
                .append(" AS o")
                .append(" JOIN ")
                .append(resourceTable)
                .append(" AS r ON o.")
                .append(invert ? resourceIdentifierName : "id")
                .append(" = r.")
                .append(invert ? "id" : resourceIdentifierName)
                .append(" WHERE")
                .append(" r.owner = ?");

        sql.prepared(query.toString(), new JsonArray().add(user.getUserId()), SqlResult.validResultHandler(handler));
    }
}
