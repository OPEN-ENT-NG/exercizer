package fr.openent.exercizer.events;

import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.security.ActionType;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Vertx;
import org.entcore.common.service.impl.SqlRepositoryEvents;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class ExercizerRepositoryEvents extends SqlRepositoryEvents {

    private static final Logger log = LoggerFactory.getLogger(ExercizerRepositoryEvents.class);
    private Map<String, SecuredAction> securedActions;
    private String actionType;

    public ExercizerRepositoryEvents(Map<String, SecuredAction> securedActions, String actionType, Vertx vertx) {
        super(vertx);
        this.securedActions = securedActions;
        this.actionType = actionType;
        this.mainResourceName = "subject";
    }

    @Override
    public void exportResources(JsonArray resourcesIds, String exportId, String userId, JsonArray groups, String exportPath,
                                String locale, String host, Handler<Boolean> handler) {

            final HashMap<String,JsonArray> queries = new HashMap<String, JsonArray>();


            final String folderTable = "exercizer.folder",
                    subjectTable = "exercizer.subject",
                    subjectScheduledTable = "exercizer.subject_scheduled",
                    subjectCopyTable = "exercizer.subject_copy",
                    subjectShareTable = "exercizer.subject_shares",
                    grainTable = "exercizer.grain",
                    membersTable = "exercizer.members";
            final boolean exportSubjectPathFolders = false;

            JsonArray userIdParamTwice = new JsonArray().add(userId).add(userId);
            JsonArray resourcesIdsAndUserIdParamTwice = userIdParamTwice;
            String resourcesList = "";
            HashMap<String, JsonArray> fieldsToNull = new HashMap<String, JsonArray>();

            if(resourcesIds != null)
            {
                resourcesIdsAndUserIdParamTwice = new JsonArray().addAll(resourcesIds).addAll(userIdParamTwice);
                resourcesList = Sql.listPrepared(resourcesIds);
                fieldsToNull.put(subjectTable, new JsonArray().add("folder_id"));
            }

            String queryFolder =
                "WITH RECURSIVE folder_path AS " +
                "( " +
                "  SELECT " +
                "    S.id AS sid, S.owner, F.id AS fid, F.parent_folder_id " +
                "  FROM " +
                "    exercizer.folder F " +
                "  INNER JOIN " +
                "    exercizer.subject S ON (F.id = S.folder_id) " +
                "UNION " +
                "  SELECT " +
                "    FP.sid, FP.owner, F.id, F.parent_folder_id " +
                "  FROM " +
                "    folder_path FP, exercizer.folder F " +
                "  WHERE FP.parent_folder_id = F.id " +
                ") " +
                "SELECT DISTINCT " +
                "  fol.*  " +
                "FROM " +
                "  exercizer.folder fol  " +
                "WHERE " +
                "  ( " +
                "    fol.owner = ? " +
                "    OR fol.id IN " +
                "    ( " +
                "      SELECT FP.fid " +
                "      FROM folder_path FP  " +
                "      WHERE FP.owner = ? " +
                "    ) " +
                "  ) " +
                ( resourcesIds == null ? "" :
                    exportSubjectPathFolders == true ?
                    "  AND fol.id IN " +
                    "  ( " +
                    "    SELECT FP.fid " +
                    "    FROM folder_path FP " +
                    "    WHERE FP.sid IN " + resourcesList + " " +
                    "  ) "
                    :
                    "AND 1 = 0"
                );

            queries.put(folderTable,new SqlStatementsBuilder().prepared(queryFolder,userIdParamTwice).build());

            String querySubject =
                    "SELECT DISTINCT sub.* " +
                            "FROM " + subjectTable + " sub " +
                            "LEFT JOIN " + subjectScheduledTable + " subSche ON sub.id = subSche.subject_id " +
                            "LEFT JOIN " +subjectCopyTable + " subCo ON subSche.id = subCo.subject_scheduled_id " +
                            "LEFT JOIN " + subjectShareTable + " subSh ON sub.id = subSh.resource_id " +
                            "LEFT JOIN " + membersTable + " mem ON subSh.member_id = mem.id " +
                            "WHERE " +
                            (resourcesIds != null ? ("sub.id IN " + resourcesList + " AND ") : "") +
                            "(sub.owner = ? " +
                            "OR subCo.owner = ? " +
                            "OR mem.user_id = ? " +
                            ((groups !=  null && !groups.isEmpty()) ? " OR mem.group_id IN " + Sql.listPrepared(groups.getList()) : "") + ")";
            JsonArray params = new JsonArray().addAll(resourcesIdsAndUserIdParamTwice).add(userId).addAll(groups);
            queries.put(subjectTable,new SqlStatementsBuilder().prepared(querySubject,params).build());

            String queryGrain =
                    "SELECT DISTINCT grain.* " +
                            "FROM " + grainTable + " " +
                            "WHERE grain.subject_id IN (" + querySubject.replace("*","id") + ")";
            queries.put(grainTable,new SqlStatementsBuilder().prepared(queryGrain,params).build());

            AtomicBoolean exported = new AtomicBoolean(false);

            createExportDirectory(exportPath, locale, new Handler<String>() {
                @Override
                public void handle(String path) {
                    if (path != null) {
                        exportTables(queries, new JsonArray(), fieldsToNull, path, exported, handler);
                    }
                    else {
                        handler.handle(exported.get());
                    }
                }
            });
    }

    @Override
    public void importResources(String importId, String userId, String userLogin, String username, String importPath, String locale,
        String host, boolean forceImportAsDuplication, Handler<JsonObject> handler)
    {
        // We first need to recreate members and users rows
        SqlStatementsBuilder builder = new SqlStatementsBuilder();
        builder.prepared("INSERT INTO exercizer.users (id, username) VALUES (?,?) ON CONFLICT DO NOTHING",
                new JsonArray().add(userId).add(username));
        builder.prepared("INSERT INTO exercizer.members (id, user_id) VALUES (?,?) ON CONFLICT DO NOTHING",
                new JsonArray().add(userId).add(userId));

        sql.transaction(builder.build(), message -> {
            if ("ok".equals(message.body().getString("status"))) {

                List<String> tables = new ArrayList<>(Arrays.asList("folder", "subject", "grain"));
                Map<String,String> tablesWithId = new HashMap<>();
                tablesWithId.put("folder", "DEFAULT");
                tablesWithId.put("subject", "DEFAULT");
                tablesWithId.put("grain", "DEFAULT");

                importTables(importPath, "exercizer", tables, tablesWithId, userId, username, locale,
                    new SqlStatementsBuilder(), forceImportAsDuplication, handler);
            } else {
                log.error(title	+ " : Failed to create users/members for import." + message.body().getString("message"));
                handler.handle(new JsonObject().put("status", "error"));
            }
        });

    }

    @Override
    public JsonArray transformResults(JsonArray fields, JsonArray results, String userId, String username, SqlStatementsBuilder builder,
        String table, boolean forceImportAsDuplication, String duplicateSuffix) {

        final int index = fields.getList().indexOf("owner");
        final int indexUsername = fields.getList().indexOf("owner_username");
        results.forEach(res -> {
            if (index != -1) {
                ((JsonArray) res).getList().set(index, userId);
            }
            if (indexUsername != -1) {
                ((JsonArray)res).getList().set(indexUsername,username);
            }
        });

        // Re-orders items to avoid breaking foreign key constraint
        final int indexId = fields.getList().indexOf("id");
        Collections.sort(results.getList(), (a,b) -> new JsonArray((List)a).getInteger(indexId).compareTo(new JsonArray((List)b).getInteger(indexId)));

        if ("subject".equals(table) || "folder".equals(table)) {
            final int titleId = fields.getList().indexOf("title");
            final int parentId = fields.getList().indexOf("subject".equals(table) ? "original_subject_id" : "parent_folder_id");

            label:
            for (int i = 0; i < results.size(); ) {
                if (forceImportAsDuplication == true) {
                    JsonArray row = results.getJsonArray(i);

                    if (titleId != -1)
                        row.getList().set(titleId, row.getString(titleId) + duplicateSuffix);
                }

                Integer parent = results.getJsonArray(i).getInteger(parentId);
                if (parent != null) {
                    for (int j = i; j < results.size(); j++) {
                        Integer id = results.getJsonArray(j).getInteger(indexId);
                        if (id.equals(parent)) {
                            JsonArray tmp = results.getJsonArray(i);
                            results.getList().set(i, results.getJsonArray(j));
                            results.getList().set(j, tmp);
                            continue label;
                        }
                    }
                }
                i++;
            }
        }

        return results;
    }

    @Override
    public void deleteGroups(JsonArray groups) {
        if(groups == null || groups.size() == 0){
            log.warn("[ExercizerRepositoryEvents][deleteGroups] groups is empty");
            return;
        }

        final JsonArray userIds = new fr.wseduc.webutils.collections.JsonArray();
        for (Object obj : groups){
            if (!(obj instanceof JsonObject)) continue;
            final JsonObject j = (JsonObject)obj;
            final JsonArray users = j.getJsonArray("users");
            if (users != null) {
                for (Object s : users) {
                    userIds.add(s);
                }
            }
        }

        if (userIds.size() != 0) {

            SqlStatementsBuilder builder = new SqlStatementsBuilder();
            builder.prepared("UPDATE exercizer.subject_scheduled SET is_archived = true WHERE owner IN " + Sql.listPrepared(userIds.getList()), userIds);
            builder.prepared("UPDATE exercizer.subject_copy SET is_archived = true WHERE owner IN " + Sql.listPrepared(userIds.getList()), userIds);

            Sql.getInstance().transaction(builder.build(), SqlResult.validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
                @Override
                public void handle(Either<String, JsonObject> event) {
                    if (event.isRight()) {
                        log.info("[ExercizerRepositoryEvents][deleteGroups] The resources created by users are archived");
                    } else {
                        log.warn("[ExercizerRepositoryEvents][deleteGroups] Error archiving the resources created by users " + event.left().getValue());
                    }
                }
            }));
        }

    }

    @Override
    public void deleteUsers(JsonArray users) {

        if(users == null || users.size() == 0){
            log.warn("[ExercizerRepositoryEvents][deleteUsers] users is empty");
            return;
        }

        final JsonArray userIds = new fr.wseduc.webutils.collections.JsonArray();
        final JsonArray managersActions = new fr.wseduc.webutils.collections.JsonArray();
        final JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
        for (Object obj : users){
            if (!(obj instanceof JsonObject)) continue;
            final JsonObject j = (JsonObject)obj;
            userIds.add(j.getString("id"));
            values.add(j.getString("id"));
        }

        //Get managers actions
        for (SecuredAction action : securedActions.values()) {
            if (ActionType.RESOURCE.name().equals(action.getType()) && !action.getDisplayName().isEmpty()) {
                if (action.getDisplayName().equals(this.actionType)) {
                    managersActions.add(action.getName());
                    values.add(action.getName().replace(".", "-"));
                }
            }
        }

        if (userIds.size() > 0) {

            SqlStatementsBuilder builder = new SqlStatementsBuilder();
            builder.prepared("UPDATE exercizer.users SET is_deleted = true WHERE id IN " + Sql.listPrepared(userIds.getList()), userIds);

            builder.prepared("UPDATE exercizer.subject_scheduled SET is_deleted = true WHERE owner IN " + Sql.listPrepared(userIds.getList()), userIds);

            builder.prepared("UPDATE exercizer.subject_copy SET is_deleted = true WHERE owner IN " + Sql.listPrepared(userIds.getList()), userIds);

            String query = "UPDATE exercizer.subject AS s SET is_deleted = true" +
                    " WHERE s.is_library_subject = false" +
                    " AND s.owner IN " + Sql.listPrepared(userIds.getList()) +
                    " AND NOT EXISTS (SELECT 1 FROM exercizer.subject_shares as ss WHERE ss.resource_id = s.id" +
                    " AND ss.member_id IN (SELECT m.id FROM exercizer.members AS m INNER JOIN exercizer.users AS u ON m.user_id = u.id WHERE u.is_deleted = false)" +
                    " AND ss.action IN " + Sql.listPrepared(managersActions.getList()) + ")";

            builder.prepared(query, values);

            Sql.getInstance().transaction(builder.build(), SqlResult.validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
                @Override
                public void handle(Either<String, JsonObject> event) {
                    if (event.isRight()) {
                        log.info("[ExercizerRepositoryEvents][deleteUsers] The resources created by users are deleted");
                    } else {
                        log.warn("[ExercizerRepositoryEvents][deleteUsers] Error deleting the resources created by users : " + event.left().getValue());

                    }
                }
            }));
        }
    }
}
