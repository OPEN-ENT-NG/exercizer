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

import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IFolderService;
import fr.openent.exercizer.services.ISubjectService;
import fr.wseduc.webutils.Either;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.*;

public class FolderServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IFolderService {
    private static final Logger log = LoggerFactory.getLogger(FolderServiceSqlImpl.class);
    private final ISubjectService subjectService;

    public FolderServiceSqlImpl(final ExercizerExplorerPlugin plugin) {
        super("exercizer", "folder");
        subjectService = new SubjectServiceSqlImpl(plugin);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        JsonObject folder = ResourceParser.beforeAny(resource);
        folder.put("owner", user.getUserId());
        super.persist(folder, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject folder = ResourceParser.beforeAny(resource);
        super.update(folder, user, handler);
    }

    @Override
    public void remove(final JsonArray folderIds, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {

        final String findSubjectQuery =
                "WITH RECURSIVE folder(folder_id) AS(" +
                "SELECT id FROM " + resourceTable + " AS f WHERE f.id IN " + Sql.listPrepared(folderIds.getList()) +
                " UNION " +
                "SELECT id FROM " + resourceTable + " AS e INNER JOIN folder ON e.parent_folder_id = folder.folder_id)" +
                "SELECT s.id FROM folder AS f INNER JOIN " + schema + "subject AS s ON (f.folder_id=s.folder_id)";

        sql.prepared(findSubjectQuery, new JsonArray(folderIds.getList()), SqlResult.validResultHandler(new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                if (event.isRight()) {
                    final JsonArray values = event.right().getValue();
                    final SqlStatementsBuilder builder = new SqlStatementsBuilder();
                    //mark as delete subject and deleting grains
                    if (values != null && values.size() > 0) {
                        final JsonArray subjectIds = new JsonArray();
                        for (int i=0;i<values.size();i++) {
                            subjectIds.add(values.getJsonObject(i).getLong("id"));
                        }
                        //dont need to notifyDelete=>we will not use folders anymore
                        subjectService.removeSubjectsAndGrains(builder, user, subjectIds);
                    }

                    //delete cascade
                    final String removeFolderQuery = "DELETE FROM " + resourceTable + " WHERE id IN " + Sql.listPrepared(folderIds.getList());
                    builder.prepared(removeFolderQuery, new JsonArray(folderIds.getList()));

                    sql.transaction(builder.build(), SqlResult.validUniqueResultHandler(0, handler));
                } else {
                    handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
                }
            }
        }));
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list(user, handler);
    }

