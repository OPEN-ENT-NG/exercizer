package fr.openent.exercizer.services;

import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.webutils.Either;

public interface IGrainCopyService {
	
	/**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void update(final JsonObject resource, String subjectCopyState, final Handler<Either<String, JsonObject>> handler);

	void updateAndScore(final JsonObject resource, String subjectiCopyState, final Handler<Either<String, JsonObject>> handler);
		/**
		 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
		 */
    void list(final JsonObject resource, final Handler<Either<String, JsonArray>> handler);

}
