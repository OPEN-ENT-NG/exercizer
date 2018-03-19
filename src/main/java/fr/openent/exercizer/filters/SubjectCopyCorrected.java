package fr.openent.exercizer.filters;

import fr.wseduc.webutils.http.Binding;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

public class SubjectCopyCorrected implements ResourcesProvider {

    @Override
    public void authorize(final HttpServerRequest resourceRequest, final Binding binding, final UserInfos user,
                          final Handler<Boolean> handler) {

        final String id = resourceRequest.params().get("id");
        final SqlConf conf = SqlConfs.getConf(binding.getServiceMethod().substring(0, binding.getServiceMethod().indexOf('|')));

        if (id == null) {
            handler.handle(false);
            return;
        }

        resourceRequest.pause();

        String query = "SELECT COUNT(sc.id) FROM " +
                conf.getSchema() + "subject_scheduled as ss INNER JOIN " + conf.getSchema() + "subject_copy sc ON ss.id = sc.subject_scheduled_id " +
                "WHERE "+("Student".equalsIgnoreCase(user.getType()) ? "sc.owner = ?" : "ss.owner = ?")+" AND sc.id = ? ";
        JsonArray values = new JsonArray();
        values.addString(user.getUserId());
        values.add(Sql.parseId(id));

        Sql.getInstance().prepared(query,  values, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> message) {
                resourceRequest.resume();
                Long count = SqlResult.countResult(message);
                handler.handle(count != null && count > 0);
            }
        });
    }
}