    public void checkFolders(JsonObject folder, final Handler<Boolean> handler) {
        final Number targetFolderId = folder.getLong("targetFolderId");
        final JsonArray sourceFoldersIdJa = folder.getJsonArray("ids");

        final String query = "WITH RECURSIVE folder(folder_id) AS(" +
                "SELECT id FROM " + resourceTable + " AS f WHERE f.id  IN " + Sql.listPrepared(sourceFoldersIdJa.getList()) +
                " UNION " +
                "SELECT id FROM " + resourceTable + " AS e INNER JOIN folder ON e.parent_folder_id = folder.folder_id)" +
                "SELECT f.folder_id FROM folder AS f WHERE f.folder_id=? ";

        sql.prepared(query, new JsonArray(new ArrayList(sourceFoldersIdJa.getList())).add(targetFolderId), SqlResult.validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    handler.handle(event.right().getValue().getLong("rows", 0L)  == 0);
                } else {
                    log.error(event.left().getValue());
                    handler.handle(false);
                }
            }
        }));
    }

    public void move(JsonObject folder, final Handler<Either<String, JsonObject>> handler) {
        final Long targetFolderId = folder.getLong("targetFolderId");

        final JsonArray sourceFoldersIdJa = folder.getJsonArray("ids");

        final String query = "UPDATE " + resourceTable + " SET parent_folder_id=?, modified=NOW() WHERE id IN " + Sql.listPrepared(sourceFoldersIdJa.getList());

        final JsonArray values = new JsonArray().add(targetFolderId);
        try {
            for (int i=0;i<sourceFoldersIdJa.size();i++) {
                values.add(Long.parseLong(sourceFoldersIdJa.getValue(i).toString()));
            }
        } catch (NumberFormatException e) {
            log.error("Can't cast id of folder", e);
            handler.handle(new Either.Left<String, JsonObject>(e.getMessage()));
            return;
        }

        sql.prepared(query, values, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
               handler.handle(SqlResult.validRowsResult(event));
            }
        });
    }

    public void duplicateFolders(JsonObject folder, final String folderTitleSuffix, final String subjectTitleSuffix, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        final Long targetFolderId = folder.getLong("targetFolderId");

        final JsonArray sourceFoldersIdJa = folder.getJsonArray("ids");
        final Set<Long> sourceFoldersIdSet = new HashSet<>();

        try {
            for (int i=0;i<sourceFoldersIdJa.size();i++) {
                final Long sourceFolderId = Long.parseLong(sourceFoldersIdJa.getValue(i).toString());
                sourceFoldersIdSet.add(sourceFolderId);
            }
        } catch (NumberFormatException e) {
            log.error("Can't cast id of folder", e);
            handler.handle(new Either.Left<String, JsonObject>(e.getMessage()));
            return;
        }

        findSubjectAndFolder(sourceFoldersIdJa, new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                if (event.isRight()) {
                    final JsonArray results = event.right().getValue();

                    Set<Number> folderIds = new HashSet<Number>();
                    final Set<Number> subjectIds = new HashSet<Number>();

                    final List<JsonObject> foldersWithSubjects = new ArrayList<JsonObject>();

                    for (int i=0;i<results.size();i++) {
                        final JsonObject jo = results.getJsonObject(i);
                        folderIds.add(jo.getLong("folder_id"));
                        if (jo.getLong("id") != null) {
                            subjectIds.add(jo.getLong("id"));
                        }
                        foldersWithSubjects.add(jo);
                    }

                    generateId(folderIds.size(), "folder_id_seq", new Handler<List<Number>>() {
                        @Override
                        public void handle(List<Number> newFolderIds) {
                            if (newFolderIds != null && newFolderIds.size() > 0 ) {
                                final Map<Number, Number> mapFolderNewFolder = new HashMap<>();
                                final Map<Number, Number> mapOldSubjectIdOldFolderId = new HashMap();

                                int countSetNewFolderId=0;
                                //matching between old folder id with new folder id and old subject id
                                for (JsonObject folderSubject : foldersWithSubjects) {
                                    final Number oldFolderID = folderSubject.getLong("folder_id");
                                    //avoid the same folder by subject id
                                    if (!mapFolderNewFolder.containsKey(oldFolderID)) {
                                        mapFolderNewFolder.put(oldFolderID, newFolderIds.get(countSetNewFolderId));
                                        countSetNewFolderId++;
                                    }

                                    if (folderSubject.getLong("id") != null) {
                                        mapOldSubjectIdOldFolderId.put(folderSubject.getLong("id"), oldFolderID);
                                    }
                                }

                                final SqlStatementsBuilder globalStatements = new SqlStatementsBuilder();
                                final Set<Number> treatyFolder = new HashSet<Number>();
                                for (JsonObject folderSubject : foldersWithSubjects) {
                                    final Number oldFolderId = folderSubject.getLong("folder_id");
                                    //avoid the same folder by subject id
                                    if (!treatyFolder.contains(oldFolderId)) {
                                        final Number parentId = (sourceFoldersIdSet.contains(oldFolderId)) ? targetFolderId :
                                                mapFolderNewFolder.get(folderSubject.getLong("parent_folder_id"));
                                        duplicateFolder(globalStatements, mapFolderNewFolder.get(oldFolderId), parentId,
                                                folderSubject.getString("label") + folderTitleSuffix, user.getUserId());
                                        treatyFolder.add(oldFolderId);
                                    }
                                }

                                if (subjectIds.size() > 0) {
                                    generateId(subjectIds.size(), "subject_id_seq", new Handler<List<Number>>() {
                                         @Override
                                         public void handle(List<Number> newSubjectIds) {
                                             if (newSubjectIds != null && newSubjectIds.size() > 0) {
                                                 final List<Number> oldSubjectIds = new ArrayList(subjectIds);
                                                 for (int i = 0; i < newSubjectIds.size(); i++) {
                                                     final Number newSubjectId = newSubjectIds.get(i);
                                                     final Number oldSubjectId = oldSubjectIds.get(i);
                                                     final Number oldFolderId = mapOldSubjectIdOldFolderId.get(oldSubjectId);
                                                     final Number newFolderId = mapFolderNewFolder.get(oldFolderId);

                                                     duplicationSubject(globalStatements, newSubjectId, oldSubjectId, newFolderId, user, subjectTitleSuffix);
                                                     duplicationGrain(globalStatements, newSubjectId, oldSubjectId);
                                                 }
                                                 sql.transaction(globalStatements.build(), SqlResult.validUniqueResultHandler(0, handler));
                                             } else {
                                                 handler.handle(new Either.Left<String, JsonObject>("Not created ids from subject_id_seq"));
                                             }
                                         }
                                    });
                                } else {
                                    //only folders
                                    sql.transaction(globalStatements.build(), SqlResult.validUniqueResultHandler(0, handler));
                                }
                            } else {
                                handler.handle(new Either.Left<String, JsonObject>("Not created ids from folder_id_seq"));
                            }
                        }
                    });
                } else {
                    log.error("Fail to look for recursive folder" + event.left().getValue());
                    handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
                }
            }
        });
    }

    private void findSubjectAndFolder(final JsonArray sourceFoldersIdJa, final Handler<Either<String, JsonArray>> handler) {
        //recursive query that retrieves all directories (selected and every son) with potentially related subjects
        final String query = "WITH RECURSIVE folder(folder_id) AS(" +
                "SELECT id, f.label, f.parent_folder_id FROM " + resourceTable + " AS f WHERE f.id IN " + Sql.listPrepared(sourceFoldersIdJa.getList()) +
                " UNION " +
                "SELECT id, e.label, e.parent_folder_id FROM " + resourceTable + " AS e INNER JOIN folder ON e.parent_folder_id = folder.folder_id)" +
                "SELECT f.folder_id, f.label, f.parent_folder_id, s.id FROM folder AS f LEFT JOIN " + schema +
                "subject AS s ON (f.folder_id=s.folder_id) ORDER BY f.parent_folder_id ASC NULLS FIRST, f.folder_id";
        sql.prepared(query, new JsonArray(sourceFoldersIdJa.getList()), SqlResult.validResultHandler(handler));
    }

    private void generateId(final Integer number, final String sequence, final Handler<List<Number>> handler) {
        final String queryNewFolderId = "SELECT nextval('" + schema + sequence + "') as id";
        final SqlStatementsBuilder sIds = new SqlStatementsBuilder();

        for (int i = 0; i <number; i++) {
            sIds.raw(queryNewFolderId);
        }

        final List<Number> results = new ArrayList<>();

        sql.transaction(sIds.build(), SqlResult.validResultsHandler(new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                if (event.isRight()) {
                    final JsonArray ja = event.right().getValue();
                    final SqlStatementsBuilder s = new SqlStatementsBuilder();
                    for (int i = 0; i < ja.size(); i++) {
                        results.add(ja.getJsonArray(i).getJsonObject(0).getLong("id"));
                    }
                    handler.handle(results);
                } else {
                    log.error("Fail to create new Id : " + event.left().getValue());
                    handler.handle(results);
                }
            }
        }));
    }

    private void duplicateFolder(SqlStatementsBuilder s, final Number newFolderId, final Number parentId, final String label, final String userId) {
        final String query = "INSERT INTO " + resourceTable + "(id, parent_folder_id, label, owner) VALUES " +
                "(?,?,?,?)";
        s.prepared(query, new JsonArray().add(newFolderId).add(parentId).add(label).add(userId));
    }

    private void duplicationSubject(final SqlStatementsBuilder s, final Number newSubjectId, final Number fromSubjectId,
                                    final Number folderId, UserInfos user, final String titleSuffix) {
        String userQuery = "SELECT " + schema + "merge_users(?,?)";
        s.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));

        final String subjectCopy = "INSERT INTO " + schema + "subject (id, folder_id, owner, owner_username, title, description, picture, max_score) " +
                "SELECT ?, ?, ?, ?, s.title || ?, s.description, s.picture, s.max_score FROM " + schema + "subject as s " +
                "WHERE s.id = ?";

        final JsonArray values = new JsonArray().add(newSubjectId).add(folderId).add(user.getUserId())
                .add(user.getUsername()).add(titleSuffix).add(fromSubjectId);

        s.prepared(subjectCopy, values);
    }

    private void duplicationGrain(final SqlStatementsBuilder s, final Number newSubjectId, final Number fromSubjectId) {
        final String grainsCopy = "INSERT INTO " + schema + "grain (subject_id, grain_type_id, order_by, grain_data) " +
                "SELECT ?, g.grain_type_id, g.order_by, g.grain_data FROM " + schema + "subject as s INNER JOIN " + schema + "grain as g on (s.id = g.subject_id) " +
                "WHERE s.id=?";

        s.prepared(grainsCopy, new JsonArray().add(newSubjectId).add(fromSubjectId));
    }

}
