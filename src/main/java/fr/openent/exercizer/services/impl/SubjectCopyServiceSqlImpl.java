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
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.ISubjectCopyService;
import fr.wseduc.webutils.Either;

import java.util.ArrayList;
import java.util.List;

public class SubjectCopyServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectCopyService {


    public SubjectCopyServiceSqlImpl() {
        super("exercizer", "subject_copy");
    }

    @Override
    public void submitCopy(final long id, int timezoneOffset, final Handler<Either<String, JsonObject>> handler) {
        sql.prepared(
                "UPDATE " + schema + "subject_copy SET submitted_date=NOW() at time zone 'utc' - (? * interval '1 minute') WHERE id = ? RETURNING *",
                new JsonArray().add(timezoneOffset).add(id),
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
        StringBuilder query = new StringBuilder()
        .append("SELECT o.*, CASE WHEN t.files IS NULL THEN jsonb_build_array() ELSE t.files END")
        .append(" FROM ").append(resourceTable).append(" AS o")
        .append(" LEFT JOIN (")
            .append(" SELECT o2.id, jsonb_agg(jsonb_build_object('file_id', scf.file_id, 'file_type', scf.file_type, 'metadata', scf.metadata)) AS files")
            .append(" FROM ").append(resourceTable).append(" AS o2")
            .append(" JOIN ").append(schema).append("subject_copy_file scf ON scf.subject_copy_id = o2.id")
            .append(" WHERE o2.owner = ? ")
            .append(" GROUP BY o2.id")
        .append(" ) AS t ON o.id = t.id")
        .append(" WHERE o.owner = ? ");

        sql.prepared(query.toString(), new JsonArray().add(user.getUserId()).add(user.getUserId()), SqlResult.validResultHandler(handler, "files"));
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectScheduled(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder()
        .append("SELECT o.*, CASE WHEN t.files IS NULL THEN jsonb_build_array() ELSE t.files END")
        .append(" FROM ").append(resourceTable).append(" AS o")
        .append(" LEFT JOIN (")
            .append(" SELECT o2.id, jsonb_agg(jsonb_build_object('file_id', scf.file_id, 'file_type', scf.file_type, 'metadata', scf.metadata)) AS files")
            .append(" FROM ").append(resourceTable).append(" AS o2")
            .append(" JOIN ").append(schema).append("subject_copy_file scf ON scf.subject_copy_id = o2.id")
            .append(" WHERE o2.subject_scheduled_id = ? ")
            .append(" GROUP BY o2.id")
        .append(" ) AS t ON o.id = t.id")
        .append(" WHERE o.subject_scheduled_id = ? ");

        sql.prepared(query.toString(), new JsonArray().add(resource.getInteger("id")).add(resource.getInteger("id")), SqlResult.validResultHandler(handler, "files"));
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectScheduledList(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder()
        .append("SELECT o.*, CASE WHEN t.files IS NULL THEN jsonb_build_array() ELSE t.files END")
        .append(" FROM ").append(resourceTable).append(" AS o")
        .append(" JOIN ").append(schema).append("subject_scheduled AS r ON o.subject_scheduled_id = r.id")
        .append(" LEFT JOIN (")
            .append(" SELECT o2.id, jsonb_agg(jsonb_build_object('file_id', scf.file_id, 'file_type', scf.file_type, 'metadata', scf.metadata)) AS files")
            .append(" FROM ").append(resourceTable).append(" AS o2")
            .append(" JOIN ").append(schema).append("subject_scheduled AS r2 ON o2.subject_scheduled_id = r2.id")
            .append(" JOIN ").append(schema).append("subject_copy_file scf ON scf.subject_copy_id = o2.id")
            .append(" WHERE r2.owner = ? ")
            .append(" GROUP BY o2.id")
        .append(" ) AS t ON o.id = t.id")
        .append(" WHERE r.owner = ? ");

        sql.prepared(query.toString(), new JsonArray().add(user.getUserId()).add(user.getUserId()), SqlResult.validResultHandler(handler, "files"));
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
        final String query = 
            "SELECT ss.title, ss.corrected_date, sc.owner_username,"+
            "   jsonb_agg( jsonb_build_object('file_id', scf.file_id, 'file_type', scf.file_type, 'metadata', scf.metadata) ) AS files"+
            " FROM "+ resourceTable +" sc"+
            " INNER JOIN "+ schema +"subject_scheduled ss ON ss.id = sc.subject_scheduled_id"+
            " LEFT JOIN "+ schema +"subject_copy_file AS scf ON scf.subject_copy_id = sc.id"+
            " WHERE sc.id IN "+ Sql.listPrepared(ids.toArray())+ 
            " GROUP BY ss.title, ss.corrected_date, sc.owner_username";

        JsonArray values = new JsonArray();
        for (final String id : ids) {
            values.add(Sql.parseId(id));
        }

        sql.prepared(query, values, SqlResult.validResultHandler(handler, "files"));
    }

    @Override
    public void getMetadataOfSubject(final String id, final FileType fileType, final Handler<Either<String, JsonObject>> handler) {

        final String query = 
                "SELECT sc.owner AS copy_owner, sc.subject_scheduled_id, ss.title, ss.owner AS subject_owner " +
                "FROM "+ resourceTable +" AS sc INNER JOIN "+ schema +"subject_scheduled AS ss ON ss.id=sc.subject_scheduled_id " +
                "WHERE sc.id = ?";

        sql.prepared(query, new JsonArray().add(Sql.parseId(id)), SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void removeIndividualCorrectedFile(final Long id, final Handler<Either<String, JsonObject>> handler) {
        //Mark as not corrected if don't have global correction
        final String queryCorrected = 
                "(SELECT CASE WHEN COUNT(sd.doc_id) = 0 THEN false ELSE true END"
                + " FROM "+ schema +"subject_scheduled as ss"
                + " INNER JOIN "+ schema +"subject_document as sd ON sd.subject_id=ss.subject_id"
                + " WHERE ss.id=subject_scheduled_id)";

        final String query =
                "UPDATE " + resourceTable +
                " SET modified = NOW(), is_corrected = " + queryCorrected +
                " WHERE id = ? ";

        sql.prepared(query, new JsonArray().add(id), SqlResult.validRowsResultHandler(handler));
    }

    @Override
    public void correctedInProgress(final List<String> ids, final Handler<Either<String, JsonObject>> handler) {
        final List<Object> sqlIds = new ArrayList<>();
        JsonArray values = new JsonArray();
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
    public void addFile(final String subjectCopyId, final String fileId, final JsonObject metadata, final FileType fileType, final Handler<Either<String, JsonObject>> handler) {
        StringBuilder insert = new StringBuilder()
		.append("INSERT INTO ").append(schema).append("subject_copy_file (subject_copy_id, file_id, file_type, metadata) ")
		.append("VALUES (?,?,?,?) RETURNING file_id, file_type, metadata");

        JsonArray values = new JsonArray()
			.add( Sql.parseId(subjectCopyId) )
			.add( fileId )
            .add( fileType.getKey() )
			.add( metadata );
        
        sql.prepared(insert.toString(), values, SqlResult.validUniqueResultHandler(handler, "metadata"));
    }

	@Override
    public void deleteFile(final Long subjectCopyId, final String fileId, final Handler<Either<String, JsonObject>> handler) {
        StringBuilder delete = new StringBuilder()
		.append("DELETE FROM ").append(schema).append("subject_copy_file ")
		.append("WHERE subject_copy_id = ? AND file_id = ? RETURNING subject_copy_id, file_id, file_type, metadata");

        JsonArray values = new JsonArray()
			.add( subjectCopyId )
			.add( fileId );
		sql.prepared(delete.toString(), values, SqlResult.validUniqueResultHandler(handler, "metadata"));
	}

    @Override
    public void listFiles(final Long subjectCopyId, final Handler<Either<String, JsonArray>> handler) {
        StringBuilder select = new StringBuilder()
		.append("SELECT file_id, file_type, metadata ")
		.append("FROM ").append(schema).append("subject_copy_file ")
		.append("WHERE subject_copy_id = ?");
		
        JsonArray values = new JsonArray()
			.add( subjectCopyId );
		sql.prepared(select.toString(), values, SqlResult.validResultHandler(handler, "metadata"));		
    }

	@Override
	public void getFile(final Long subjectCopyId, final String fileId, final Handler<Either<String, JsonObject>> handler ) {
        StringBuilder select = new StringBuilder()
		.append("SELECT file_id, file_type, metadata ")
		.append("FROM ").append(schema).append("subject_copy_file ")
		.append("WHERE subject_id = ? AND file_id = ?");
		
        JsonArray values = new JsonArray()
			.add( subjectCopyId )
			.add( fileId );
		sql.prepared(select.toString(), values, SqlResult.validUniqueResultHandler(handler, "metadata"));		
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
        JsonArray values = new JsonArray();
        for (final String id : ids) {
            values.add(Sql.parseId(id));
        }
        sql.prepared(query, values, SqlResult.validResultHandler(handler));
    }

    @Override
    public void exclude(final JsonArray ids, final Handler<Either<String, JsonArray>> handler) {
        final String find = "SELECT sc.owner as _id, sc.owner_username as name FROM " + resourceTable + " AS sc WHERE sc.id IN " + Sql.listPrepared(ids.getList());
        sql.prepared(find, new JsonArray(ids.getList()), SqlResult.validResultHandler(new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                if(event.isRight()){
                    JsonArray copies = event.right().getValue();
                    final JsonArray exclude =  new JsonArray();
                    final JsonArray values =  new JsonArray();
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

    @Override
    public void setCurrentGrain(final String subjectCopyId, final String grainCopyId, Handler<Either<String, JsonObject>> handler) {
        if ("-1".equals(grainCopyId)) {
            updateCurrentGrainId(subjectCopyId, null, handler);
            return;
        }
        final String query = "SELECT subject_copy_id::text AS \"subjectCopyId\" FROM exercizer.grain_copy WHERE id = ?";
        sql.prepared(query, new JsonArray().add(grainCopyId), SqlResult.validUniqueResultHandler(result -> {
            if (result.isRight()) {
                final String res = result.right().getValue().getString("subjectCopyId");
                if (!res.equals(subjectCopyId)) {
                    handler.handle(new Either.Left<>("Wrong grain_copy id"));
                } else {
                    updateCurrentGrainId(subjectCopyId, grainCopyId, handler);
                }
            } else {
                handler.handle(new Either.Left<>(result.left().getValue()));
            }
        }));
    }

    private void updateCurrentGrainId(final String subjectCopyId, final String grainCopyId, Handler<Either<String, JsonObject>> handler) {
        final String updateQuery = "UPDATE " + resourceTable + " SET current_grain_id = ? WHERE id = ?";
        JsonArray params = new JsonArray();
        if (grainCopyId != null) {
            params.add(grainCopyId).add(subjectCopyId);
        } else {
            params.addNull().add(subjectCopyId);
        }
        sql.prepared(updateQuery, params, SqlResult.validRowsResultHandler(handler));
    }
}