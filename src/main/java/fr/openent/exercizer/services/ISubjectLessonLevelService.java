package fr.openent.exercizer.services;

import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

import fr.wseduc.webutils.Either;

public interface ISubjectLessonLevelService {
	
	/**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void list(final Handler<Either<String, JsonArray>> handler);

}
