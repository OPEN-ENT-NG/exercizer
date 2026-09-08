/*
 * Copyright © Région Nord Pas de Calais-Picardie.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package fr.openent.exercizer.utils;

import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserUtils;

import java.util.List;

public final class GroupUtils {

	private GroupUtils() {

	}

	/**
	 * Members of the given groups that the user can see, the user included.
	 * @return [{_id, name, profiles}] through the handler, null on failure
	 */
	public static void findMembers(final EventBus eb, final String userId, final List<String> groupIds, Handler<JsonArray> handler) {
		UserUtils.findVisibleMembersOfGroups(eb, userId, groupIds, true)
				.onSuccess( members -> handler.handle(map(members)))
				.onFailure( t -> handler.handle(null));
	}

	private static JsonArray map(JsonArray members) {
		JsonArray mappedMembers = new JsonArray();
		members.forEach( o -> {
			JsonObject member = (JsonObject) o;
			mappedMembers.add(new JsonObject()
									.put("_id", member.getString("id"))
									.put("name", member.getString("displayName"))
									.put("profiles", member.getJsonArray("profiles", new JsonArray())));
		});
		return mappedMembers;
	}

}
