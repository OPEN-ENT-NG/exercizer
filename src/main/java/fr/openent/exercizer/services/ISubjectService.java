package fr.openent.exercizer.services;

import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import fr.wseduc.webutils.Either;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

public interface ISubjectService {

	/**
	 *@see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler);

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
}
