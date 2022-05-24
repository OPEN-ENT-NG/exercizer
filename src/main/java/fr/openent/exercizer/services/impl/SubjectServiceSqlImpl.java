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
import fr.openent.exercizer.services.ISubjectService;
import fr.wseduc.webutils.Either;
import io.vertx.core.json.Json;

import org.apache.commons.lang3.NotImplementedException;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

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
		subject.put("owner", user.getUserId()); 
		subject.put("owner_username", user.getUsername());
		super.persist(subject, user, handler);
	}

	public void persistSubjectGrains(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		final String queryNewSubjectId = "SELECT nextval('" + schema + "subject_id_seq') as id";

		sql.prepared(queryNewSubjectId, new fr.wseduc.webutils.collections.JsonArray(),
				SqlResult.validUniqueResultHandler(
						new Handler<Either<String, JsonObject>>() {
							@Override
							public void handle(Either<String, JsonObject> event) {
								if (event.isRight()) {
									final Long newSubjectId = event.right().getValue().getLong("id");
									final SqlStatementsBuilder builder = new SqlStatementsBuilder();
									final String userQuery = "SELECT " + schema + "merge_users(?,?)";
									builder.prepared(userQuery, new fr.wseduc.webutils.collections.JsonArray().add(user.getUserId()).add(user.getUsername()));

									final JsonObject subject = ResourceParser.beforeAny(resource.getJsonObject("subject"));
									subject.put("owner", user.getUserId());
									subject.put("owner_username", user.getUsername());
									subject.put("id", newSubjectId);
									builder.insert(resourceTable, subject, "*");

									final JsonArray grains = resource.getJsonArray("grains");
									for (int i=0;i<grains.size();i++) {
										final JsonObject grain = grains.getJsonObject(i);
										final String query = "INSERT INTO " + schema + "grain (subject_id, grain_type_id, order_by, grain_data) VALUES (?,?,?,?)";
										builder.prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(newSubjectId).add(grain.getLong("grain_type_id")).add(grain.getInteger("order_by")).add(grain.getValue("grain_data")));
									}

									String updateSubjectQuery = "UPDATE " + resourceTable + " SET max_score=(SELECT sum(cast(g.grain_data::json->>'max_score' as double precision)) FROM " +
											schema + "grain as g WHERE g.subject_id=?) WHERE id=?";
									builder.prepared(updateSubjectQuery, new fr.wseduc.webutils.collections.JsonArray().add(newSubjectId).add(newSubjectId));

									sql.transaction(builder.build(), SqlResult.validUniqueResultHandler(1, handler));
								} else {
									log.error("fail to create subject and grains  : " + event.left().getValue());
									handler.handle(event.left());
								}
							}
						}));
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
		final String subjectsQuery = "UPDATE " + resourceTable + " SET folder_id=null, is_deleted=true, modified=NOW() WHERE id IN " +
				Sql.listPrepared(subjectIds.getList());

		final JsonArray subjectsValues = new fr.wseduc.webutils.collections.JsonArray();

		for (int i=0;i<subjectIds.size();i++) {
			subjectsValues.add(subjectIds.getValue(i));
		}

		builder.prepared(subjectsQuery, subjectsValues);
		removeGrains(builder, subjectIds);
	}

	private void removeGrains(SqlStatementsBuilder builder, JsonArray subjectIds) {
		final String grainsQuery = "DELETE FROM " + schema + "grain WHERE subject_id IN " + Sql.listPrepared(subjectIds.getList());

		builder.prepared(grainsQuery, new fr.wseduc.webutils.collections.JsonArray(subjectIds.getList()));
	}

	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void list(final List<String> groupsAndUserIds, final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
		JsonArray filters = new fr.wseduc.webutils.collections.JsonArray();
		filters.add("is_library_subject = false");
		filters.add("is_deleted = false");
		super.list(filters, groupsAndUserIds, user, handler);
	}
	
	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void listAll(final List<String> groupsAndUserIds, final UserInfos user, final Handler<Either<String, JsonArray>> handler) {
		JsonArray filters = new fr.wseduc.webutils.collections.JsonArray();
		filters.add("is_library_subject = false");
		super.list(filters, groupsAndUserIds, user, handler);
	}
	
	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void listLibrarySubject(final JsonObject searchData, final Handler<Either<String, JsonArray>> handler) {
		JsonArray joins = new fr.wseduc.webutils.collections.JsonArray();

		if (searchData.containsKey("subject_lesson_type_id") || searchData.containsKey("subject_lesson_level_id")) {

			joins.add("JOIN exercizer.subject_libray_main_information slmi ON r.id = slmi.subject_id");

			if (searchData.containsKey("subject_lesson_type_id")) {
				joins.add("AND slmi.subject_lesson_type_id = " + searchData.getString("subject_lesson_type_id"));
			}
			
			if (searchData.containsKey("subject_lesson_level_id")) {
				joins.add("AND slmi.subject_lesson_level_id = " + searchData.getString("subject_lesson_level_id"));
			}
		}

		if (searchData.containsKey("subject_tags")) {
			JsonArray subjectTags = searchData.getJsonArray("subject_tags");
			
			joins.add("JOIN exercizer.subject_libray_tag slt ON r.id = slt.subject_id");
			
			for (Object subjectTag : subjectTags) {
				joins.add("AND slt.subject_tag_id = " + subjectTag);
			}
		}

		JsonArray filters = new fr.wseduc.webutils.collections.JsonArray();
		filters.add("WHERE");
		filters.add("r.is_library_subject = true");
		filters.add("AND r.is_deleted = false");
		
		if (searchData.containsKey("subject_title")) {
			filters.add("AND r.title ~* '.*" + searchData.getString("subject_title") + ".*'");
		}

		JsonArray orderBy = new fr.wseduc.webutils.collections.JsonArray();
		orderBy.add("ORDER BY r.created DESC");
		
		String limit = null;
		String offset = null;
		
		if (searchData.containsKey("limit") && searchData.containsKey("offset")) {
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
		JsonArray joins = new fr.wseduc.webutils.collections.JsonArray();

		if (searchData.containsKey("subject_lesson_type_id") || searchData.containsKey("subject_lesson_level_id")) {

			joins.add("JOIN exercizer.subject_libray_main_information slmi ON r.id = slmi.subject_id");

			if (searchData.containsKey("subject_lesson_type_id")) {
				joins.add("AND slmi.subject_lesson_type_id = " + searchData.getString("subject_lesson_type_id"));
			}
			
			if (searchData.containsKey("subject_lesson_level_id")) {
				joins.add("AND slmi.subject_lesson_level_id = " + searchData.getString("subject_lesson_level_id"));
			}
		}

		if (searchData.containsKey("subject_tags")) {
			JsonArray subjectTags = searchData.getJsonArray("subject_tags");
			
			joins.add("JOIN exercizer.subject_libray_tag slt ON r.id = slt.subject_id");
			
			for (Object subjectTag : subjectTags) {
				joins.add("AND slt.subject_tag_id = " + subjectTag);
			}
		}

		JsonArray filters = new fr.wseduc.webutils.collections.JsonArray();
		filters.add("WHERE");
		filters.add("r.is_library_subject = true");
		filters.add("AND r.is_deleted = false");
		
		if (searchData.containsKey("subject_title")) {
			filters.add("AND r.title ~* '.*" + searchData.getString("subject_title") + ".*'");
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
		final String query = "UPDATE " + resourceTable + " SET folder_id=?, modified=NOW() WHERE id IN " + Sql.listPrepared(subjectIds.getList());

		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray().add(targetFolderId);

		try {
			for (int i = 0; i < subjectIds.size(); i++) {
				values.add(Long.parseLong(subjectIds.getValue(i).toString()));
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
					ids.add(Long.parseLong(subjectIds.getValue(i).toString()));
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
							final Long newSubjectId = ja.getJsonArray(i).getJsonObject(0).getLong("id");
							final Long fromSubjectId = ids.get(i);
							duplicateSubject(s, newSubjectId, fromSubjectId, folderId, user, titleSuffix);
							duplicateSubjectDocuments(s, newSubjectId, fromSubjectId, false );
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

	public void publishLibrary(final Long fromSubjectId, final String authorsContributors, /*TODO WB-582 final String correctedFileId, final JsonObject correctedMetadata, */
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

	private void publishSubjectGrainsLibrary( final Long fromSubjectId, final String authorsContributors, /*TODO WB-582 final String correctedFileId, final JsonObject correctedMetadata,*/
											 final Long typeId, final Long levelId,  final JsonArray tag, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		String queryNewSubjectId = "SELECT nextval('" + schema + "subject_id_seq') as id";
		sql.prepared(queryNewSubjectId, new fr.wseduc.webutils.collections.JsonArray(),
				SqlResult.validUniqueResultHandler(
						new Handler<Either<String, JsonObject>>() {
							@Override
							public void handle(Either<String, JsonObject> event) {
								if (event.isRight()) {
									final Long newSubjectId = event.right().getValue().getLong("id");
									final SqlStatementsBuilder s = new SqlStatementsBuilder();
									duplicateSubjectForLibrary(s, newSubjectId, fromSubjectId, authorsContributors, user);
									duplicateSubjectDocuments(s, newSubjectId, fromSubjectId, true );
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
		s.insert(schema+"subject_library_main_information", new fr.wseduc.webutils.collections.JsonObject().put("subject_id", newSubjectId).put("subject_lesson_type_id", typeId).put("subject_lesson_level_id", levelId));
	}

	private void insertSubjectTag(Long newSubjectId, SqlStatementsBuilder s, JsonArray tag) {
		if (tag != null && tag.size() > 0) {
			for (int i=0;i<tag.size();i++) {
				s.insert(schema+ "subject_library_tag", new fr.wseduc.webutils.collections.JsonObject().put("subject_id", newSubjectId).put("subject_tag_id", tag.getJsonObject(i).getLong("id")));
			}
		}
	}

	private void insertTag(JsonArray tag, final Handler<Either<String, JsonArray>> handler) {
		final List<String> tagLabel = new ArrayList<>();
		final SqlStatementsBuilder tagStatements = new SqlStatementsBuilder();

		final JsonArray jaResult = new fr.wseduc.webutils.collections.JsonArray();

		boolean isNewTag = false;
		//prepare new Tag
		for (int i=0; i<tag.size(); i++) {
			final JsonObject t = tag.getJsonObject(i);
			if (t.getLong("id") == null) {
				tagStatements.insert(schema+"subject_tag", new fr.wseduc.webutils.collections.JsonObject().put("label", t.getString("label")), "*");
				isNewTag = true;
			} else {
				jaResult.add(t);
			}
		}

		if (isNewTag) {
			sql.transaction(tagStatements.build(), SqlResult.validResultsHandler(new Handler<Either<String, JsonArray>>() {
				@Override
				public void handle(Either<String, JsonArray> event) {
					if (event.isRight()) {
						final JsonArray ja = event.right().getValue();
						final List<JsonObject> listResult = jaResult.getList();
						for (int i=0;i<ja.size();i++) {
							listResult.addAll((ja.getJsonArray(i)).getList());
						}

						handler.handle(new Either.Right<String, JsonArray>(new fr.wseduc.webutils.collections.JsonArray(listResult)));
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

	private void duplicateSubjectForLibrary(final SqlStatementsBuilder s, final Long newSubjectId, final Long fromSubjectId, final String authorsContributors,
	                                        /*final String correctedFileId, final JsonObject correctedMetadata,*/ UserInfos user) {
		duplicationSubject(s, newSubjectId, fromSubjectId, true, authorsContributors, null, user, "", false);
	}

	private void duplicateSubject(final SqlStatementsBuilder s, final Long newSubjectId, final Long fromSubjectId, final Long folderId, UserInfos user, String titleSuffix) {
		duplicationSubject(s, newSubjectId, fromSubjectId, false, null, folderId, user, titleSuffix, true);
	}

	private void duplicationSubject(final SqlStatementsBuilder s, final Long newSubjectId, final Long fromSubjectId, final Boolean isLibrary,
									final String authorsContributors, final Long folderId, UserInfos user, final String titleSuffix, final Boolean isMergeUser) {
		if (isMergeUser) {
			String userQuery = "SELECT " + schema + "merge_users(?,?)";
			s.prepared(userQuery, new fr.wseduc.webutils.collections.JsonArray().add(user.getUserId()).add(user.getUsername()));
		}
		//caution original_subject_id unmanagment
		final String subjectCopy = "INSERT INTO exercizer.subject (id, folder_id, owner, owner_username, title, description, picture, max_score, " +
				"is_library_subject, is_deleted, authors_contributors, type) " +
				"SELECT ?, ?, ?, ?, s.title || ?, s.description, s.picture, s.max_score, ?, s.is_deleted, ?, s.type FROM exercizer.subject as s " +
				"WHERE s.id = ?";

		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray().add(newSubjectId).add(folderId).add(user.getUserId())
				.add(user.getUsername()).add(titleSuffix).add(isLibrary).add(authorsContributors).add(fromSubjectId);

		s.prepared(subjectCopy, values);
	}

	private void duplicateSubjectDocuments(
			final SqlStatementsBuilder s, final Long newSubjectId, final Long fromSubjectId, final Boolean isLibrary 
			) {
		final String subjectDocumentCopy = "INSERT INTO exercizer.subject_document (subject_id, doc_id, doc_type, metadata) " +
				"SELECT ?, s.doc_id, s.doc_type, s.metadata::jsonb FROM exercizer.subject as s WHERE s.subject_id = ?";

		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray().add(newSubjectId).add(fromSubjectId);

		s.prepared(subjectDocumentCopy, values);
	}

	private void duplicationGrain(final SqlStatementsBuilder s, final Long newSubjectId, final Long fromSubjectId) {
		final String grainsCopy = "INSERT INTO exercizer.grain (subject_id, grain_type_id, order_by, grain_data) " +
				"SELECT ?, g.grain_type_id, g.order_by, g.grain_data FROM exercizer.subject as s INNER JOIN exercizer.grain as g on (s.id = g.subject_id) " +
				"WHERE s.id=?";

		s.prepared(grainsCopy, new fr.wseduc.webutils.collections.JsonArray().add(newSubjectId).add(fromSubjectId));
	}

	public void unpublishLibrary(final Long subjectId, final Handler<Either<String, JsonObject>> handler) {
		final SqlStatementsBuilder builder = new SqlStatementsBuilder();
		final JsonArray values = new fr.wseduc.webutils.collections.JsonArray().add(subjectId);

		final String deleteSubjectTag = "DELETE FROM " + schema + "subject_library_tag WHERE subject_id=?";
		builder.prepared(deleteSubjectTag, values);

		final String deleteSubjectInfo = "DELETE FROM " + schema + "subject_library_main_information WHERE subject_id=?";
		builder.prepared(deleteSubjectInfo, values);

		final String deleteSubjectDocuments = "DELETE FROM " + schema + "subject_document WHERE subject_id=?";
		builder.prepared(deleteSubjectDocuments, values);

		removeGrains(builder, values);

		final String deleteSubject = "DELETE FROM " + resourceTable + " WHERE id=?";
		builder.prepared(deleteSubject, values);

		sql.transaction(builder.build(), SqlResult.validUniqueResultHandler(0, handler));
	}

	public void getCorrectedDownloadInformation(final String id, final Handler<Either<String, JsonObject>> handler) {
		throw new NotImplementedException("getCorrectedDownloadInformation is deprecated");
	}

	@Override
	public void setLastLibraryVisit(final String userId, final String displayName, final Handler<Either<String, JsonObject>> handler) {
		final String query = "INSERT INTO exercizer.users (id, username, is_deleted, last_visit) " +
				"VALUES (?, ?, 'f', NOW()) " +
				"ON CONFLICT (id) DO UPDATE SET last_visit = EXCLUDED.last_visit";
		JsonArray params = new fr.wseduc.webutils.collections.JsonArray().add(userId).add(displayName);
		sql.prepared(query.toString(), params, SqlResult.validUniqueResultHandler(handler));
	}

	@Override
	public void countNewSubjectInLibrary(final String userId, final Handler<Either<String, JsonObject>> handler) {
		final String query = "SELECT COUNT(*) FROM exercizer.subject " +
				"WHERE is_library_subject = 't' " +
				"AND owner <> ? " +
				"AND created > COALESCE((SELECT last_visit FROM exercizer.users WHERE id = ?), TIMESTAMP 'epoch')";
		JsonArray params = new fr.wseduc.webutils.collections.JsonArray().add(userId).add(userId);
		sql.prepared(query.toString(), params, SqlResult.validUniqueResultHandler(handler));
	}

    @Override
    public void listCorrectedDocuments(final Long subjectId, final Handler<Either<String, JsonArray>> handler) {
        StringBuilder select = new StringBuilder()
		.append("SELECT doc_id, doc_type, metadata ")
		.append("FROM ").append(schema).append("subject_document ")
		.append("WHERE subject_id = ?");
		
        JsonArray values = new fr.wseduc.webutils.collections.JsonArray()
			.add( subjectId );
		sql.prepared(select.toString(), values, SqlResult.validResultHandler(handler, "metadata"));		
    }

	@Override
	public void getCorrectedDocument(final Long subjectId, final String docId, final Handler<Either<String, JsonObject>> handler ) {
        StringBuilder select = new StringBuilder()
		.append("SELECT doc_id, doc_type, metadata ")
		.append("FROM ").append(schema).append("subject_document ")
		.append("WHERE subject_id = ? AND doc_id = ?");
		
        JsonArray values = new fr.wseduc.webutils.collections.JsonArray()
			.add( subjectId )
			.add( docId );
		sql.prepared(select.toString(), values, SqlResult.validUniqueResultHandler(handler, "metadata"));		
	}

	@Override
    public void addCorrectedDocument(final Long subjectId, final String docId, final JsonObject metadata, final Handler<Either<String, JsonObject>> handler) {
        StringBuilder insert = new StringBuilder()
		.append("INSERT INTO ").append(schema).append("subject_document (subject_id, doc_id, metadata) ")
		.append("VALUES (?,?,?) RETURNING subject_id, doc_id, doc_type, metadata");

        JsonArray values = new fr.wseduc.webutils.collections.JsonArray()
			.add( subjectId )
			.add( docId )
			.add( metadata );
		sql.prepared(insert.toString(), values, SqlResult.validUniqueResultHandler(handler, "metadata"));
	}

	@Override
    public void deleteCorrectedDocument(final Long subjectId, final String docId, final Handler<Either<String, JsonObject>> handler) {
        StringBuilder delete = new StringBuilder()
		.append("DELETE FROM ").append(schema).append("subject_document ")
		.append("WHERE subject_id = ? AND doc_id = ? RETURNING subject_id, doc_id, doc_type, metadata");

        JsonArray values = new fr.wseduc.webutils.collections.JsonArray()
			.add( subjectId )
			.add( docId );
		sql.prepared(delete.toString(), values, SqlResult.validUniqueResultHandler(handler));
	}

}
