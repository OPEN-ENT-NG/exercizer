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

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.ISubjectScheduledService;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.*;

public class SubjectScheduledServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectScheduledService {
	
	protected static final Logger log = LoggerFactory.getLogger(Renders.class);

    public SubjectScheduledServiceSqlImpl() {
        super("exercizer", "subject_scheduled");
    }

	@Override
	public void retieve(String id, Handler<Either<String, JsonObject>> handler) {
		super.retrieve(id, handler);
	}

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject subjectScheduled = ResourceParser.beforeAny(resource);
    	subjectScheduled.put("owner", user.getUserId());
    	subjectScheduled.put("owner_username", user.getUsername());
        super.persist(subjectScheduled, user, handler);
    }

	@Override
	public void getCorrectedDownloadInformation(final String id, final Handler<Either<String, JsonObject>> handler) {
		super.getCorrectedDownloadInformation(id, "s.owner, s.corrected_file_id, s.corrected_metadata, s.corrected_date", handler);
	}

	@Override
	public void addCorrectedFile(final String id, final String fileId, final JsonObject metadata, final Handler<Either<String, JsonObject>> handler) {
		final SqlStatementsBuilder builder = new SqlStatementsBuilder();

		final String query =
				"UPDATE " + resourceTable +
						" SET corrected_file_id=?,corrected_metadata=?::jsonb,modified = NOW() " +
						"WHERE id = ? ";

		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		values.add(fileId);
		values.add(metadata);
		values.add(Sql.parseId(id));

		builder.prepared(query,values);

		//Mark as corrected all copies
		final String queryCopies = "UPDATE " + schema + "subject_copy SET is_corrected=true, modified = NOW() WHERE subject_scheduled_id = ?";

		builder.prepared(queryCopies, new fr.wseduc.webutils.collections.JsonArray().add(Sql.parseId(id)));

		sql.transaction(builder.build(), SqlResult.validUniqueResultHandler(0, handler));

	}

	@Override
	public void removeCorrectedFile(final String id, final Handler<Either<String, JsonObject>> handler) {
		final SqlStatementsBuilder builder = new SqlStatementsBuilder();
		final String query =
				"UPDATE " + resourceTable +
						" SET corrected_file_id=null,corrected_metadata=null,modified = NOW() " +
						"WHERE id = ? ";

		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		values.add(Sql.parseId(id));

		builder.prepared(query,values);

		//Mark as not corrected all copies that don't have individual correction
		final String queryCopies = "UPDATE " + schema + "subject_copy SET is_corrected=false, modified = NOW() WHERE " +
				"corrected_file_id IS NULL AND subject_scheduled_id = ?";

		builder.prepared(queryCopies, new fr.wseduc.webutils.collections.JsonArray().add(Sql.parseId(id)));

		sql.transaction(builder.build(), SqlResult.validUniqueResultHandler(0, handler));
	}

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
		final String query = "SELECT * " +
				" FROM " + resourceTable + " AS ss WHERE ss.owner = ? AND ss.is_archived = false AND ss.is_training_mode = false";
		sql.prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(user.getUserId()), SqlResult.validResultHandler(handler));
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void listBySubjectCopyList(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list("subject_scheduled_id", "exercizer.subject_copy", Boolean.FALSE, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void getById(final String id, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        super.getById(id, user, handler);
    }

	/**
	 * @see fr.openent.exercizer.services.ISubjectScheduledService
	 */
	@Override
	public void schedule(final JsonObject scheduledSubject, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		final String queryNewSubjectScheduledId = "SELECT nextval('" + schema + "subject_scheduled_id_seq') as id";

		final Map<Number,JsonObject> mapIdGrainCustomCopyData = transformJaInMapCustomCopyData(scheduledSubject.getJsonArray("grainsCustomCopyData"));

		final Long fromSubjectId = scheduledSubject.getLong("subjectId");
		final JsonArray usersJa = scheduledSubject.getJsonArray("users");
		final Boolean is_training_mode = scheduledSubject.getBoolean("isTrainingMode", false);

		//to prevent modification of the model and data migration, temporarily, we recovered grains of subject to associate custom data copies.
		// in the next refactor step, grain entry can directly contain custom_data for copies of grain
		final String queryGain = "SELECT g.id, g.grain_type_id, g.order_by, g.grain_data FROM " + schema + "grain as g " +
				" WHERE g.subject_id = ? and g.grain_type_id > 2";
		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray().add(fromSubjectId);
		sql.prepared(queryGain,values, SqlResult.validResultHandler(new Handler<Either<String, JsonArray>>() {
			@Override
			public void handle(Either<String, JsonArray> event) {
				if (event.isRight()) {
					final JsonArray grainJa = event.right().getValue();
					sql.raw(queryNewSubjectScheduledId, SqlResult.validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							if (event.isRight()) {
								final Long subjectScheduledId = event.right().getValue().getLong("id");
								final SqlStatementsBuilder s = new SqlStatementsBuilder();

								createScheduledSubject(s, fromSubjectId, subjectScheduledId, scheduledSubject, user);
								createScheduledGrain(s, subjectScheduledId, fromSubjectId, grainJa, mapIdGrainCustomCopyData);
								createSubjectsCopies(s, is_training_mode.booleanValue(), subjectScheduledId, usersJa);
								createGrainCopies(s, is_training_mode.booleanValue(), subjectScheduledId, null);
								sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, done -> {
									if (scheduledSubject.getBoolean("randomDisplay", false).booleanValue()) {
										Future<Void> future = assignGrainCopiesRandomOrder(subjectScheduledId);
										future.setHandler(h -> handler.handle(done));
									} else {
										handler.handle(done);
									}
								}));
							} else {
								log.error("failure to schedule subject : " + event.left().getValue());
								handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
							}
						}
					}));
				} else {
					log.error("failure to schedule subject : " + event.left().getValue());
					handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
				}
			}
		}));
	}

	/**
	 * @see fr.openent.exercizer.services.ISubjectScheduledService
	 */
	@Override
	public void simpleSchedule(final JsonObject scheduledSubject, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		final String queryNewSubjectScheduledId = "SELECT nextval('" + schema + "subject_scheduled_id_seq') as id";

		final Long fromSubjectId = scheduledSubject.getLong("subjectId");
		final JsonArray usersJa = scheduledSubject.getJsonArray("users");

		sql.raw(queryNewSubjectScheduledId, SqlResult.validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				if (event.isRight()) {
					final Long subjectScheduledId = event.right().getValue().getLong("id");
					final SqlStatementsBuilder s = new SqlStatementsBuilder();

					createSimpleScheduledSubject(s, fromSubjectId, subjectScheduledId, scheduledSubject, user);
					createSubjectsCopies(s, false, subjectScheduledId, usersJa);

					sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
				} else {
					log.error("failure to schedule simple subject : " + event.left().getValue());
					handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
				}
			}
		}));
	}

	/**
	 * @see fr.openent.exercizer.services.ISubjectScheduledService
	 */
	@Override
	public void unSchedule(final Long subjectScheduledId, final Handler<Either<String, JsonObject>> handler) {
		final String query = "DELETE FROM " + schema + "subject_scheduled WHERE id = ?";

		sql.prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(subjectScheduledId), SqlResult.validRowsResultHandler(handler));

	}

	/**
	 * @see fr.openent.exercizer.services.ISubjectScheduledService
	 */
	public void findUnscheduledData(final Long subjectScheduledId, final Handler<Either<String, JsonObject>> handler) {
		final String query = "SELECT ss.title, ss.due_date, array_to_json(array_agg(sc.owner)) AS owners FROM " +
				schema + "subject_scheduled AS ss INNER JOIN " + schema + "subject_copy AS sc ON ss.id=sc.subject_scheduled_id " +
				"WHERE ss.id = ? GROUP BY ss.title, ss.due_date";

		sql.prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(subjectScheduledId), SqlResult.validUniqueResultHandler(handler, "owners"));
	}

	private Map<Number, JsonObject> transformJaInMapCustomCopyData(JsonArray grainsCustomCopyData) {
		final Map<Number, JsonObject> mapIdGrainCustomCopyData = new HashMap<>();
		for (int i=0;i<grainsCustomCopyData.size();i++) {
			final JsonObject jo = grainsCustomCopyData.getJsonObject(i);
			mapIdGrainCustomCopyData.put(jo.getLong("grain_id"), jo.getJsonObject("grain_copy_data"));
		}

		return mapIdGrainCustomCopyData;
	}

	private void createScheduledSubject(final SqlStatementsBuilder s, final Long subjectId, final Long scheduledSubjectId, final JsonObject scheduledSubject, UserInfos user) {

		final String query = "INSERT INTO " + schema + "subject_scheduled (id, subject_id, title, description, picture, max_score, " +
				"owner, owner_username, begin_date, due_date, estimated_duration, is_one_shot_submit, random_display, is_training_mode, is_training_permitted, scheduled_at, type, is_notify, use_time, locale) " +
				"SELECT ?, s.id, s.title, s.description, s.picture, s.max_score, ?, ?, ?::timestamp , ?::timestamp, ?, ?, ?, ?, ?, ?::json, s.type, ?, ?, ? FROM " + schema + "subject as s " +
				"WHERE s.id=? RETURNING id";

		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		values.add(scheduledSubjectId)
				.add(user.getUserId())
				.add(user.getUsername())
				.add(scheduledSubject.getValue("beginDate"))
				.add(scheduledSubject.getValue("dueDate"))
				.add(scheduledSubject.getString("estimatedDuration", ""))
				.add(scheduledSubject.getBoolean("isOneShotSubmit"))
				.add(scheduledSubject.getBoolean("randomDisplay", false))
				.add(scheduledSubject.getBoolean("isTrainingMode", false))
				.add(scheduledSubject.getBoolean("isTrainingPermitted", false))
				.add(scheduledSubject.getJsonObject("scheduledAt"))
				.add(scheduledSubject.getBoolean("isNotify"))
				.add(scheduledSubject.getBoolean("useTime", true))
				.add(scheduledSubject.getString("locale"))
				.add(subjectId);

		s.prepared(query, values);
	}

	private void createSimpleScheduledSubject(final SqlStatementsBuilder s, final Long subjectId, final Long scheduledSubjectId, final JsonObject scheduledSubject, UserInfos user) {

		final String query = "INSERT INTO " + schema + "subject_scheduled (id, subject_id, title, description, picture, " +
				"owner, owner_username, begin_date, due_date, corrected_date, scheduled_at, type, is_notify, use_time, locale) " +
				"SELECT ?, s.id, s.title, s.description, s.picture, ?, ?, ?::timestamp , ?::timestamp, ?::timestamp, ?::json, s.type, ?, ?, ? FROM " + schema + "subject as s " +
				"WHERE s.id=? RETURNING id";

		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		values.add(scheduledSubjectId).add(user.getUserId()).add(user.getUsername()).add(scheduledSubject.getValue("beginDate"))
				.add(scheduledSubject.getValue("dueDate")).add(scheduledSubject.getString("correctedDate"))
				.add(scheduledSubject.getJsonObject("scheduledAt")).add(scheduledSubject.getBoolean("isNotify"))
				.add(scheduledSubject.getBoolean("useTime", true))
				.add(scheduledSubject.getString("locale"))
				.add(subjectId);

		s.prepared(query, values);
	}


	private void createScheduledGrain(final SqlStatementsBuilder s, final Long subjectScheduledId, final Long fromSubjectId, final JsonArray grainJa, final Map<Number,JsonObject> mapIdGrainCustomCopyData) {
		/*the potential target : final String query = "INSERT INTO " + schema + "grain_scheduled (subject_scheduled_id, grain_type_id, created, order_by, grain_data, grain_custom_data) " +
				"SELECT ?, g.grain_type_id, NOW(), g.order_by, g.grain_data, g.grain_custom_data FROM " + schema + "subject as s INNER JOIN " + schema + "grain as g on (s.id = g.subject_id) " +
				"WHERE s.id=? AND g.grain_type_id > 2";*/
		final StringBuilder bulkInsertScheduledGrain = new StringBuilder("INSERT INTO " + schema + "grain_scheduled (subject_scheduled_id, grain_type_id, order_by, grain_data, grain_custom_data) VALUES ");
		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray();

		for (int i=0;i<grainJa.size();i++) {
			final JsonObject grainJo = grainJa.getJsonObject(i);

			values.add(subjectScheduledId).add(grainJo.getLong("grain_type_id")).add(grainJo.getInteger("order_by"))
					.add(grainJo.getString("grain_data")).add(mapIdGrainCustomCopyData.get(grainJo.getLong("id")));

			bulkInsertScheduledGrain.append("(?,?,?,?,?),");

		}

		bulkInsertScheduledGrain.deleteCharAt(bulkInsertScheduledGrain.length() - 1);

		s.prepared(bulkInsertScheduledGrain.toString(),values);
	}


	private void createSubjectsCopies(final SqlStatementsBuilder s, final boolean is_training, final Long subjectScheduledId, JsonArray users) {
		final String initMergeUserQuery = "SELECT ";
		final String initSubjectCopyQuery = "INSERT INTO " + schema + "subject_copy (subject_scheduled_id, owner, owner_username, is_training_copy) VALUES ";

		//init query
		StringBuilder mergeUserQuery = new StringBuilder(initMergeUserQuery);
		StringBuilder bulkInsertSubjectCopy = new StringBuilder(initSubjectCopyQuery);
		//init values
		JsonArray mergeUserValues = new fr.wseduc.webutils.collections.JsonArray();
		JsonArray subjectCopyValues = new fr.wseduc.webutils.collections.JsonArray();
		//Batch of bulk insert to avoid PSQLException: ERROR: target lists can have at most 1664 entries
		int batch = 0;

		for (int i=0;i<users.size();i++) {
			if (batch == 300) {
				batch=0;
				mergeUserQuery.deleteCharAt(mergeUserQuery.length() - 1);
				bulkInsertSubjectCopy.deleteCharAt(bulkInsertSubjectCopy.length() - 1);
				//Adding statements for this batch
				s.prepared(mergeUserQuery.toString(), mergeUserValues);
				s.prepared(bulkInsertSubjectCopy.toString(), subjectCopyValues);

				//init for a new batch
				mergeUserQuery = new StringBuilder(initMergeUserQuery);
				bulkInsertSubjectCopy = new StringBuilder(initSubjectCopyQuery);
				mergeUserValues = new fr.wseduc.webutils.collections.JsonArray();
				subjectCopyValues = new fr.wseduc.webutils.collections.JsonArray();
			}

			final JsonObject joUser =  users.getJsonObject(i);
			mergeUserQuery.append(schema).append("merge_users(?,?),");
			mergeUserValues.add(joUser.getString("_id")).add(joUser.getString("name"));

			bulkInsertSubjectCopy.append("(?,?,?,?),");
			subjectCopyValues.add(subjectScheduledId).add(joUser.getString("_id")).add(joUser.getString("name")).add(is_training);
			batch++;
		}

		// Adding statement for the latest batch
		if (batch > 0) {
			mergeUserQuery.deleteCharAt(mergeUserQuery.length() - 1);
			bulkInsertSubjectCopy.deleteCharAt(bulkInsertSubjectCopy.length() - 1);

			s.prepared(mergeUserQuery.toString(), mergeUserValues);
			s.prepared(bulkInsertSubjectCopy.toString(), subjectCopyValues);
		}
	}

	private void createGrainCopies(final SqlStatementsBuilder s, final boolean is_training,
								   final Long subjectScheduledId, final Long subjectCopyId) {
		String query = "INSERT INTO " + schema + "grain_copy (subject_copy_id, grain_type_id, grain_scheduled_id, order_by, grain_copy_data) " +
				"SELECT sc.id, gs.grain_type_id, gs.id, gs.order_by, Coalesce(gs.grain_custom_data, gs.grain_data) " +
				"FROM " + schema +"grain_scheduled AS gs INNER JOIN " + schema + "subject_scheduled AS ss ON (ss.id=gs.subject_scheduled_id) " +
				"    INNER JOIN " + schema + "subject_copy AS sc ON (ss.id=sc.subject_scheduled_id) " +
				"WHERE ss.id=? AND sc.is_training_copy = ?";
		JsonArray params = new fr.wseduc.webutils.collections.JsonArray().add(subjectScheduledId).add(is_training);

		if (subjectCopyId != null) {
			query += " AND sc.id = ?";
			params.add(subjectCopyId);
		}

		s.prepared(query, params);
	}

	private Future<Void> assignGrainCopiesRandomOrder(final Long subjectScheduledId) {
		Future<Void> result = Future.future();
		final String query = "SELECT id FROM " + schema + "subject_copy WHERE subject_scheduled_id = ?";
		sql.prepared(query, new JsonArray().add(subjectScheduledId), SqlResult.validResultHandler(event -> {
			if (event.isRight()) {
				final JsonArray subjectCopiesIds = event.right().getValue();
				final List<Future> subjectList = new ArrayList<>();
				subjectCopiesIds.forEach(subjectCopyId -> {
					Future<Void> promise = Future.future();
					subjectList.add(promise);
					final String query2 = "SELECT id FROM " + schema + "grain_copy WHERE subject_copy_id = ? ORDER BY RANDOM ()";
					sql.prepared(query2, new JsonArray().add(((JsonObject)subjectCopyId).getLong("id")), SqlResult.validResultHandler(event2 -> {
						if (event2.isRight()) {
							final JsonArray grainCopiesIds = event2.right().getValue();
							Collections.shuffle(grainCopiesIds.getList());
							final SqlStatementsBuilder s = new SqlStatementsBuilder();
							for (int i = 1; i <= grainCopiesIds.size(); i++) {
								Long grainCopyId = grainCopiesIds.getJsonObject(i-1).getLong("id");
								final String query3 = "UPDATE " + schema + "grain_copy SET display_order = ? WHERE id = ?";
								s.prepared(query3, new JsonArray().add(i).add(grainCopyId));
							}
							sql.transaction(s.build(), SqlResult.validResultHandler(handler -> {
								if (handler.isRight()) {
									promise.complete();
								} else {
									promise.fail(handler.left().getValue());
								}
							}));
						} else {
							promise.fail(event2.left().getValue());
						}
					}));
				});
				CompositeFuture.join(subjectList).setHandler(compositeFutureAsyncResult -> {
					if (compositeFutureAsyncResult.succeeded()) {
						result.complete();
					} else {
						result.fail(compositeFutureAsyncResult.cause());
					}
				});
			} else {
				result.fail(event.left().getValue());
			}
		}));
		return result;
	}

	@Override
	public void getMember(final String id, final Handler<Either<String, JsonArray>> handler) {

		final String query = "SELECT sc.owner " +
				" FROM " + resourceTable + " AS ss INNER JOIN " + schema + "subject_copy as sc ON ss.id=sc.subject_scheduled_id" +
				" WHERE ss.id = ?";

		sql.prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(Sql.parseId(id)), SqlResult.validResultHandler(handler));
	}

	public void getArchive(final UserInfos user, final Handler<Either<String, JsonArray>> handler){
		final String query = "SELECT ss.*," +
				" COUNT(sc.id) AS total_copy," +
				" COUNT (CASE WHEN sc.submitted_date IS NOT NULL  THEN 1 END) AS corrected_copy" +
				" FROM " + resourceTable +" AS ss" +
				" INNER JOIN "+ schema +"subject_copy AS sc ON sc.subject_scheduled_id = ss.id" +
				" WHERE ss.owner = ? AND ss.is_archived = true" +
				" GROUP BY ss.id";

		sql.prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(user.getUserId()), SqlResult.validResultHandler(handler));
	}

	public void getListForExport(final UserInfos user, final List<String> ids, final Handler<Either<String, JsonArray>> handler){
		//replace for escape single quote (mustache issue)
		final String query = "SELECT REPLACE(ss.title, '''', '‘') as title, ss.type, REPLACE(sc.owner_username, '''', '‘') as student, REPLACE(sc.comment, '''', '‘') as comment, sc.final_score as score" +
				" FROM exercizer.subject_scheduled AS ss" +
				" INNER JOIN exercizer.subject_copy AS sc ON sc.subject_scheduled_id = ss.id" +
				" WHERE ss.id IN "+Sql.listPrepared(ids.toArray())+" AND ss.owner = ?";

		JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		for (String id: ids) {
			values.add(Sql.parseId(id));
		}
		values.add(user.getUserId());
		sql.prepared(query, values, SqlResult.validResultHandler(handler));
	}

	@Override
	public void modify(final String id, JsonObject fields, final Handler<Either<String, JsonObject>> handler) {
		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		String query = "UPDATE " + resourceTable + " SET modified = NOW()";
		if(fields.containsKey("beginDate")){
			query += ", begin_date = ?";
			values.add(fields.getString("beginDate"));
		}
		if(fields.containsKey("dueDate")){
			query += ", due_date = ?";
			values.add(fields.getString("dueDate"));
		}
		if(fields.containsKey("correctedDate")){
			query += ", corrected_date = ?";
			values.add(fields.getString("correctedDate"));
		}
		if(fields.containsKey("isTrainingPermitted")){
			query += ", is_training_permitted = ?";
			values.add(fields.getBoolean("isTrainingPermitted"));
		}

		query += " WHERE id = ? ";
		values.add(id);

		sql.prepared(query, values, SqlResult.validUniqueResultHandler(handler));
	}

	@Override
	public void createTrainingCopy(final String subjectScheduledId, UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		final Long longSubjectScheduledId;
		try {
			 longSubjectScheduledId = Long.parseLong(subjectScheduledId);
		} catch (NumberFormatException nfe) {
			log.error("Failure to create training copy : " + nfe.getMessage());
			handler.handle(new Either.Left<>(nfe.getMessage()));
			return;
		}
		final SqlStatementsBuilder s = new SqlStatementsBuilder();
		JsonArray users = new JsonArray().add(new JsonObject().put("_id", user.getUserId()).put("name", user.getUsername()));
		createSubjectsCopies(s, true, longSubjectScheduledId, users);
		createGrainCopies(s, true, longSubjectScheduledId, null);
		sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
	}

	@Override
	public void recreateGrainCopies(final String subjectScheduledId, final String subjectCopyId, final Handler<Either<String, JsonObject>> handler) {
		final Long longSubjectScheduledId;
		final Long longSubjectCopyId;
		try {
			longSubjectScheduledId = Long.parseLong(subjectScheduledId);
			longSubjectCopyId = Long.parseLong(subjectCopyId);
		} catch (NumberFormatException nfe) {
			log.error("Failure to recreate grain copies : " + nfe.getMessage());
			handler.handle(new Either.Left<>(nfe.getMessage()));
			return;
		}
		final String query = "DELETE FROM " + schema + "grain_copy WHERE subject_copy_id = ?";
		sql.prepared(query, new JsonArray().add(longSubjectCopyId), SqlResult.validRowsResultHandler(message -> {
			if (message.isRight()) {
				final SqlStatementsBuilder s = new SqlStatementsBuilder();
				createGrainCopies(s, true, longSubjectScheduledId, longSubjectCopyId);
				sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
			} else {
				handler.handle(new Either.Left<>(message.left().getValue()));
			}
		}));
	}

}
