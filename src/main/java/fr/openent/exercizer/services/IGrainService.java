package fr.openent.exercizer.services;

import fr.wseduc.webutils.Either;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

public interface IGrainService {

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void persist(final JsonObject resource, final Long subjectId, final Handler<Either<String, JsonObject>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void update(final JsonObject resource, final Long id, final Long subjectId, final Handler<Either<String, JsonObject>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void remove(final List<Long> id, final Long subjectId, final Handler<Either<String, JsonObject>> handler);

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void list(final JsonObject resource, final Handler<Either<String, JsonArray>> handler);
    
    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    void listBySubjectForLibrary(final JsonObject resource, final Handler<Either<String, JsonArray>> handler);

    public void duplicateGrainIntoSubject(final Long subjectId, final JsonArray grainIdJa, final String titleSuffix, final Handler<Either<String, JsonObject>> handler);
}