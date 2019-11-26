package fr.openent.exercizer.filters;

import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

public class SubjectCopyCorrected implements ResourcesProvider {

    @Override
    public void authorize(final HttpServerRequest resourceRequest, final Binding binding, final UserInfos user,
                          final Handler<Boolean> handler) {

        final SqlConf conf = SqlConfs.getConf(binding.getServiceMethod().substring(0, binding.getServiceMethod().indexOf('|')));

        RequestUtils.bodyToJson(resourceRequest, new Handler<JsonObject>() {
            public void handle(JsonObject data) {
                final Long lid = data != null ? data.getLong("id") : null;
                final String id;
                if (lid == null) {
                    id = resourceRequest.params().get("id");
                    if (id == null) {
                        handler.handle(false);
                        return;
                    }
                } else {
                    id = lid.toString();
                }

                resourceRequest.pause();

                String query = "SELECT COUNT(sc.id) FROM " +
                        conf.getSchema() + "subject_scheduled as ss INNER JOIN " + conf.getSchema() + "subject_copy sc ON ss.id = sc.subject_scheduled_id " +
                        "WHERE "+("Student".equalsIgnoreCase(user.getType()) ? "sc.owner = ?" : "ss.owner = ?")+" AND sc.id = ? ";
                JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
                values.add(user.getUserId());
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
        });
    }
}
