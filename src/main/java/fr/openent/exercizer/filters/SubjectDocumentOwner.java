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

public class SubjectDocumentOwner implements ResourcesProvider {

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

		String query = "SELECT COUNT(*) FROM "+conf.getSchema()+"subject as s WHERE s.id = ? AND s.owner = ?";
		JsonArray values = new JsonArray();
		values.add(Sql.parseId(id));
		values.add(user.getUserId());
		
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
