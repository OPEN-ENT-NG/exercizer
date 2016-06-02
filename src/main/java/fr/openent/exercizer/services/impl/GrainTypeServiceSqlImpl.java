package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.services.IGrainTypeService;
import fr.wseduc.webutils.Either;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

public class GrainTypeServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements IGrainTypeService {

    public GrainTypeServiceSqlImpl() {
        super("exercizer", "grain_type");
    }

    /**
     * @see org.entcore.common.service.impl.SqlCrudService
     */
    public void list(final Handler<Either<String, JsonArray>> handler) {
        super.list(handler);
    }

}
