package fr.openent.exercizer.services;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import fr.wseduc.webutils.Either;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

public interface ISubjectService {

    void persist(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void update(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void remove(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void list(List<String> groupsAndUserIds, UserInfos user, Handler<Either<String, JsonArray>> handler);

}
