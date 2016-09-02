package fr.openent.exercizer.services;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.webutils.Either;

public interface IScheduleSubjectService {
	
	void schedule(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

}
