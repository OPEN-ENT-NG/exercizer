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

package fr.openent.exercizer.services;

import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import fr.wseduc.webutils.Either;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface ISubjectService {
    enum DocType {
        STORAGE("storage"),
        WORKSPACE("workspace");

        private String key;
        private DocType(final String key) {
            this.key = key;
        }
        public String getKey() {
            return key;
        }
    }

	/**
	 *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

	void persistSubjectGrains(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

	/**
	 *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	void update(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

	void remove(final JsonArray subjectIds, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

	void removeSubjectsAndGrains(SqlStatementsBuilder builder, final UserInfos user, JsonArray subjectIds);

	/**
	 *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	void list(final List<String> groupsAndUserIds , final UserInfos user, final Handler<Either<String, JsonArray>> handler);

	/**
	 *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	void listAll(final List<String> groupsAndUserIds , final UserInfos user, final Handler<Either<String, JsonArray>> handler);

	/**
	 *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	void listLibrarySubject(final JsonObject searchData, final Handler<Either<String, JsonArray>> handler);

	/**
	 *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	void countLibrarySubject(final JsonObject searchData, final Handler<Either<String, JsonObject>> handler);
	
	/**
	 *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
    void getById(final String id, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

	void publishLibrary(final Long fromSubjectId, final String authorsContributors,
	                           final Long typeId, final Long levelId, JsonArray tag, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

	void duplicateSubjects(final JsonArray subjectIds, final Long folderId, final String titleSuffix, final UserInfos user,
					  final Handler<Either<String, JsonObject>> handler);

	void move(final JsonArray subjectIds, final Long targetFolderId, final Handler<Either<String, JsonObject>> handler);

	void unpublishLibrary(final Long  subjectId, final Handler<Either<String, JsonObject>> handler);

	void getCorrectedDownloadInformation(final String id, final Handler<Either<String, JsonObject>> handler);

	void setLastLibraryVisit(final String userId, final String displayName, final Handler<Either<String, JsonObject>> handler);

	void countNewSubjectInLibrary(final String userId, final Handler<Either<String, JsonObject>> handler);

	/** 
	 * List documents associated to a subject; 
	 * @param subjectId ID of the Subject
	 * @return tuples of (id:Long, doc_id:String, doc_type:String, metadata:JSON)
	 */
	void listCorrectedDocuments(final Long subjectId, final Handler<Either<String, JsonArray>> handler);

	/**
	 * Get a document metadata associated to a subject.
	 * @param id ID of the Subject
	 * @param docId ID of the document (valid in Workspace or Storage)
	 */
	void getCorrectedDocument(final Long subjectId, final String docId, final Handler<Either<String, JsonObject>> handler);

	/**
	 * Associate a document (from workspace) to a subject.
	 * @param id ID of the Subject
	 * @param docId ID of the document (valid in Workspace)
	 * @param metadata Metadata of the document
	 */
	void addCorrectedDocument(final Long subjectId, final String docId, final JsonObject metadata, final Handler<Either<String, JsonObject>> handler);

	/**
	 * Associate a file (from storage) to a subject.
	 * @param id ID of the Subject
	 * @param fileId ID of the file (valid in storage)
	 * @param metadata Metadata of the document
	 */
	void addCorrectedFile(final Long subjectId, final String fileId, final JsonObject metadata, final Handler<Either<String, JsonObject>> handler);

	/**
	 * Delete a document associated to a subject.
	 * @param id ID of the Subject
	 * @param docId ID of the document (valid in Workspace)
	 */
	void deleteCorrectedDocument(final Long subjectId, final String docId, final Handler<Either<String, JsonObject>> handler);
}
