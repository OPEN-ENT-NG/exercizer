package fr.openent.exercizer.services.impl;

import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainCopyService;
import fr.wseduc.webutils.Either;

import java.util.Arrays;

public class GrainCopyServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IGrainCopyService {
	
	public GrainCopyServiceSqlImpl() {
        super("exercizer", "grain_copy");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject grainCopy = ResourceParser.beforeAny(resource);
    	super.persist(grainCopy, handler);
    }

	private SqlStatementsBuilder updateGrain(final JsonObject resource) {
		// update copy grain
		JsonArray values = new JsonArray();
		StringBuilder updateGrainQuery = new StringBuilder();
		for (String attr : resource.getFieldNames()) {
			updateGrainQuery.append(attr).append(" = ?, ");
			values.add(resource.getValue(attr));
		}

		SqlStatementsBuilder s = new SqlStatementsBuilder();
		s.prepared(
				"UPDATE " + resourceTable + " SET " + updateGrainQuery.toString() + "modified = NOW() " + "WHERE id = ? RETURNING *",
				values.add(resource.getInteger("id")));
		return s;
	}

	@Override
    public void update(final JsonObject resource, String subjectiCopyState, final Handler<Either<String, JsonObject>> handler) {

		SqlStatementsBuilder s = updateGrain(resource);
		// update subject copy
		s.prepared(
				"UPDATE " + schema + "subject_copy SET modified=NOW(), " + subjectiCopyState+ "=true WHERE id = ? RETURNING *",
				new JsonArray().addNumber(resource.getNumber("subject_copy_id")));

		sql.transaction(s.build(), SqlResult.validUniqueResultHandler(1, handler));
	}

	@Override
	public void updateAndScore(final JsonObject resource, String subjectiCopyState, final Handler<Either<String, JsonObject>> handler) {
		SqlStatementsBuilder s = updateGrain(resource);
		// update subject copy
		s.prepared(
				"UPDATE "+schema+"subject_copy SET " +
						"modified=NOW(), " +
						"final_score=(select sum(final_score) from "+schema+"grain_copy where subject_copy_id = ?), " +
						"calculated_score=(select sum(calculated_score) from "+schema+"grain_copy where subject_copy_id = ?), "
						+ subjectiCopyState+ "=true WHERE id = ? RETURNING *",
				new JsonArray().addNumber(resource.getNumber("subject_copy_id"))
						.addNumber(resource.getNumber("subject_copy_id"))
						.addNumber(resource.getNumber("subject_copy_id")));

		sql.transaction(s.build(), SqlResult.validUniqueResultHandler(1, handler));
	}


    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
        super.list(resource, "subject_copy_id", "exercizer.subject_copy", handler);
    }

}
