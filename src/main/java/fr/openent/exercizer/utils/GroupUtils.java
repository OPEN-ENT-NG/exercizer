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

import org.entcore.common.user.UserUtils;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public final class GroupUtils {

	private GroupUtils() {

	}

	public static void findMembers(final EventBus eb, final String userId, final List<String> groupIds, Handler<JsonArray> handler) {
		final String customReturn =
				"MATCH (s:Group)<-[:IN]-(visibles) " +
						"WHERE s.id IN {groupIds} " +
						"RETURN DISTINCT visibles.id as _id, visibles.lastName + ' ' + visibles.firstName as name, visibles.profiles as profiles";
		final JsonObject params = new JsonObject().put("groupIds", new JsonArray(groupIds));
		UserUtils.findVisibleUsers(eb, userId, true, false, customReturn, params, handler);
	}

}
