package fr.openent.exercizer.services.impl;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.parsers.SubjectCopyParser;
import fr.openent.exercizer.services.ISubjectCopyService;
import fr.wseduc.webutils.Either;

public class SubjectCopyServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectCopyService {

	public SubjectCopyServiceSqlImpl() {
		super("exercizer", "subject_copy");
	}
	
	/**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        JsonObject subjectCopy = SubjectCopyParser.beforePersist(resource, user);
        super.persist(subjectCopy, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        JsonObject subjectCopy = SubjectCopyParser.beforeUpdate(resource);
        super.update(subjectCopy, user, handler);
    }
    
    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list(user, handler);
    }
    
    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectScheduledList(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list("subject_scheduled_id", "exercizer.subject_scheduled", Boolean.TRUE, user, handler);
    }

}
