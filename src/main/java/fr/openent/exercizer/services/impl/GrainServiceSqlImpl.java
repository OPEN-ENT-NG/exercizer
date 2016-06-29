package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainService;
import fr.wseduc.webutils.Either;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

public class GrainServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IGrainService {

    public GrainServiceSqlImpl() {
        super("exercizer", "grain");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject grain = ResourceParser.beforeAny(resource);
    	super.persist(grain, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject grain = ResourceParser.beforeAny(resource);
        super.update(grain, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void remove(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        super.delete(resource, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
        super.list(resource, "subject_id", "exercizer.subject", handler);
    }
    
    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectForLibrary(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
    	JsonArray joins = new JsonArray();
    	joins.addString("JOIN exercizer.subject s ON r.subject_id = s.id AND s.is_library_subject = true");
    	
    	super.list("r", joins, null, null, null, null, handler);
    }
}
