package fr.openent.exercizer.services;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import fr.wseduc.webutils.Either;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

public interface ISubjectService {

    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void remove(final JsonObject resource, final UserInfos user, Handler<Either<String, JsonObject>> handler);

    /**
     *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void list(final List<String> groupsAndUserIds , final UserInfos user, final Handler<Either<String, JsonArray>> handler);

}
