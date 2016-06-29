package fr.openent.exercizer.services.impl;

import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.services.ISubjectLessonLevelService;
import fr.wseduc.webutils.Either;

public class SubjectLessonLevelServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectLessonLevelService {

    public SubjectLessonLevelServiceSqlImpl() {
        super("exercizer", "subject_lesson_level");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    public void list(final Handler<Either<String, JsonArray>> handler) {
    	JsonArray orderBy = new JsonArray();
    	orderBy.addString("ORDER BY r.label ASC");
        super.list("r", null, null, orderBy, null, null, handler);
    }
    
    /**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	public void listBySubjectIdList(final JsonObject resources, final Handler<Either<String, JsonArray>> handler) {
		JsonArray subjectIdList = resources.getArray("subject_id_list");
		
		JsonArray joins = new JsonArray();
		joins.addString("JOIN exercizer.subject_library_main_information slmi ON r.id = slmi.subject_lesson_level_id");

		JsonArray filters = new JsonArray();
		filters.addString("WHERE");
		filters.addString("slmi.subject_id = " + subjectIdList.get(0));

		for (Object subjectId : subjectIdList) {
			if (!subjectIdList.get(0).equals(subjectId)) {
				filters.addString("OR slmi.subject_id = " + subjectId);
			}
		}
		
		JsonArray orderBy = new JsonArray();
		orderBy.addString("ORDER BY slmi.subject_id ASC");

		super.list("r", joins, filters, orderBy, null, null, handler);
	}

}
