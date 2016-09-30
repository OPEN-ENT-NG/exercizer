package fr.openent.exercizer.services.impl;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainScheduledService;
import fr.wseduc.webutils.Either;

public class GrainScheduledServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IGrainScheduledService {
	
	public GrainScheduledServiceSqlImpl() {
        super("exercizer", "grain_scheduled");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject grainScheduled = ResourceParser.beforeAny(resource);
    	super.persist(grainScheduled, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final JsonObject resource, final Handler<Either<String, JsonArray>> handler) {
        super.list(resource, "subject_scheduled_id", "exercizer.subject_scheduled", handler);
    }

}
