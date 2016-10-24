package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainService;
import fr.wseduc.webutils.Either;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
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
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject grain = ResourceParser.beforeAny(resource);
    	super.persist(grain, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	final JsonObject grain = ResourceParser.beforeAny(resource);

        final Long subjectId = grain.getLong("subject_id");

        final StringBuilder query = new StringBuilder();
        final JsonArray values = new JsonArray();

        for (String attr : grain.getFieldNames()) {
            query.append(attr).append(" = ?, ");
            values.add(grain.getValue(attr));
        }
        final String updateGrainQuery = "UPDATE " + resourceTable + " SET " + query.toString() + "modified = NOW() " + "WHERE id = ?";

        final SqlStatementsBuilder s = new SqlStatementsBuilder();

        s.prepared(updateGrainQuery, values.add(grain.getLong("id")));
        //update max score of subject
        String updateSubjectQuery = "UPDATE exercizer.subject SET max_score=(SELECT sum(cast(g.grain_data::json->>'max_score' as double precision)) FROM exercizer.grain as g WHERE g.subject_id=?) WHERE id=?";
        s.prepared(updateSubjectQuery, new JsonArray().add(subjectId).add(subjectId));

        sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
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
