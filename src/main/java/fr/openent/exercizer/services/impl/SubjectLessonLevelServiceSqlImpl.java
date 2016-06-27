package fr.openent.exercizer.services.impl;

import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

import fr.openent.exercizer.services.ISubjectLessonLevelService;
import fr.wseduc.webutils.Either;

public class SubjectLessonLevelServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectLessonLevelService {

    public SubjectLessonLevelServiceSqlImpl() {
        super("exercizer", "subject_lesson_level");
    }

    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    public void list(final Handler<Either<String, JsonArray>> handler) {
    	JsonArray orderBy = new JsonArray();
    	orderBy.addString("r.label ASC");
        super.list("r", null, null, orderBy, null, null, handler);
    }

}
