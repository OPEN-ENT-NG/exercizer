package fr.openent.exercizer.services.impl;

import java.util.ArrayList;
import java.util.List;

import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.webutils.Either;
import fr.openent.exercizer.services.SubjectService;

public class SubjectServiceSqlImpl implements SubjectService {

    /* ?
    ", json_agg(row_to_json(row(ts.member_id, ts.action)::actualites.share_tuple)) as shared" +
            ", array_to_json(array_agg(group_id)) as groups" +
    */

    @Override
    public void retrieve(String id, Handler<Either<String, JsonObject>> handler) {
        String query;
        JsonArray values = new JsonArray();
        if (id != null) {
            query = "SELECT s.id as _id, s.folder_id, s.original_subject_id, s.owner, s.created, s.modified, s.visibility, s.title, s.description, s.picture, s.is_library_subject, s.is_deleted" +
                    " FROM exercizer.subject AS s" +
                    " LEFT JOIN exercizer.users AS u ON s.owner = u.id" +
                    " LEFT JOIN exercizer.subject_shares AS ss ON s.id = ss.resource_id" +
                    " LEFT JOIN exercizer.members AS m ON (ss.member_id = m.id AND m.group_id IS NOT NULL)" +
                    " WHERE s.id = ? " +
                    " GROUP BY s.id, u.username" +
                    " ORDER BY s.modified DESC";
            values.add(Sql.parseId(id));
            Sql.getInstance().prepared(query.toString(), values, SqlResult.parseSharedUnique(handler));
        }
    }

    @Override
    public void retrieve(String id, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        String query;
        JsonArray values = new JsonArray();
        if (id != null && user != null) {
            List<String> groupsAndUserIds = new ArrayList<>();
            groupsAndUserIds.add(user.getUserId());
            if (user.getGroupsIds() != null) {
                groupsAndUserIds.addAll(user.getGroupsIds());
            }
            query = "SELECT s.id as _id, s.folder_id, s.original_subject_id, s.owner, s.created, s.modified, s.visibility, s.title, s.description, s.picture, s.is_library_subject, s.is_deleted" +
                    " FROM exercizer.subject AS s" +
                    " LEFT JOIN exercizer.users AS u ON s.owner = u.id" +
                    " LEFT JOIN exercizer.subject_shares AS ss ON s.id = ss.resource_id" +
                    " LEFT JOIN exercizer.members AS m ON (ss.member_id = m.id AND m.group_id IS NOT NULL)" +
                    " WHERE t.id = ? " +
                    " AND (ss.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) +
                    " OR s.owner = ?) " +
                    " GROUP BY s.id, u.username" +
                    " ORDER BY s.modified DESC";
            values.add(Sql.parseId(id));
            for (String value : groupsAndUserIds) {
                values.add(value);
            }
            values.add(user.getUserId());
            Sql.getInstance().prepared(query.toString(), values, SqlResult.parseSharedUnique(handler));
        }
    }

    @Override
    public void list(UserInfos user, Handler<Either<String, JsonArray>> handler) {
        String query;
        JsonArray values = new JsonArray();
        if (user != null) {
            List<String> gu = new ArrayList<>();
            gu.add(user.getUserId());
            if (user.getGroupsIds() != null) {
                gu.addAll(user.getGroupsIds());
            }
            final Object[] groupsAndUserIds = gu.toArray();
            query = "SELECT s.id as _id, s.folder_id, s.original_subject_id, s.owner, s.created, s.modified, s.visibility, s.title, s.description, s.picture, s.is_library_subject, s.is_deleted" +
                    " FROM exercizer.subject AS s" +
                    " LEFT JOIN exercizer.users AS u ON s.owner = u.id" +
                    " LEFT JOIN exercizer.subject_shares AS ss ON s.id = ss.resource_id" +
                    " LEFT JOIN exercizer.members AS m ON (ss.member_id = m.id AND m.group_id IS NOT NULL)" +
                    " WHERE ss.member_id IN " + Sql.listPrepared(groupsAndUserIds) +
                    " OR s.owner = ? " +
                    " GROUP BY s.id, u.username" +
                    " ORDER BY s.modified DESC";
            values = new JsonArray(groupsAndUserIds).add(user.getUserId());
            Sql.getInstance().prepared(query.toString(), values, SqlResult.parseShared(handler));
        }
    }

    @Override
    public void getPublishSharedWithIds(String subjectId, final Handler<Either<String, JsonArray>> handler) {
        this.retrieve(subjectId, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                JsonArray sharedWithIds = new JsonArray();
                if (event.isRight()) {
                    try {
                        JsonObject subject = event.right().getValue();
                        if (subject.containsField("owner")) {
                            JsonObject owner = new JsonObject();
                            owner.putString("userId", subject.getString("owner"));
                            sharedWithIds.add(owner);
                        }
                        if (subject.containsField("shared")) {
                            JsonArray shared = subject.getArray("shared");
                            for (Object jo : shared) {
                                if (((JsonObject) jo).containsField("net-atos-entng-actualites-controllers-InfoController|publish")) {
                                    sharedWithIds.add(jo);
                                }
                            }
                            handler.handle(new Either.Right<String, JsonArray>(sharedWithIds));
                        } else {
                            handler.handle(new Either.Right<String, JsonArray>(new JsonArray()));
                        }
                    } catch (Exception e) {
                        handler.handle(new Either.Left<String, JsonArray>("Malformed response : " + e.getClass().getName() + " : " + e.getMessage()));
                    }
                } else {
                    handler.handle(new Either.Left<String, JsonArray>(event.left().getValue()));
                }
            }
        });
    }
}