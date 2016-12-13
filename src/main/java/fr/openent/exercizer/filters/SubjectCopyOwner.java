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

public class SubjectCopyOwner implements ResourcesProvider {

	@Override
	public void authorize(final HttpServerRequest resourceRequest, final Binding binding, final UserInfos user,
			final Handler<Boolean> handler) {
		
		resourceRequest.pause();
		
		String query = "SELECT COUNT(*) FROM exercizer.subject_scheduled as ss JOIN exercizer.subject_copy sc ON ss.id = sc.subject_scheduled_id WHERE sc.owner = ?";
		JsonArray values = new JsonArray();
		values.addString(user.getUserId());
		
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
