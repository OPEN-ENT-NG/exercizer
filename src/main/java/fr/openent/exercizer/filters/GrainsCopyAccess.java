package fr.openent.exercizer.filters;

import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;

public class GrainsCopyAccess implements ResourcesProvider {

    @Override
    public void authorize(final HttpServerRequest resourceRequest, final Binding binding, final UserInfos user,
                          final Handler<Boolean> handler) {

        final SqlConf conf = SqlConfs.getConf(binding.getServiceMethod().substring(0, binding.getServiceMethod().indexOf('|')));

        RequestUtils.bodyToJson(resourceRequest, new Handler<JsonObject>() {
            public void handle(JsonObject data) {
                final Long id = data.getLong("id");
                final String ownerId = data.getString("owner");
                if (id == null) {
                    handler.handle(false);
                } else {
                    resourceRequest.pause();
                    JsonArray values = new JsonArray();
                    String query = "SELECT COUNT(sc.id) FROM " +
                            conf.getSchema() + "subject_scheduled as ss INNER JOIN " + conf.getSchema() + "subject_copy sc ON ss.id = sc.subject_scheduled_id " +
                            "WHERE sc.id = ? ";
                    values.add(id);
                    values.add(user.getUserId());

                    if(ownerId.equals(user.getUserId())){
                        query += " AND sc.owner = ? AND NOW() at time zone 'utc' - (? * interval '1 minute') >= ss.begin_date";
                        values.add(data.getInteger("offset", 0));
                    }else {
                        query += " AND ss.owner = ? ";
                    }

                    Sql.getInstance().prepared(query, values, new Handler<Message<JsonObject>>() {
                        @Override
                        public void handle(Message<JsonObject> message) {
                            resourceRequest.resume();
                            Long count = SqlResult.countResult(message);
                            handler.handle(count != null && count > 0);
                        }
                    });
                }
            }
        });
    }
}
