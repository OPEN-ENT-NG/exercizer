package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.services.IFolderService;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

public class FolderServiceSqlImpl extends SqlCrudService implements IFolderService {

    public FolderServiceSqlImpl() {
        super("exercizer", "folder");
    }

    @Override
    public void persist(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        super.create(resource, user, handler);
    }

    @Override
    public void update(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        super.update(resource.getString("id"), resource, user, handler);
    }

    @Override
    public void remove(JsonObject resource, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        super.delete(resource.getString("id"), user, handler);
    }

    @Override
    public void list(UserInfos user, Handler<Either<String, JsonArray>> handler) {
        super.list(VisibilityFilter.OWNER, user, handler);
    }
}
