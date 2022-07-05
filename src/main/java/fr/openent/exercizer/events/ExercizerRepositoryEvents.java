package fr.openent.exercizer.events;

import fr.openent.exercizer.services.ISubjectService;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.security.ActionType;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.DeliveryOptions;

import org.entcore.common.folders.impl.StorageHelper;
import org.entcore.common.service.impl.SqlRepositoryEvents;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.storage.Storage;

import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.lang.reflect.Array;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class ExercizerRepositoryEvents extends SqlRepositoryEvents {

    private static final Logger log = LoggerFactory.getLogger(ExercizerRepositoryEvents.class);
    private Map<String, SecuredAction> securedActions;
    private String actionType;
    private final Storage storage;
    private String correctedTable = "exercizer.subject_document";

    public ExercizerRepositoryEvents(Map<String, SecuredAction> securedActions, String actionType, Vertx vertx, Storage storage) {
        super(vertx);
        this.securedActions = securedActions;
        this.actionType = actionType;
        this.mainResourceName = "subject";
        this.storage = storage;
    }

    @Override
    public void exportResources(JsonArray resourcesIds, boolean exportDocuments, boolean exportSharedResources, String exportId, String userId,
                                JsonArray groups, String exportPath, String locale, String host, Handler<Boolean> handler) {

            final HashMap<String,JsonArray> queries = new HashMap<String, JsonArray>();


            final String folderTable = "exercizer.folder",
                    subjectTable = "exercizer.subject",
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
                            "LEFT JOIN " + subjectShareTable + " subSh ON sub.id = subSh.resource_id " +
                            (exportSharedResources == true ? "" : "AND 1 = 0 ") +
                            "LEFT JOIN " + membersTable + " mem ON subSh.member_id = mem.id " +
                            "WHERE " +
                            (resourcesIds != null ? ("sub.id IN " + resourcesList + " AND ") : "") +
                            "(sub.owner = ? " +
                            "OR mem.user_id = ? " +
                            ((groups !=  null && !groups.isEmpty()) ? " OR mem.group_id IN " + Sql.listPrepared(groups.getList()) : "") + ")";
            JsonArray params = new JsonArray().addAll(resourcesIdsAndUserIdParamTwice).addAll(groups);
            queries.put(subjectTable,new SqlStatementsBuilder().prepared(querySubject,params).build());

            if( exportDocuments ) {
                String queryCorrected =
                        "SELECT DISTINCT cor.subject_id, cor.doc_type, cor.doc_id, cor.metadata " +
                        "FROM " + correctedTable + " cor " +
                        "WHERE cor.subject_id IN (" + querySubject.replace("*","id") + ")";
                queries.put(correctedTable,new SqlStatementsBuilder().prepared(queryCorrected,params).build());
            }

            String queryGrain =
                    "SELECT DISTINCT grain.* " +
                            "FROM " + grainTable + " " +
                            "WHERE grain.subject_id IN (" + querySubject.replace("*","id") + ")";
            queries.put(grainTable,new SqlStatementsBuilder().prepared(queryGrain,params).build());

            AtomicBoolean exported = new AtomicBoolean(false);

            createExportDirectory(exportPath, locale, path -> {
                if (path != null) {
                    exportTables(queries, new JsonArray(), fieldsToNull, exportDocuments, path, exported, handler);
                }
                else {
                    handler.handle(exported.get());
                }
            });
    }

    /** 
     * On exercizer.subject_document table:
     * - for "storage" documents, also export the associated physical files.
     * - for 'workspace' documents, they should not exist (dropped functionality on 2022-05-30) and are ignored.
     */
    @Override
    protected Future<Void> beforeExportingTableToPath(boolean exportDocuments, String exportPath, String tableName, final JsonArray fields, final JsonArray rows) {
        if( !exportDocuments || !correctedTable.equals(tableName) ) {
            return Future.succeededFuture();
        }
        int docTypeIdx = -1;
        int docIdIdx = -1;
        for( int i=0; i<fields.size(); i++ ) {
            String field = fields.getString(i);
            if("doc_type".equals(field)) {
                docTypeIdx=i;
            } else if("doc_id".equals(field)) {
                docIdIdx=i;
            }
        }
        if( docTypeIdx < 0 || docIdIdx < 0 ) {
            return Future.succeededFuture();
        }

        final List<Future> futures = new ArrayList<>(rows.size());
        
        for( int i=rows.size()-1; i>=0; i-- ) {
            JsonArray row = rows.getJsonArray(i);
            if( row == null ) continue;
            if( ISubjectService.DocType.WORKSPACE.getKey().equals(row.getString(docTypeIdx)) ) {
                log.info("[ExercizerRepositoryEvents][beforeExportingTableToPath] Unsupported doc_type 'workspace' => skipping document");
                rows.remove( i );
                continue;
            }
            final String fileId = row.getString(docIdIdx);
            if( fileId == null || fileId.length() == 0 ) {
                log.info("[ExercizerRepositoryEvents][beforeExportingTableToPath] Null or empty doc_id => skipping document");
                rows.remove( i );
                continue;
            }
            final Promise<Void> promise = Promise.promise();
            final int idx = i;
            storage.copyFileId(fileId, exportPath+ java.io.File.separator +fileId, res -> {
                if( "error".equals(res.getString("status")) ) {
                    log.error("[ExercizerRepositoryEvents][beforeExportingTableToPath] File export failed."+ res.getString("message"));
                    rows.remove( idx );
                }
                promise.complete();
            });
            futures.add(promise.future());
        }
        return CompositeFuture.all(futures).compose(handler -> Future.succeededFuture() );
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

                List<String> tables = new ArrayList<>(Arrays.asList("folder", "subject", "subject_document", "grain"));
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
    protected Future<Void> beforeImportingResultsToTable(String importPath, String table, final JsonArray fields, final JsonArray rows) {
        if( !"subject_document".equals(table) || rows==null || rows.isEmpty() ) return Future.succeededFuture();
        final int doc_id = fields.getList().indexOf("doc_id");
        if( doc_id <0 ) return Future.succeededFuture();

        final List<Future> futures = new ArrayList<>(rows.size());
        
        for( int i=rows.size()-1; i>=0; i-- ) {
            final JsonArray row = rows.getJsonArray(i);
            String fileId = row.getString(doc_id);
            if( fileId==null || fileId.isEmpty() ) {
                continue;
            }

            // Copy corrected file to storage
            final String sourceFilePath = importPath+ java.io.File.separator +fileId;
            final String newFileId = UUID.randomUUID().toString();
            final Promise<Void> promise = Promise.promise();
            final int idx = i;
            storage.writeFsFile(newFileId, sourceFilePath, res -> {
                if( "error".equals(res.getString("status")) ) {
                    log.error("[ExercizerRepositoryEvents][beforeImportingResultsToTable] File import failed. "+ res.getString("message"));
                    rows.remove( idx );
                } else {
                    row.set(doc_id, newFileId);
                }
                promise.complete();
            });
            futures.add(promise.future());
        }
        return CompositeFuture.all(futures).compose(handler -> Future.succeededFuture() );
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
        if( indexId >= 0 ) {
            Collections.sort(results.getList(), (a,b) -> new JsonArray((List)a).getInteger(indexId).compareTo(new JsonArray((List)b).getInteger(indexId)));
        }
        
        final boolean isSubjectTable = "subject".equals(table);

        if (isSubjectTable || "folder".equals(table)) {
            // WB-582 retro-compatibility on old exports (A)
            final int corrected_file_id = fields.getList().indexOf("corrected_file_id");
            if( isSubjectTable && corrected_file_id >= 0 ) {
                fields.remove(corrected_file_id);
            }
            // WB-582 retro-compatibility on old exports (B)
            final int corrected_metadata = fields.getList().indexOf("corrected_metadata");
            if( isSubjectTable && corrected_metadata >= 0 ) {
                fields.remove(corrected_metadata);
            }

            final int titleId = fields.getList().indexOf("title");
            final int parentId = fields.getList().indexOf(isSubjectTable ? "original_subject_id" : "parent_folder_id");

            label:
            for (int i = 0; i < results.size(); ) {
                // WB-582 retro-compatibility on old exports
                if( isSubjectTable ) {
                    // Keep the removing sequence (A) then (B) for indexes to match !
                    if( corrected_file_id >= 0 )
                        results.getJsonArray(i).remove(corrected_file_id);
                    if( corrected_metadata >= 0 )
                        results.getJsonArray(i).remove(corrected_metadata);
                }

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
        if(groups == null)
        {
            log.warn("[ExercizerRepositoryEvents][deleteGroups] groups is empty");
            return;
        }

		for(int i = groups.size(); i-- > 0;)
		{
			if(groups.hasNull(i))
				groups.remove(i);
			else if (groups.getJsonObject(i) != null && groups.getJsonObject(i).getString("group") == null)
				groups.remove(i);
		}
        if(groups.size() == 0)
        {
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

            Sql.getInstance().transaction(builder.build(), new DeliveryOptions().setSendTimeout(90000l), SqlResult.validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
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

        if(users == null){
            log.warn("[ExercizerRepositoryEvents][deleteUsers] users is empty");
            return;
        }
		for(int i = users.size(); i-- > 0;)
		{
			if(users.hasNull(i))
				users.remove(i);
            else if (users.getJsonObject(i) != null && users.getJsonObject(i).getString("id") == null)
                users.remove(i);
		}
        if(users.size() == 0)
        {
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
