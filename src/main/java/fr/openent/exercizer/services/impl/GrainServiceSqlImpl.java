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

import fr.openent.exercizer.services.IGrainService;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public class GrainServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IGrainService {

    private static final I18n i18n = I18n.getInstance();

    public GrainServiceSqlImpl() {
        super("exercizer", "grain");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final Long subjectId, final Handler<Either<String, JsonObject>> handler) {
        final String query = "INSERT INTO " + resourceTable + "(subject_id, grain_type_id, order_by, grain_data) VALUES (?,?,?,?) returning id";

        final SqlStatementsBuilder s = new SqlStatementsBuilder();
        s.prepared(query, new JsonArray().add(subjectId).add(resource.getLong("grainTypeId")).add(resource.getInteger("orderBy")).add(resource.getValue("grainData")));

        //required for replicate grain directly from the subject
        updateMaxScoreAndDate(s, subjectId);

        sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void update(final JsonObject resource, final Long id, final Long subjectId, final Handler<Either<String, JsonObject>> handler) {
        final String updateGrainQuery = "UPDATE " + resourceTable +
                " SET subject_id=?, grain_type_id=?, order_by=?, grain_data=?, modified = NOW() WHERE id = ?";

        final SqlStatementsBuilder s = new SqlStatementsBuilder();

        s.prepared(updateGrainQuery, new JsonArray().add(subjectId).add(resource.getLong("grainTypeId")).
                add(resource.getInteger("orderBy")).add(resource.getValue("grainData")).add(id));

        updateMaxScoreAndDate(s, subjectId);

        sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void remove(final List<Long> grainIds, final Long subjectId, final Handler<Either<String, JsonObject>> handler) {
        String query = "DELETE FROM " + resourceTable + " WHERE subject_id = ? AND id IN " + Sql.listPrepared(grainIds.toArray());

        final SqlStatementsBuilder s = new SqlStatementsBuilder();
        final JsonArray all = new JsonArray();
        all.add(subjectId);
        all.addAll(new JsonArray(grainIds));
        s.prepared(query, all);
        updateMaxScoreAndDate(s, subjectId);

        sql.transaction(s.build(), SqlResult.validRowsResultHandler(1, handler));
    }

    private void updateMaxScoreAndDate(final SqlStatementsBuilder s, final Long subjectId) {
        //update max score of subject
        String updateSubjectQuery = "UPDATE " + schema + "subject SET max_score=(SELECT sum(cast(g.grain_data::json->>'max_score' as double precision)) FROM " +
                resourceTable + " as g WHERE g.subject_id=?), modified = NOW() WHERE id=?";
        s.prepared(updateSubjectQuery, new JsonArray().add(subjectId).add(subjectId));
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
        super.list(resource, "subject_id", "exercizer.subject", handler);
    }
    
    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectForLibrary(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
    	JsonArray joins = new JsonArray();
    	joins.add("JOIN exercizer.subject s ON r.subject_id = s.id AND s.is_library_subject = true AND s.id = " + resource.getValue("id"));
    	
    	super.list("r", joins, null, null, null, null, handler);
    }

    public void duplicateGrainIntoSubject(final Long subjectId, final JsonArray grainIdJa, final String host, final String acceptLanguage, final Handler<Either<String, JsonObject>> handler) {

        //TODO normalize the data model to create a title relational field (grain_data must be opaque),
        //Not needed anymore to look for grains, use of insert / select query with case when for title
        final List grainIds = grainIdJa.getList();
        final String query = "SELECT g.grain_type_id as grain_type_id, g.grain_data as grain_data, gt.public_name as default_title FROM " + resourceTable +
                " AS g INNER JOIN " + schema + "grain_type AS gt ON (g.grain_type_id=gt.id) WHERE g.id IN " +
                Sql.listPrepared(grainIds);
        sql.prepared(query, new JsonArray(grainIds), SqlResult.validResultHandler(new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                if (event.isRight()) {
                    final JsonArray ja = event.right().getValue();
                    duplicationGrain(ja, subjectId, host, acceptLanguage, handler);
                } else {
                    handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
                }
            }
        }));
    }

    private void duplicationGrain(final JsonArray grainJa, final Long subjectId, final String host, final String acceptLanguage, final Handler<Either<String, JsonObject>> handler) {

        final String titleSuffix = i18n.translate("exercizer.grain.title.copySuffix", host, acceptLanguage);
        final SqlStatementsBuilder s = new SqlStatementsBuilder();

        final String queryNewOrderBy = "(SELECT max(gr.order_by) + 1 FROM "+ resourceTable + " as gr WHERE gr.subject_id=?)";
        final String queryinsertGrain = "INSERT INTO " + resourceTable +"(subject_id, grain_type_id, order_by, grain_data) VALUES " +
                "(?,?," + queryNewOrderBy + ",?)";

        for (int i=0;i<grainJa.size();i++) {
            final JsonObject grainJo = grainJa.getJsonObject(i);
            //set title suffix
            final JsonObject grainData = new JsonObject(grainJo.getString("grain_data"));
            if (grainJo.getLong("grain_type_id") > 3) {
                grainData.put("title", grainData.getString("title", i18n.translate(grainJo.getString("default_title"), host, acceptLanguage)) + titleSuffix);
            }
            final JsonArray values = new JsonArray();
            values.add(subjectId).add(grainJo.getLong("grain_type_id")).add(subjectId).add(grainData);

            s.prepared(queryinsertGrain, values);
        }

        updateMaxScoreAndDate(s, subjectId);

        sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
    }

    public void getGrainsForExport(final String id, final Handler<Either<String, JsonArray>> handler){

        final String query = "SELECT gt.name, g.grain_data::jsonb" +
                " FROM exercizer.grain AS g INNER JOIN exercizer.grain_type AS gt ON g.grain_type_id = gt.id " +
                " WHERE g.subject_id = ? ORDER BY g.order_by";

        sql.prepared(query, new JsonArray().add(Sql.parseId(id)), SqlResult.validResultHandler(handler, "grain_data"));
    }
}
