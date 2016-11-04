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

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import fr.wseduc.webutils.Either;
import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.ISubjectService;

import java.util.List;

public class SubjectServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectService {

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
	public void remove(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		JsonObject subject = ResourceParser.beforeAny(resource);
		subject.putValue("folder_id", null);
		subject.putBoolean("is_deleted", Boolean.TRUE);
		update(subject, user, handler);
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
	
	
}
