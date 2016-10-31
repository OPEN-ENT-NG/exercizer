package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.services.IGrainService;
import fr.wseduc.webutils.Either;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

public class GrainServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IGrainService {

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
        updateMaxScore(s, subjectId);

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

        updateMaxScore(s, subjectId);

        sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void remove(final Long id, final Long subjectId, final Handler<Either<String, JsonObject>> handler) {
        String query = "DELETE FROM " + resourceTable + " WHERE id = ?";

        final SqlStatementsBuilder s = new SqlStatementsBuilder();

        s.prepared(query, new JsonArray().add(id));
        updateMaxScore(s, subjectId);

        sql.transaction(s.build(), SqlResult.validRowsResultHandler(1, handler));
    }

    private void updateMaxScore(final SqlStatementsBuilder s, final Long subjectId) {
        //update max score of subject
        String updateSubjectQuery = "UPDATE " + schema + "subject SET max_score=(SELECT sum(cast(g.grain_data::json->>'max_score' as double precision)) FROM " +
                resourceTable + " as g WHERE g.subject_id=?) WHERE id=?";
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
    	joins.addString("JOIN exercizer.subject s ON r.subject_id = s.id AND s.is_library_subject = true AND s.id = " + resource.getField("id"));
    	
    	super.list("r", joins, null, null, null, null, handler);
    }
}
