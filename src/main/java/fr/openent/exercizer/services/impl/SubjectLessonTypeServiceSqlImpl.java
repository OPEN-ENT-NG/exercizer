package fr.openent.exercizer.services.impl;

import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

import fr.openent.exercizer.services.ISubjectLessonTypeService;
import fr.wseduc.webutils.Either;

public class SubjectLessonTypeServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectLessonTypeService {

    public SubjectLessonTypeServiceSqlImpl() {
        super("exercizer", "subject_lesson_type");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    public void list(final Handler<Either<String, JsonArray>> handler) {
    	JsonArray orderBy = new JsonArray();
    	orderBy.addString("r.label ASC");
        super.list("r", null, null, orderBy, null, null, handler);
    }

}
