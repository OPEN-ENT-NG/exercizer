package fr.openent.exercizer.services;

import fr.wseduc.webutils.Either;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

public interface IGrainService {

    void persist(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void update(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void remove(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void listBySubject(JsonObject resource, List<String> groupsAndUserIds, UserInfos user, Handler<Either<String, JsonArray>> handler);

}
