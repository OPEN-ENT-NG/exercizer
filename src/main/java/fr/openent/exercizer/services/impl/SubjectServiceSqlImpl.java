package fr.openent.exercizer.services.impl;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import fr.wseduc.webutils.Either;
import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.ISubjectService;

import java.util.List;

public class SubjectServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectService {

    public SubjectServiceSqlImpl() {
        super("exercizer", "subject", "subject_shares");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        JsonObject subject = ResourceParser.beforeAny(resource);
        subject.putString("owner", user.getUserId());
        super.persist(subject, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject subject = ResourceParser.beforeAny(resource);
        super.update(subject, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void remove(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject subject = ResourceParser.beforeAny(resource);
    	subject.putValue("folder_id", null);
        subject.putBoolean("is_deleted", Boolean.TRUE);
        update(subject, user, handler);
    }
    
    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final Handler<Either<String, JsonArray>> handler) {
    	JsonArray filters = new JsonArray();
    	filters.addString("is_library_subject = true");
        filters.addString("is_deleted = false");
        
    	super.list(filters, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final List<String> groupsAndUserIds, final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        JsonArray filters = new JsonArray();
        filters.addString("is_deleted = false");
        super.list(filters, groupsAndUserIds, user, handler);
    }
}