package fr.openent.exercizer.services;

import fr.wseduc.webutils.Either;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

public interface IGrainTypeService {

    /**
     * @see org.entcore.common.service.impl.SqlCrudService
     */
    void list(final Handler<Either<String, JsonArray>> handler);

}
