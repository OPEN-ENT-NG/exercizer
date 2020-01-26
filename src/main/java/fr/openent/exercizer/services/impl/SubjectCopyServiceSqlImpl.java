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

import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.ISubjectCopyService;
import fr.wseduc.webutils.Either;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.sql.SqlResult.validResultHandler;

public class SubjectCopyServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectCopyService {


    public SubjectCopyServiceSqlImpl() {
        super("exercizer", "subject_copy");
    }

    @Override
    public void submitCopy(final long id, int timezoneOffset, final Handler<Either<String, JsonObject>> handler) {
        sql.prepared(
                "UPDATE " + schema + "subject_copy SET submitted_date=NOW() at time zone 'utc' - (? * interval '1 minute') WHERE id = ? RETURNING *",
                new fr.wseduc.webutils.collections.JsonArray().add(timezoneOffset).add(id),
                SqlResult.validUniqueResultHandler(handler)
        );
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        JsonObject subjectCopy = ResourceParser.beforeAny(resource);
        super.persistWithAnotherOwner(subjectCopy, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        JsonObject subjectCopy = ResourceParser.beforeAny(resource);
        super.update(subjectCopy, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list(user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectScheduled(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
        super.list(resource, "subject_scheduled_id", "exercizer.subject_scheduled", handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectScheduledList(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list("subject_scheduled_id", "exercizer.subject_scheduled", Boolean.TRUE, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void getById(final String id, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        super.getById(id, user, handler);
    }

    @Override
    public void getDownloadInformation(final List<String> ids, final Handler<Either<String, JsonArray>> handler) {
        final List<Object> sqlIds = new ArrayList<>();

        final String query = "SELECT ss.title, ss.corrected_date, sc.owner_username, sc.homework_file_id, sc.homework_metadata, " +
                "sc.corrected_file_id, sc.corrected_metadata FROM " +
                resourceTable + " as sc INNER JOIN " + schema + "subject_scheduled as ss ON (ss.id = sc.subject_scheduled_id) " +
                "WHERE sc.id IN " + Sql.listPrepared(ids.toArray());

        JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
        for (final String id : ids) {
            values.add(Sql.parseId(id));
        }

        sql.prepared(query, values, SqlResult.validResultHandler(handler, "homework_metadata", "corrected_metadata"));

    }

    @Override
    public void getMetadataOfSubject(final String id, final FileType fileType, final Handler<Either<String, JsonObject>> handler) {

        final String query = "SELECT " + (FileType.CORRECTED.equals(fileType) ? "sc.corrected_file_id" : "sc.homework_file_id") + ", " +
                " sc.owner as copy_owner, sc.subject_scheduled_id, ss.title, ss.owner as subject_owner " +
                " FROM " + resourceTable + " AS sc INNER JOIN " + schema + "subject_scheduled as ss ON ss.id=sc.subject_scheduled_id" +
                " WHERE sc.id = ?";

        sql.prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(Sql.parseId(id)), SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void removeIndividualCorrectedFile(final String id, final Handler<Either<String, JsonObject>> handler) {
        //Mark as not corrected if don't have global correction
        final String queryCorrected = "(SELECT CASE WHEN ss.corrected_file_id IS NULL THEN false ELSE true END FROM "
                + schema + "subject_scheduled as ss WHERE ss.id=subject_scheduled_id)";

        final String query =
                "UPDATE " + resourceTable +
                        " SET corrected_file_id=null,corrected_metadata=null,modified = NOW(), is_corrected = " + queryCorrected +
                        "WHERE id = ? ";

        sql.prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(Sql.parseId(id)), SqlResult.validRowsResultHandler(handler));
    }

    @Override
    public void correctedInProgress(final List<String> ids, final Handler<Either<String, JsonObject>> handler) {
        final List<Object> sqlIds = new ArrayList<>();
        JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
        for (final String id : ids) {
            values.add(Sql.parseId(id));
        }

        sql.prepared(
                "UPDATE " + schema + "subject_copy SET is_correction_on_going=true, modified = NOW() WHERE id IN " + Sql.listPrepared(ids.toArray()),
                values,
                SqlResult.validRowsResultHandler(handler)
        );
    }

    @Override
    public void addFile(final String id, final String fileId, final JsonObject metadata, final FileType fileType, int timezoneOffset, final Handler<Either<String, JsonObject>> handler) {
        if (FileType.CORRECTED.equals(fileType)) {
            addIndividualCorrectedFile(id, fileId, metadata, handler);
        } else {
            addHomeworkFile(id, fileId, metadata, timezoneOffset, handler);
        }
    }

    private void addHomeworkFile(final String id, final String fileId, final JsonObject metadata, int timezoneOffset, final Handler<Either<String, JsonObject>> handler) {
        final String query =
                "UPDATE " + resourceTable +
                        " SET homework_file_id=?, homework_metadata=?::jsonb, submitted_date=NOW() at time zone 'utc' - (? * interval '1 minute'), modified = NOW() " +
                        "WHERE id = ? ";

        final JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
        values.add(fileId);
        values.add(metadata);
        values.add(timezoneOffset);
        values.add(Sql.parseId(id));

        sql.prepared(query, values, SqlResult.validRowsResultHandler(handler));
    }

    private void addIndividualCorrectedFile(final String id, final String fileId, final JsonObject metadata, final Handler<Either<String, JsonObject>> handler) {
        final String query =
                "UPDATE " + resourceTable +
                        " SET corrected_file_id=?, corrected_metadata=?::jsonb, is_corrected=true, modified = NOW() " +
                        "WHERE id = ? ";

        final JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
        values.add(fileId);
        values.add(metadata);
        values.add(Sql.parseId(id));

        sql.prepared(query, values, SqlResult.validRowsResultHandler(handler));
    }

    @Override
    public void getOwners(final JsonArray ids, final Handler<Either<String, JsonArray>> handler) {
        final String query = "SELECT sc.owner " +
                " FROM " + resourceTable + " AS sc WHERE sc.id IN " + Sql.listPrepared(ids.getList());

        sql.prepared(query, ids, SqlResult.validResultHandler(handler));
    }

    @Override
    public void getArchive(final List<String> ids, final Handler<Either<String, JsonArray>> handler){
        final String query = "SELECT * FROM " + resourceTable + " AS sc WHERE sc.subject_scheduled_id IN "+ Sql.listPrepared(ids.toArray()) +"AND sc.is_archived = true";
        JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
        for (final String id : ids) {
            values.add(Sql.parseId(id));
        }
        sql.prepared(query, values, SqlResult.validResultHandler(handler));
    }

    @Override
    public void exclude(final JsonArray ids, final Handler<Either<String, JsonArray>> handler) {
        final String find = "SELECT sc.owner as _id, sc.owner_username as name FROM " + resourceTable + " AS sc WHERE sc.id IN " + Sql.listPrepared(ids.getList());
        sql.prepared(find, new fr.wseduc.webutils.collections.JsonArray(ids.getList()), SqlResult.validResultHandler(new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                if(event.isRight()){
                    JsonArray copies = event.right().getValue();
                    final JsonArray exclude =  new fr.wseduc.webutils.collections.JsonArray();
                    final JsonArray values =  new fr.wseduc.webutils.collections.JsonArray();
                    values.add(ids.getValue(0));
                    values.addAll(ids);
                    copies.forEach( o ->  exclude.add(((JsonObject)o)));

                    final String updateAndRemove = "; UPDATE "+schema+ "subject_scheduled as ss SET scheduled_at = jsonb_set(scheduled_at::jsonb, " +
                            " array['exclude'],(scheduled_at->'exclude')::jsonb || '"+exclude.toString()+"'::jsonb) " +
                            "FROM ( SELECT subject_scheduled_id FROM "+resourceTable+" WHERE id = ?) a " +
                            "WHERE ss.id = a.subject_scheduled_id; DELETE FROM " + resourceTable + " AS sc WHERE sc.id IN " + Sql.listPrepared(ids.getList());

                    sql.prepared(updateAndRemove, values, SqlResult.validResultHandler(new Handler<Either<String, JsonArray>>() {
                        @Override
                        public void handle(Either<String, JsonArray> event) {
                            if(event.isRight()){
                                handler.handle(new Either.Right<>(exclude));
                            }else{
                                handler.handle(event);
                            }
                        }
                    }));

                }else{
                    handler.handle(event);
                }
            }
        }));
    }

    @Override
    public void getSubmittedBySubjectScheduled(final String scheduledId, final Handler<Either<String, JsonArray>> handler){
        final String query = "SELECT * FROM " + resourceTable + " AS sc WHERE sc.subject_scheduled_id = ? AND sc.submitted_date IS NOT NULL";

        sql.prepared(query, new JsonArray().add(scheduledId), SqlResult.validResultHandler(handler));
    }

    @Override
    public void subjectCopyTrainingExists(UserInfos user, final String subjectScheduledId, Handler<Either<String, Boolean>> handler) {
        final String query = "SELECT (COUNT(*) > 0) AS exists FROM " + resourceTable + " WHERE is_training_copy AND owner = ? AND subject_scheduled_id = ?";
        sql.prepared(query, new JsonArray().add(user.getUserId()).add(subjectScheduledId), SqlResult.validUniqueResultHandler(result -> {
            if (result.isRight()) {
                handler.handle(new Either.Right<>(result.right().getValue().getBoolean("exists")));
            } else {
                handler.handle(new Either.Left<>(result.left().getValue()));
            }
        }));

    }
}