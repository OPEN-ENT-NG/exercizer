package fr.openent.exercizer.services.impl;

import fr.wseduc.webutils.Either;

import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import static org.entcore.common.sql.Sql.parseId;
import static org.entcore.common.sql.SqlResult.validRowsResultHandler;
import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

abstract class AbstractExercizerServiceSqlImpl extends SqlCrudService {

    AbstractExercizerServiceSqlImpl(String schema, String table, String shareTable) {
        super(schema, table, shareTable);
    }

    AbstractExercizerServiceSqlImpl(String schema, String table) {
        super(schema, table);
    }

    protected void persist(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        SqlStatementsBuilder s = new SqlStatementsBuilder();
        String userQuery = "SELECT " + schema + "merge_users(?,?)";
        s.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));

        resource.putString("owner", user.getUserId());
        s.insert(resourceTable, resource, "*");
        sql.transaction(s.build(), validUniqueResultHandler(1, handler));
    }

    protected void update(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        StringBuilder sb = new StringBuilder();
        JsonArray values = new JsonArray();

        for (String attr : resource.getFieldNames()) {
            sb.append(attr).append(" = ?, ");
            values.add(resource.getValue(attr));
        }

        String updateQuery = "UPDATE " + schema + resourceTable + " SET " + sb.toString() + "modified = NOW() " + "WHERE id = ? RETURNING *";
        sql.prepared(updateQuery, values.add(parseId(resource.getString("id"))), validRowsResultHandler(handler));
    }

    protected void remove(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        resource.putBoolean("is_deleted", true);
        update(resource, user, handler);
    }

    protected void delete(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        super.delete(resource.getString("id"), user, handler);
    }
}
