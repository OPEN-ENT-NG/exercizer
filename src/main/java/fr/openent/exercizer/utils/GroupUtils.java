package fr.openent.exercizer.utils;

import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

public final class GroupUtils {

	private GroupUtils() {

	}

	public static void findMembers(final EventBus eb, final String userId, final List<String> groupIds, Handler<JsonArray> handler) {
		final String customReturn =
				"MATCH (s:Group)<-[:IN]-(visibles) " +
						"WHERE s.id IN {groupIds} " +
						"RETURN DISTINCT visibles.id as _id, visibles.displayName as name ";
		final JsonObject params = new JsonObject().putArray("groupIds", new JsonArray(groupIds));
		UserUtils.findVisibleUsers(eb, userId, true, false, customReturn, params, handler);
	}

}
