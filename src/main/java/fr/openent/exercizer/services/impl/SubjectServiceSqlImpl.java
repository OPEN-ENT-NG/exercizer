package fr.openent.exercizer.services.impl;

import java.util.List;

import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import fr.wseduc.webutils.Either;
import fr.openent.exercizer.services.ISubjectService;

public class SubjectServiceSqlImpl extends SqlCrudService implements ISubjectService {

    public SubjectServiceSqlImpl() {
        super("exercizer", "subject");
    }

    @Override
    public void persist(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        super.create(resource, user, handler);
    }

    @Override
    public void update(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        super.update(resource.getString("id"), resource, user, handler);
    }

    @Override
    public void remove(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        super.update(resource.getString("id"), resource, user, handler);
    }

    @Override
    public void list(List<String> groupsAndUserIds, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder();
        JsonArray values = new JsonArray();

        query.append("SELECT s.*,")
                .append(" json_agg(row_to_json(row(subject_shares.member_id,subject_shares.action)::exercizer.subject_shares)) as shared,")
                .append(" array_to_json(array_agg(m.group_id)) as groups")
                .append(" FROM exercizer.subject AS s")
                .append(" LEFT JOIN exercizer.subject_shares AS ss ON s.id = ss.resource_id")
                .append(" LEFT JOIN exercizer.members AS m ON (ss.member_id = m.id AND m.group_id IS NOT NULL)");

        query.append(" WHERE ss.member_id IN ").append(Sql.listPrepared(groupsAndUserIds.toArray()));
        for (String groupOrUser : groupsAndUserIds) {
            values.add(groupOrUser);
        }

        query.append(" OR s.owner = ? ");
        values.add(user.getUserId());

        query.append(" GROUP BY s.id").append(" ORDER BY s.id");

        Sql.getInstance().prepared(query.toString(), values, SqlResult.parseShared(handler));
    }
}