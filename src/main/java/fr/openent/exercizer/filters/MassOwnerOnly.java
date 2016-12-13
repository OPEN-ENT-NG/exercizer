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

package fr.openent.exercizer.filters;

import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.request.RequestUtils;
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

public class MassOwnerOnly implements ResourcesProvider {

	@Override
	public void authorize(final HttpServerRequest request, final Binding binding, final UserInfos user,
						  final Handler<Boolean> handler) {
		final SqlConf conf = SqlConfs.getConf(binding.getServiceMethod().substring(0, binding.getServiceMethod().indexOf('|')));
		RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
			public void handle(JsonObject data) {
				final Object[] ids = data.getArray("ids", new JsonArray()).toArray();

				if (ids != null && ids.length > 0) {
					request.pause();
					final String sharedMethod = binding.getServiceMethod().replaceAll("\\.", "-");

					final String query =
							"SELECT count(*) FROM " + conf.getSchema() + conf.getTable() +
									" WHERE id IN " + Sql.listPrepared(ids) + " AND owner = ?";

					final JsonArray values = new JsonArray(ids).add(user.getUserId());

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
