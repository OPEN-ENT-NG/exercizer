package fr.openent.exercizer.services.impl;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.services.ISubjectTagService;
import fr.wseduc.webutils.Either;

public class SubjectTagServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectTagService {

    public SubjectTagServiceSqlImpl() {
        super("exercizer", "subject_tag");
    }
    
    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	super.persist(resource, user, handler);
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
	public void listBySubjectId(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
		JsonArray joins = new JsonArray();
		joins.addString("JOIN exercizer.subject_library_tag slt ON r.id = slt.subject_tag_id");

		JsonArray filters = new JsonArray();
		filters.addString("WHERE");
		filters.addString("slt.subject_id = " + resource.getString("subjectId"));

		super.list("r", joins, filters, null, null, null, handler);
	}

}
