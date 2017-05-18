package fr.openent.exercizer.filters;

import fr.wseduc.webutils.http.Binding;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

public class ArchiveSubjectsScheduledOwner implements ResourcesProvider {

    @Override
    public void authorize(final HttpServerRequest resourceRequest, final Binding binding, final UserInfos user, final Handler<Boolean> handler) {
        final List<String> ids = resourceRequest.params().getAll("id");
        if (ids == null || ids.size() < 1) {
            handler.handle(false);
            return;
        }
        resourceRequest.pause();
        String query = "SELECT COUNT(*) FROM exercizer.subject_scheduled as ss WHERE ss.is_archived = true AND ss.owner = ? AND ss.id IN " + Sql.listPrepared(ids.toArray()) ;
        JsonArray values = new JsonArray();
        values.addString(user.getUserId());
        for (String id: ids) {
            values.add(Sql.parseId(id));
        }
        Sql.getInstance().prepared(query,  values, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> message) {
                resourceRequest.resume();
                Long count = SqlResult.countResult(message);
                handler.handle(count != null && count == ids.size());
            }
        });
    }
}
