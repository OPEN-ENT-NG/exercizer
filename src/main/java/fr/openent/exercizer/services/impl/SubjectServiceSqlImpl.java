package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.ISubjectService;
import fr.wseduc.webutils.Either;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class SubjectServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectService {
	private static final Logger log = LoggerFactory.getLogger(SubjectServiceSqlImpl.class);

	public SubjectServiceSqlImpl() {
		super("exercizer", "subject", "subject_shares");
	}

	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		JsonObject subject = ResourceParser.beforeAny(resource);
		subject.putString("owner", user.getUserId()); 
		subject.putString("owner_username", user.getUsername());
		super.persist(subject, user, handler);
	}

	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		JsonObject subject = ResourceParser.beforeAny(resource);
		super.update(subject, user, handler);
	}

	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void remove(final JsonArray subjectIds, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		final SqlStatementsBuilder builder = new SqlStatementsBuilder();

		removeSubjectsAndGrains(builder, user, subjectIds);

		sql.transaction(builder.build(), SqlResult.validUniqueResultHandler(0, handler));
	}

	public void removeSubjectsAndGrains(SqlStatementsBuilder builder, final UserInfos user, JsonArray subjectIds) {
		final String subjectsQuery = "UPDATE " + resourceTable + " SET folder_id=null, is_deleted=true, owner=?, owner_username=?, modified=NOW() WHERE id IN " +
				Sql.listPrepared(subjectIds.toArray());

		final JsonArray subjectsValues = new JsonArray();

		subjectsValues.addString(user.getUserId());
		subjectsValues.addString(user.getUsername());

		for (int i=0;i<subjectIds.size();i++) {
			subjectsValues.add(subjectIds.get(i));
		}

		builder.prepared(subjectsQuery, subjectsValues);
		removeGrains(builder, subjectIds);
	}

	private void removeGrains(SqlStatementsBuilder builder, JsonArray subjectIds) {
		final String grainsQuery = "DELETE FROM " + schema + "grain WHERE subject_id IN " + Sql.listPrepared(subjectIds.toArray());

		builder.prepared(grainsQuery, new JsonArray(subjectIds.toArray()));
	}

	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void list(final List<String> groupsAndUserIds, final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
		JsonArray filters = new JsonArray();
		filters.addString("is_library_subject = false");
		filters.addString("is_deleted = false");
		super.list(filters, groupsAndUserIds, user, handler);
	}
	
	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void listAll(final List<String> groupsAndUserIds, final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
		JsonArray filters = new JsonArray();
		filters.addString("is_library_subject = false");
		super.list(filters, groupsAndUserIds, user, handler);
	}
	
	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void listLibrarySubject(final JsonObject searchData, final Handler<Either<String, JsonArray>> handler) {
		JsonArray joins = new JsonArray();

		if (searchData.containsField("subject_lesson_type_id") || searchData.containsField("subject_lesson_level_id")) {

			joins.addString("JOIN exercizer.subject_libray_main_information slmi ON r.id = slmi.subject_id");

			if (searchData.containsField("subject_lesson_type_id")) {
				joins.addString("AND slmi.subject_lesson_type_id = " + searchData.getString("subject_lesson_type_id"));
			}
			
			if (searchData.containsField("subject_lesson_level_id")) {
				joins.addString("AND slmi.subject_lesson_level_id = " + searchData.getString("subject_lesson_level_id"));
			}
		}

		if (searchData.containsField("subject_tags")) {
			JsonArray subjectTags = searchData.getArray("subject_tags");
			
			joins.addString("JOIN exercizer.subject_libray_tag slt ON r.id = slt.subject_id");
			
			for (Object subjectTag : subjectTags) {
				joins.addString("AND slt.subject_tag_id = " + subjectTag);
			}
		}

		JsonArray filters = new JsonArray();
		filters.addString("WHERE");
		filters.addString("r.is_library_subject = true");
		filters.addString("AND r.is_deleted = false");
		
		if (searchData.containsField("subject_title")) {
			filters.addString("AND r.title ~* '.*" + searchData.getString("subject_title") + ".*'");
		}

		JsonArray orderBy = new JsonArray();
		orderBy.addString("ORDER BY r.created DESC");
		
		String limit = null;
		String offset = null;
		
		if (searchData.containsField("limit") && searchData.containsField("offset")) {
			limit = searchData.getString("limit");
			offset = searchData.getString("offset");
		}
		
		super.list("r", joins, filters, orderBy, limit, offset, handler);
	}
	
	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void countLibrarySubject(final JsonObject searchData, final Handler<Either<String, JsonObject>> handler) {
		JsonArray joins = new JsonArray();

		if (searchData.containsField("subject_lesson_type_id") || searchData.containsField("subject_lesson_level_id")) {

			joins.addString("JOIN exercizer.subject_libray_main_information slmi ON r.id = slmi.subject_id");

			if (searchData.containsField("subject_lesson_type_id")) {
				joins.addString("AND slmi.subject_lesson_type_id = " + searchData.getString("subject_lesson_type_id"));
			}
			
			if (searchData.containsField("subject_lesson_level_id")) {
				joins.addString("AND slmi.subject_lesson_level_id = " + searchData.getString("subject_lesson_level_id"));
			}
		}

		if (searchData.containsField("subject_tags")) {
			JsonArray subjectTags = searchData.getArray("subject_tags");
			
			joins.addString("JOIN exercizer.subject_libray_tag slt ON r.id = slt.subject_id");
			
			for (Object subjectTag : subjectTags) {
				joins.addString("AND slt.subject_tag_id = " + subjectTag);
			}
		}

		JsonArray filters = new JsonArray();
		filters.addString("WHERE");
		filters.addString("r.is_library_subject = true");
		filters.addString("AND r.is_deleted = false");
		
		if (searchData.containsField("subject_title")) {
			filters.addString("AND r.title ~* '.*" + searchData.getString("subject_title") + ".*'");
		}
		
		super.count("r", joins, filters, handler);
	}
	
	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	
    @Override
    public void getById(final String id, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
        super.getById(id, user, handler);
    }

	public void move(final JsonArray subjectIds, final Long targetFolderId, final Handler<Either<String, JsonObject>> handler) {
		final String query = "UPDATE " + resourceTable + " SET folder_id=?, modified=NOW() WHERE id IN " + Sql.listPrepared(subjectIds.toArray());

		final JsonArray values = new JsonArray().addNumber(targetFolderId);

		try {
			for (int i = 0; i < subjectIds.size(); i++) {
				values.addNumber(Long.parseLong(subjectIds.get(i).toString()));
			}
		} catch (NumberFormatException e) {
			log.error("Can't cast id of subject", e);
			handler.handle(new Either.Left<String, JsonObject>(e.getMessage()));
			return;
		}

		sql.prepared(query, values, new Handler<Message<JsonObject>>() {
			@Override
			public void handle(Message<JsonObject> event) {
				handler.handle(SqlResult.validRowsResult(event));
			}
		});
	}

	public void duplicateSubjects(final JsonArray subjectIds, final Long folderId, final String titleSuffix, final UserInfos user,  final Handler<Either<String, JsonObject>> handler) {
		if (subjectIds != null && subjectIds.size() > 0) {
			final String queryNewSubjectId = "SELECT nextval('" + schema + "subject_id_seq') as id";
			final SqlStatementsBuilder sIds = new SqlStatementsBuilder();

			final List<Long> ids = new ArrayList<>();

			try {
				for (int i = 0; i < subjectIds.size(); i++) {
					sIds.raw(queryNewSubjectId);
					ids.add(Long.parseLong(subjectIds.get(i).toString()));
				}
			} catch (NumberFormatException e) {
				log.error("Can't cast id of subject", e);
				handler.handle(new Either.Left<String, JsonObject>(e.getMessage()));
				return;
			}

			sql.transaction(sIds.build(), SqlResult.validResultsHandler(new Handler<Either<String, JsonArray>>() {
				@Override
				public void handle(Either<String, JsonArray> event) {
					if (event.isRight()) {
						final JsonArray ja = event.right().getValue();
						final SqlStatementsBuilder s = new SqlStatementsBuilder();
						for (int i = 0; i < ja.size(); i++) {
							final Long newSubjectId = ja.<JsonArray>get(i).<JsonObject>get(0).getLong("id");
							final Long fromSubjectId = ids.get(i);
							duplicateSubject(s, newSubjectId, fromSubjectId, folderId, user, titleSuffix);
							duplicationGrain(s, newSubjectId, fromSubjectId);
						}
						sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
					} else {
						log.error("fail to duplicate subjects : " + event.left().getValue());
						handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
					}
				}
			}));
		} else {
			log.error("fail to duplicate subjects : no subject id");
			handler.handle(new Either.Left<String, JsonObject>("empty.subject.ids"));
		}
	}

	public void publishLibrary(final Long fromSubjectId, final String authorsContributors,
											 final Long typeId, final Long levelId, JsonArray tag, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		if (tag != null && tag.size() > 0) {
			insertTag(tag, new Handler<Either<String, JsonArray>>() {
				@Override
				public void handle(Either<String, JsonArray> event) {
					if (event.isRight()) {
						publishSubjectGrainsLibrary(fromSubjectId, authorsContributors, typeId, levelId, event.right().getValue(), user, handler);
					} else {
						handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
					}
				}
			});
		} else {
			publishSubjectGrainsLibrary(fromSubjectId, authorsContributors, typeId, levelId, tag, user, handler);
		}
	}

	private void publishSubjectGrainsLibrary( final Long fromSubjectId, final String authorsContributors,
											 final Long typeId, final Long levelId,  final JsonArray tag, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		String queryNewSubjectId = "SELECT nextval('" + schema + "subject_id_seq') as id";
		sql.prepared(queryNewSubjectId, new JsonArray(),
				SqlResult.validUniqueResultHandler(
						new Handler<Either<String, JsonObject>>() {
							@Override
							public void handle(Either<String, JsonObject> event) {
								if (event.isRight()) {
									final Long newSubjectId = event.right().getValue().getLong("id");
									final SqlStatementsBuilder s = new SqlStatementsBuilder();
									duplicateSubjectForLibrary(s, newSubjectId, fromSubjectId, authorsContributors, user);
									duplicationGrain(s, newSubjectId, fromSubjectId);
									insertSubjectMainInformation(newSubjectId, s, typeId, levelId);
									insertSubjectTag(newSubjectId, s, tag);

									sql.transaction(s.build(), SqlResult.validUniqueResultHandler(0, handler));
								} else {
									log.error("fail to subject publication in the library : " + event.left().getValue());
									handler.handle(event.left());
								}

							}
						}));
	}

	private void insertSubjectMainInformation(Long newSubjectId, SqlStatementsBuilder s, Long typeId, Long levelId) {
		s.insert(schema+"subject_library_main_information", new JsonObject().putNumber("subject_id", newSubjectId).putNumber("subject_lesson_type_id", typeId).putNumber("subject_lesson_level_id", levelId));
	}

	private void insertSubjectTag(Long newSubjectId, SqlStatementsBuilder s, JsonArray tag) {
		if (tag != null && tag.size() > 0) {
			for (int i=0;i<tag.size();i++) {
				s.insert(schema+ "subject_library_tag", new JsonObject().putNumber("subject_id", newSubjectId).putNumber("subject_tag_id", tag.<JsonObject>get(i).getLong("id")));
			}
		}
	}

	private void insertTag(JsonArray tag, final Handler<Either<String, JsonArray>> handler) {
		final List<String> tagLabel = new ArrayList<>();
		final SqlStatementsBuilder tagStatements = new SqlStatementsBuilder();

		final JsonArray jaResult = new JsonArray();

		boolean isNewTag = false;
		//prepare new Tag
		for (int i=0; i<tag.size(); i++) {
			final JsonObject t = tag.get(i);
			if (t.getLong("id") == null) {
				tagStatements.insert(schema+"subject_tag", new JsonObject().putString("label", t.getString("label")), "*");
				isNewTag = true;
			} else {
				jaResult.addObject(t);
			}
		}

		if (isNewTag) {
			sql.transaction(tagStatements.build(), SqlResult.validResultsHandler(new Handler<Either<String, JsonArray>>() {
				@Override
				public void handle(Either<String, JsonArray> event) {
					if (event.isRight()) {
						final JsonArray ja = event.right().getValue();
						final List<JsonObject> listResult = jaResult.toList();
						for (int i=0;i<ja.size();i++) {
							listResult.addAll((ja.<JsonArray>get(i)).toList());
						}

						handler.handle(new Either.Right<String, JsonArray>(new JsonArray(listResult)));
					} else {
						log.error("Can't insert subject tags : " + event.left().getValue());
						handler.handle(event.left());
					}
				}
			}));
		} else {
			handler.handle(new Either.Right<String, JsonArray>(jaResult));
		}
	}

	private void duplicateSubjectForLibrary(final SqlStatementsBuilder s, final Long newSubjectId, final Long fromSubjectId, final String authorsContributors, UserInfos user) {
		duplicationSubject(s, newSubjectId, fromSubjectId, true, authorsContributors, null, user, "", false);
	}

	private void duplicateSubject(final SqlStatementsBuilder s, final Long newSubjectId, final Long fromSubjectId, final Long folderId, UserInfos user, String titleSuffix) {
		duplicationSubject(s, newSubjectId, fromSubjectId, false, null, folderId, user, titleSuffix, true);
	}

	private void duplicationSubject(final SqlStatementsBuilder s, final Long newSubjectId, final Long fromSubjectId, final Boolean isLibrary,
									final String authorsContributors, final Long folderId, UserInfos user, final String titleSuffix, final Boolean isMergeUser) {
		if (isMergeUser) {
			String userQuery = "SELECT " + schema + "merge_users(?,?)";
			s.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));
		}
		//caution original_subject_id unmanagment
		final String subjectCopy = "INSERT INTO exercizer.subject (id, folder_id, owner, owner_username, title, description, picture, max_score, is_library_subject, is_deleted, authors_contributors) " +
				"SELECT ?, ?, ?, ?, s.title || ?, s.description, s.picture, s.max_score, ?, s.is_deleted, ? FROM exercizer.subject as s " +
				"WHERE s.id = ?";

		final JsonArray values = new JsonArray().add(newSubjectId).add(folderId).add(user.getUserId())
				.add(user.getUsername()).add(titleSuffix).add(isLibrary).add(authorsContributors).add(fromSubjectId);

		s.prepared(subjectCopy, values);
	}

	private void duplicationGrain(final SqlStatementsBuilder s, final Long newSubjectId, final Long fromSubjectId) {
		final String grainsCopy = "INSERT INTO exercizer.grain (subject_id, grain_type_id, order_by, grain_data) " +
				"SELECT ?, g.grain_type_id, g.order_by, g.grain_data FROM exercizer.subject as s INNER JOIN exercizer.grain as g on (s.id = g.subject_id) " +
				"WHERE s.id=?";

		s.prepared(grainsCopy, new JsonArray().add(newSubjectId).add(fromSubjectId));
	}

	public void unpublishLibrary(final Long subjectId, final Handler<Either<String, JsonObject>> handler) {
		final SqlStatementsBuilder builder = new SqlStatementsBuilder();
		final JsonArray values = new JsonArray().addNumber(subjectId);

		final String deleteSubjectTag = "DELETE FROM " + schema + "subject_library_tag WHERE subject_id=?";
		builder.prepared(deleteSubjectTag, values);

		final String deleteSubjectInfo = "DELETE FROM " + schema + "subject_library_main_information WHERE subject_id=?";
		builder.prepared(deleteSubjectInfo, values);

		removeGrains(builder, values);

		final String deleteSubject = "DELETE FROM " + resourceTable + " WHERE id=?";
		builder.prepared(deleteSubject, values);

		sql.transaction(builder.build(), SqlResult.validUniqueResultHandler(0, handler));
	}
}