package fr.openent.exercizer.services;

import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

import fr.wseduc.webutils.Either;

public interface ISubjectLessonTypeService {
	
	/**
     * @see org.entcore.common.service.impl.SqlCrudService
     */
    void list(final Handler<Either<String, JsonArray>> handler);

}
