package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IFolderService;
import fr.wseduc.webutils.Either;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.*;

public class FolderServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IFolderService {
    private static final Logger log = LoggerFactory.getLogger(FolderServiceSqlImpl.class);

    public FolderServiceSqlImpl() {
        super("exercizer", "folder");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        JsonObject folder = ResourceParser.beforeAny(resource);
        folder.putString("owner", user.getUserId());
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

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void remove(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        super.delete(resource, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list(user, handler);
    }

    public void checkDuplicateFolders(JsonObject folder, final Handler<Boolean> handler) {
        final Number targetFolderId = folder.getNumber("targetFolderId");
        final JsonArray sourceFoldersIdJa = folder.getArray("sourceFoldersId");

        final SqlStatementsBuilder s = new SqlStatementsBuilder();

        for (int i=0;i<sourceFoldersIdJa.size();i++) {
            final Number sourceFolderId = sourceFoldersIdJa.get(i);
            checkDuplicateFolder(s, sourceFolderId, targetFolderId);
        }

        sql.transaction(s.build(), new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> res) {
                if ("ok".equals(res.body().getString("status"))) {
                    JsonArray values = res.body().getArray("results");
                    long counter = 0;
                    for (int i=0;i<values.size(); i++) {
                        JsonObject jo = values.get(i);
                        counter += jo.getLong("rows", 0L);
                    }

                    if (counter > 0) {
                        handler.handle(false);
                    } else {
                        handler.handle(true);
                    }

                } else {
                    log.error(res.body().getString("message", ""));
                    handler.handle(false);
                }
            }
        });
    }

    public void duplicateFolders(JsonObject folder, final String folderTitleSuffix, final String subjectTitleSuffix, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        final Long targetFolderId = folder.getLong("targetFolderId");

        final JsonArray sourceFoldersIdJa = folder.getArray("sourceFoldersId");
        final Set<Long> sourceFoldersIdSet = new HashSet<>();

        final SqlStatementsBuilder s = new SqlStatementsBuilder();

        try {
            for (int i=0;i<sourceFoldersIdJa.size();i++) {
                final Long sourceFolderId = Long.parseLong(sourceFoldersIdJa.get(i).toString());
                findSubjectAndFolder(s, sourceFolderId);
                sourceFoldersIdSet.add(sourceFolderId);
            }
        } catch (NumberFormatException e) {
            log.error("Can't cast id of folder", e);
            handler.handle(new Either.Left<String, JsonObject>(e.getMessage()));
            return;
        }


        sql.transaction(s.build(), SqlResult.validResultsHandler(new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                if (event.isRight()) {
                    final JsonArray results = event.right().getValue();

                    Set<Number> folderIds = new HashSet<Number>();
                    final Set<Number> subjectIds = new HashSet<Number>();

                    final List<JsonObject> foldersWithSubjects = new ArrayList<JsonObject>();

                    for (int i=0;i<results.size();i++) {
                        final JsonArray result = results.get(i);

                        for (int j=0;j<result.size();j++) {
                            final JsonObject jo = result.get(j);
                            folderIds.add(jo.getNumber("folder_id"));
                            if (jo.getNumber("id") != null) {
                                subjectIds.add(jo.getNumber("id"));
                            }
                            foldersWithSubjects.add(jo);
                        }
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
                                    final Number oldFolderID = folderSubject.getNumber("folder_id");
                                    //avoid the same folder by subject id
                                    if (!mapFolderNewFolder.containsKey(oldFolderID)) {
                                        mapFolderNewFolder.put(oldFolderID, newFolderIds.get(countSetNewFolderId));
                                        countSetNewFolderId++;
                                    }

                                    if (folderSubject.getNumber("id") != null) {
                                        mapOldSubjectIdOldFolderId.put(folderSubject.getNumber("id"), oldFolderID);
                                    }
                                }

                                final SqlStatementsBuilder globalStatements = new SqlStatementsBuilder();
                                final Set<Number> treatyFolder = new HashSet<Number>();
                                for (JsonObject folderSubject : foldersWithSubjects) {
                                    final Number oldFolderId = folderSubject.getNumber("folder_id");
                                    //avoid the same folder by subject id
                                    if (!treatyFolder.contains(oldFolderId)) {
                                        final Number parentId = (sourceFoldersIdSet.contains(oldFolderId)) ? targetFolderId :
                                                mapFolderNewFolder.get(folderSubject.getNumber("parent_folder_id"));
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
                }
            }
        }));
    }

    private void checkDuplicateFolder(SqlStatementsBuilder s, final Number sourceFolderId, final Number targetFolderId) {
        final String query = "WITH RECURSIVE folder(folder_id) AS(" +
                "SELECT id FROM " + resourceTable + " AS f WHERE f.id  = ? " +
                " UNION " +
                "SELECT id FROM " + resourceTable + " AS e INNER JOIN folder ON e.parent_folder_id = folder.folder_id)" +
                "SELECT f.folder_id FROM folder AS f WHERE f.folder_id=? ";
        s.prepared(query, new JsonArray().addNumber(sourceFolderId).addNumber(targetFolderId));
    }

    private void findSubjectAndFolder(SqlStatementsBuilder s, final Long folderId) {

        final String query = "WITH RECURSIVE folder(folder_id) AS(" +
                "SELECT id, f.label, f.parent_folder_id FROM " + resourceTable + " AS f WHERE f.id  = ? " +
                " UNION " +
                "SELECT id, e.label, e.parent_folder_id FROM " + resourceTable + " AS e INNER JOIN folder ON e.parent_folder_id = folder.folder_id)" +
                "SELECT f.folder_id, f.label, f.parent_folder_id, s.id FROM folder AS f LEFT JOIN " + schema +
                "subject AS s ON (f.folder_id=s.folder_id) ORDER BY f.parent_folder_id ASC NULLS FIRST, f.folder_id;";
        s.prepared(query, new JsonArray().addNumber(folderId));
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
                        results.add(ja.<JsonArray>get(i).<JsonObject>get(0).getLong("id"));
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
        s.prepared(query, new JsonArray().addNumber(newFolderId).addNumber(parentId).addString(label).addString(userId));
    }

    private void duplicationSubject(final SqlStatementsBuilder s, final Number newSubjectId, final Number fromSubjectId,
                                    final Number folderId, UserInfos user, final String titleSuffix) {
        String userQuery = "SELECT " + schema + "merge_users(?,?)";
        s.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));

        final String subjectCopy = "INSERT INTO exercizer.subject (id, folder_id, owner, owner_username, title, description, picture, max_score) " +
                "SELECT ?, ?, ?, ?, s.title || ?, s.description, s.picture, s.max_score FROM exercizer.subject as s " +
                "WHERE s.id = ?";

        final JsonArray values = new JsonArray().add(newSubjectId).add(folderId).add(user.getUserId())
                .add(user.getUsername()).add(titleSuffix).add(fromSubjectId);

        s.prepared(subjectCopy, values);
    }

    private void duplicationGrain(final SqlStatementsBuilder s, final Number newSubjectId, final Number fromSubjectId) {
        final String grainsCopy = "INSERT INTO exercizer.grain (subject_id, grain_type_id, order_by, grain_data) " +
                "SELECT ?, g.grain_type_id, g.order_by, g.grain_data FROM exercizer.subject as s INNER JOIN exercizer.grain as g on (s.id = g.subject_id) " +
                "WHERE s.id=?";

        s.prepared(grainsCopy, new JsonArray().add(newSubjectId).add(fromSubjectId));
    }

}
