package fr.openent.exercizer.services.impl;

import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.security.ActionType;
import fr.wseduc.webutils.security.SecuredAction;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.RepositoryEvents;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.Map;

public class ExercizerRepositoryEvents implements RepositoryEvents {

    private static final Logger log = LoggerFactory.getLogger(ExercizerRepositoryEvents.class);
    private Map<String, SecuredAction> securedActions;
    private String actionType;

    public ExercizerRepositoryEvents(Map<String, SecuredAction> securedActions, String actionType) {
        this.securedActions = securedActions;
        this.actionType = actionType;
    }

    @Override
    public void exportResources(String exportId, String userId, JsonArray groups, String exportPath, String locale, String host, Handler<Boolean> handler) {

    }

    @Override
    public void deleteGroups(JsonArray groups) {
        if(groups == null || groups.size() == 0){
            log.warn("[ExercizerRepositoryEvents][deleteGroups] groups is empty");
        }

        JsonArray users;
        JsonArray userIds = new JsonArray();
        for (Object obj : groups){
            JsonObject j = (JsonObject)obj;
            users = j.getArray("users");
            for(Object s : users){
                userIds.add(s);
            }
        }

        SqlStatementsBuilder builder = new SqlStatementsBuilder();

        builder.prepared("UPDATE exercizer.subject_scheduled SET is_archived = true WHERE owner IN " + Sql.listPrepared(userIds.toArray()), userIds);

        builder.prepared("UPDATE exercizer.subject_copy SET is_archived = true WHERE owner IN " + Sql.listPrepared(userIds.toArray()), userIds);

        Sql.getInstance().transaction(builder.build(), SqlResult.validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if(event.isRight()){
                    log.info("[ExercizerRepositoryEvents][deleteGroups] The resources created by users are archived");
                }else {
                    log.warn("[ExercizerRepositoryEvents][deleteGroups] Error archiving the resources created by users " +  event.left().getValue() );
                }
            }
        }));

    }

    @Override
    public void deleteUsers(JsonArray users) {

        if(users == null || users.size() == 0){
            log.warn("[ExercizerRepositoryEvents][deleteUsers] users is empty");
            return;
        }

        final JsonArray userIds = new JsonArray();
        final JsonArray managersActions = new JsonArray();
        final JsonArray values = new JsonArray();
        for (Object obj : users){
            JsonObject j = (JsonObject)obj;
            userIds.addString(j.getString("id"));
            values.addString(j.getString("id"));
        }

        //Get managers actions
        for (SecuredAction action : securedActions.values()) {
            if (ActionType.RESOURCE.name().equals(action.getType()) && !action.getDisplayName().isEmpty()) {
                if (action.getDisplayName().equals(this.actionType)) {
                    managersActions.addString(action.getName());
                    values.addString(action.getName().replace(".", "-"));
                }
            }
        }

        SqlStatementsBuilder builder = new SqlStatementsBuilder();
        builder.prepared("UPDATE exercizer.users SET is_deleted = true WHERE id IN " + Sql.listPrepared(userIds.toArray()), userIds);

        builder.prepared("UPDATE exercizer.subject_scheduled SET is_deleted = true WHERE owner IN " + Sql.listPrepared(userIds.toArray()), userIds);

        builder.prepared("UPDATE exercizer.subject_copy SET is_deleted = true WHERE owner IN " + Sql.listPrepared(userIds.toArray()), userIds);

        String query = "UPDATE exercizer.subject AS s SET is_deleted = true" +
                " WHERE s.is_library_subject = false" +
                " AND s.owner IN " + Sql.listPrepared(userIds.toArray()) +
                " AND NOT EXISTS (SELECT 1 FROM exercizer.subject_shares as ss WHERE ss.resource_id = s.id" +
                " AND ss.member_id IN (SELECT m.id FROM exercizer.members AS m INNER JOIN exercizer.users AS u ON m.user_id = u.id WHERE u.is_deleted = false)" +
                " AND ss.action IN " + Sql.listPrepared(managersActions.toArray())+")";

        builder.prepared(query, values);

        Sql.getInstance().transaction(builder.build(), SqlResult.validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if(event.isRight()){
                    log.info("[ExercizerRepositoryEvents][deleteUsers] The resources created by users are deleted");
                }else {
                    log.warn("[ExercizerRepositoryEvents][deleteUsers] Error deleting the resources created by users : " + event.left().getValue());

                }
            }
        }));
    }
}
