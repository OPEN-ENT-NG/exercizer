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

package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.Exercizer;
import fr.wseduc.webutils.DefaultAsyncResult;
import fr.wseduc.webutils.Either;
import io.vertx.core.AsyncResult;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.storage.FileInfos;
import org.entcore.common.storage.StorageException;
import org.entcore.common.storage.impl.AbstractApplicationStorage;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;


import static org.entcore.common.sql.SqlResult.validResults;

public class ExercizerStorage extends AbstractApplicationStorage {

	private final Sql sql = Sql.getInstance();
	private static final String application = Exercizer.class.getSimpleName();

	@Override
	public void getInfo(final String fileId, final Handler<AsyncResult<FileInfos>> handler) {
		/* Used by the antivirus */
		final JsonArray params = new fr.wseduc.webutils.collections.JsonArray().add(fileId);
		final String query1 = "select s.owner, sd.metadata "+
			"from exercizer.subject_document sd "+
			"inner join exercizer.subject s on s.id=sd.subject_id "+
			"where sd.doc_id = ?";
		final String query2 = "select sc.owner, scf.metadata "+
			"from exercizer.subject_copy_file scf "+
			"inner join exercizer.subject_copy sc on sc.id = scf.subject_copy_id and scf.doc_type='homework' "+
			"where scf.file_id = ?";
		final String query3 = "select ss.owner, scf.metadata "+
			"from exercizer.subject_copy_file scf "+
			"inner join exercizer.subject_copy sc on sc.id = scf.subject_copy_id and scf.doc_type='corrected' "+
			"inner join exercizer.subject_scheduled ss on ss.id = sc.subject_scheduled_id "+
			"where scf.file_id = ?";
		final SqlStatementsBuilder builder = new SqlStatementsBuilder();
		builder.prepared(query1, params);
		builder.prepared(query2, params);
		builder.prepared(query3, params);
		sql.transaction(builder.build(), new Handler<Message<JsonObject>>() {
			@Override
			public void handle(Message<JsonObject> message) {
				Either<String, JsonArray> r = validResults(message);
				if (r.isRight() && r.right().getValue() != null) {
					for (Object o : r.right().getValue()) {
						if (o instanceof JsonArray && ((JsonArray) o).size() == 1) {
							final JsonObject res = ((JsonArray) o).getJsonObject(0);
							final FileInfos fi = new FileInfos();
							fi.setApplication(application);
							fi.setId(fileId);
							fi.setOwner(res.getString("owner"));
							JsonObject meta = null;
							if (res.getString("metadata") != null) {
								meta = new fr.wseduc.webutils.collections.JsonObject(res.getString("metadata"));
							}
							if (meta != null) {
								fi.setName(meta.getString("filename"));
								fi.setSize(meta.getInteger("size"));
							}
							handler.handle(new DefaultAsyncResult<>(fi));
							return;
						}
					}
					handler.handle(new DefaultAsyncResult<>((FileInfos) null));
				} else {
					handler.handle(new DefaultAsyncResult<FileInfos>(
							new StorageException(r.left().getValue())));
				}
			}
		});
	}

	@Override
	public void updateInfo(String fileId, FileInfos fileInfos, final Handler<AsyncResult<Integer>> handler) {
		/* Used by the antivirus */
		final JsonArray params = new fr.wseduc.webutils.collections.JsonArray().add(fileId);
		final String query1 =
				"update exercizer.subject_document " +
				"set metadata = jsonb_set(metadata, '{filename}', '\"" + fileInfos.getName() + "\"') " +
				"where doc_id = ?";
		final String query2 =
				"update exercizer.subject_copy_file " +
				"set metadata = jsonb_set(metadata, '{filename}', '\"" + fileInfos.getName() + "\"') " +
				"where file_id = ?";
		final SqlStatementsBuilder builder = new SqlStatementsBuilder();
		builder.prepared(query1, params);
		builder.prepared(query2, params);
		sql.transaction(builder.build(), new Handler<Message<JsonObject>>() {

			@Override
			public void handle(Message<JsonObject> message) {
				if ("ok".equals(message.body().getString("status"))) {
					Integer count = 0;
					if (message.body().getJsonArray("results") != null) {
						for (Object o : message.body().getJsonArray("results")) {
							if (o instanceof JsonObject) {
								count += ((JsonObject) o).getInteger("rows");
							}
						}
					}
					handler.handle(new DefaultAsyncResult<>(count));
				} else {
					handler.handle(new DefaultAsyncResult<Integer>(
							new StorageException(message.body().getString("message"))));
				}
			}
		});
	}

}
