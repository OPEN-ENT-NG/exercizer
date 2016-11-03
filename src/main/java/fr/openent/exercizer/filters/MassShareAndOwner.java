package fr.openent.exercizer.filters;

import fr.wseduc.webutils.Server;
import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.Config;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class MassShareAndOwner implements ResourcesProvider {

	@Override
	public void authorize(final HttpServerRequest request, final Binding binding, final UserInfos user,
						  final Handler<Boolean> handler) {
		final SqlConf conf = SqlConfs.getConf(binding.getServiceMethod().substring(0, binding.getServiceMethod().indexOf('|')));
		RequestUtils.bodyToJson(request, Server.getPathPrefix(Config.getInstance().getConfig()) + "duplicateSubjects", new Handler<JsonObject>() {
			public void handle(JsonObject data) {
				final Object[] ids = data.getArray("subjectIds").toArray();
				if (ids != null && ids.length > 0) {
					request.pause();
					String sharedMethod = binding.getServiceMethod().replaceAll("\\.", "-");
					List<String> gu = new ArrayList<>();
					gu.add(user.getUserId());
					if (user.getGroupsIds() != null) {
						gu.addAll(user.getGroupsIds());
					}
					final Object[] groupsAndUserIds = gu.toArray();
					String query =
							"SELECT count(DISTINCT id) FROM " + conf.getSchema() + conf.getTable() +
									" LEFT JOIN " + conf.getSchema() + conf.getShareTable() + " ON id = resource_id " +
									"WHERE ((member_id IN " + Sql.listPrepared(groupsAndUserIds) + " AND action = ?) " +
									"OR owner = ?) AND id IN " + Sql.listPrepared(ids);
					JsonArray values = new JsonArray(groupsAndUserIds).add(sharedMethod)
							.add(user.getUserId());

					for (final Object id : ids) {
						values.add(id);
					}

					Sql.getInstance().prepared(query, values, new Handler<Message<JsonObject>>() {
						@Override
						public void handle(Message<JsonObject> message) {
							request.resume();
							Long count = SqlResult.countResult(message);
							handler.handle(count != null && count == ids.length);
						}
					});
				} else {
					handler.handle(false);
				}
			}
		});
	}
}