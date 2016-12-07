package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.ISubjectScheduledService;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.Renders;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

public class SubjectScheduledServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectScheduledService {
	
	protected static final Logger log = LoggerFactory.getLogger(Renders.class);

    public SubjectScheduledServiceSqlImpl() {
        super("exercizer", "subject_scheduled");
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
    	JsonObject subjectScheduled = ResourceParser.beforeAny(resource);
    	subjectScheduled.putString("owner", user.getUserId());
    	subjectScheduled.putString("owner_username", user.getUsername());
        super.persist(subjectScheduled, user, handler);
    }

    /**
     * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
     */
    @Override
    public void list(final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
        super.list(user, handler);
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

		final Map<Number,JsonObject> mapIdGrainCustomCopyData = transformJaInMapCustomCopyData(scheduledSubject.getArray("grainsCustomCopyData"));

		final Long fromSubjectId = scheduledSubject.getLong("subjectId");
		final JsonArray usersJa = scheduledSubject.getArray("users");

		//to prevent modification of the model and data migration, temporarily, we recovered grains of subject to associate custom data copies.
		// in the next refactor step, grain entry can directly contain custom_data for copies of grain
		final String queryGain = "SELECT g.id, g.grain_type_id, g.order_by, g.grain_data FROM " + schema + "grain as g " +
				" WHERE g.subject_id = ? and g.grain_type_id > 2";
		final JsonArray values = new JsonArray().add(fromSubjectId);
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
								createSubjectsCopies(s, subjectScheduledId, usersJa);
								createGrainCopies(s, subjectScheduledId);
								sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
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

	private Map<Number, JsonObject> transformJaInMapCustomCopyData(JsonArray grainsCustomCopyData) {
		final Map<Number, JsonObject> mapIdGrainCustomCopyData = new HashMap<>();
		for (int i=0;i<grainsCustomCopyData.size();i++) {
			final JsonObject jo = grainsCustomCopyData.get(i);
			mapIdGrainCustomCopyData.put(jo.getLong("grain_id"), jo.getObject("grain_copy_data"));
		}

		return mapIdGrainCustomCopyData;
	}

	private void createScheduledSubject(final SqlStatementsBuilder s, final Long subjectId, final Long scheduledSubjectId, final JsonObject scheduledSubject, UserInfos user) {

		final String query = "INSERT INTO " + schema + "subject_scheduled (id, subject_id, title, description, picture, max_score, " +
				"owner, owner_username, begin_date, due_date, estimated_duration, is_one_shot_submit, scheduled_at) " +
				"SELECT ?, s.id, s.title, s.description, s.picture, s.max_score, ?, ?, ?::timestamp , ?::timestamp, ?, ?, ?::json FROM " + schema + "subject as s " +
				"WHERE s.id=? ";

		final JsonArray values = new JsonArray();
		values.add(scheduledSubjectId).add(user.getUserId()).add(user.getUsername()).add(scheduledSubject.getValue("beginDate"))
				.add(scheduledSubject.getValue("dueDate")).add(scheduledSubject.getString("estimatedDuration", ""))
				.add(scheduledSubject.getBoolean("isOneShotSubmit")).add(scheduledSubject.getObject("scheduledAt"))
				.addNumber(subjectId);

		s.prepared(query, values);
	}


	private void createScheduledGrain(final SqlStatementsBuilder s, final Long subjectScheduledId, final Long fromSubjectId, final JsonArray grainJa, final Map<Number,JsonObject> mapIdGrainCustomCopyData) {
		/*the potential target : final String query = "INSERT INTO " + schema + "grain_scheduled (subject_scheduled_id, grain_type_id, created, order_by, grain_data, grain_custom_data) " +
				"SELECT ?, g.grain_type_id, NOW(), g.order_by, g.grain_data, g.grain_custom_data FROM " + schema + "subject as s INNER JOIN " + schema + "grain as g on (s.id = g.subject_id) " +
				"WHERE s.id=? AND g.grain_type_id > 2";*/
		final StringBuilder bulkInsertScheduledGrain = new StringBuilder("INSERT INTO " + schema + "grain_scheduled (subject_scheduled_id, grain_type_id, order_by, grain_data, grain_custom_data) VALUES ");
		final JsonArray values = new JsonArray();

		for (int i=0;i<grainJa.size();i++) {
			final JsonObject grainJo = grainJa.get(i);

			values.addNumber(subjectScheduledId).addNumber(grainJo.getLong("grain_type_id")).addNumber(grainJo.getInteger("order_by"))
					.addString(grainJo.getString("grain_data")).add(mapIdGrainCustomCopyData.get(grainJo.getLong("id")));

			bulkInsertScheduledGrain.append("(?,?,?,?,?),");

		}

		bulkInsertScheduledGrain.deleteCharAt(bulkInsertScheduledGrain.length() - 1);

		s.prepared(bulkInsertScheduledGrain.toString(),values);
	}


	private void createSubjectsCopies(final SqlStatementsBuilder s, final Long subjectScheduledId, JsonArray users) {
		final String initMergeUserQuery = "SELECT ";
		final String initSubjectCopyQuery = "INSERT INTO " + schema + "subject_copy (subject_scheduled_id, owner, owner_username) VALUES ";

		//init query
		StringBuilder mergeUserQuery = new StringBuilder(initMergeUserQuery);
		StringBuilder bulkInsertSubjectCopy = new StringBuilder(initSubjectCopyQuery);
		//init values
		JsonArray mergeUserValues = new JsonArray();
		JsonArray subjectCopyValues = new JsonArray();
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
				mergeUserValues = new JsonArray();
				subjectCopyValues = new JsonArray();
			}

			final JsonObject joUser =  users.<JsonObject>get(i);
			mergeUserQuery.append(schema).append("merge_users(?,?),");
			mergeUserValues.addString(joUser.getString("_id")).addString(joUser.getString("name"));

			bulkInsertSubjectCopy.append("(?,?,?),");
			subjectCopyValues.add(subjectScheduledId).addString(joUser.getString("_id")).addString(joUser.getString("name"));
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

	private void createGrainCopies(final SqlStatementsBuilder s, final Long subjectScheduledId) {
		final String query = "INSERT INTO " + schema + "grain_copy (subject_copy_id, grain_type_id, grain_scheduled_id, order_by, grain_copy_data) " +
				"SELECT sc.id, gs.grain_type_id, gs.id, gs.order_by, Coalesce(gs.grain_custom_data, gs.grain_data) " +
				"FROM " + schema +"grain_scheduled AS gs INNER JOIN " + schema + "subject_scheduled AS ss ON (ss.id=gs.subject_scheduled_id) " +
				"    INNER JOIN " + schema + "subject_copy AS sc ON (ss.id=sc.subject_scheduled_id) " +
				"WHERE ss.id=?";

		s.prepared(query, new JsonArray().add(subjectScheduledId));
	}
}
