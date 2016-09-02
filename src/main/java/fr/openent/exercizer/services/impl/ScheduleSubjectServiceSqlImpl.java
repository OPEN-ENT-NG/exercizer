package fr.openent.exercizer.services.impl;

import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IScheduleSubjectService;
import fr.wseduc.webutils.Either;

public class ScheduleSubjectServiceSqlImpl implements IScheduleSubjectService {

	@Override
	public void schedule(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {

		JsonObject subjectScheduled = resource.getObject("subjectScheduled");
		ExercizerSqlStatementBuilderService exercizerSqlStatementBuilderService = new ExercizerSqlStatementBuilderService("exercizer", "subject_scheduled");
		SqlStatementsBuilder subjectScheduledSqlStatement = exercizerSqlStatementBuilderService.persist(subjectScheduled, user);

		Sql.getInstance().transaction(subjectScheduledSqlStatement.build(), SqlResult.validUniqueResultHandler(1, new Handler<Either<String,JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> subjectScheduledHandler) {
				
				if (subjectScheduledHandler.isRight()) {
					
					final JsonObject subjectScheduled = ResourceParser.beforeAny(subjectScheduledHandler.right().getValue());
					JsonArray grainScheduledList = resource.getArray("grainScheduledList");
					ExercizerSqlStatementBuilderService exercizerSqlStatementBuilderService = new ExercizerSqlStatementBuilderService("exercizer", "grain_scheduled");
					JsonArray grainScheduledSqlStatements = new JsonArray();
					
					for (int i = 0; i < grainScheduledList.size(); i++) {
						JsonObject grainScheduled = grainScheduledList.get(i);
						grainScheduled.putNumber("subject_scheduled_id", subjectScheduled.getNumber("id"));
						grainScheduledSqlStatements.addArray(exercizerSqlStatementBuilderService.persist(grainScheduled, user).build());
					}
					
					Sql.getInstance().transaction(grainScheduledSqlStatements, SqlResult.validResultHandler(new Handler<Either<String,JsonArray>>() {
						@Override
						public void handle(Either<String, JsonArray> grainScheduledListHandler) {
							
							if (grainScheduledListHandler.isRight()) {
								
								final JsonArray grainScheduledList = grainScheduledListHandler.right().getValue();
								JsonArray userList = resource.getArray("userList");
								JsonObject subjectCopyTemplate = resource.getObject("subjectCopyTemplate");
								ExercizerSqlStatementBuilderService exercizerSqlStatementBuilderService = new ExercizerSqlStatementBuilderService("exercizer", "subject_copy");
								JsonArray subjectCopySqlStatements = new JsonArray();
								
								for (int i = 0; i < userList.size(); i++) {
									JsonObject subjectCopy = subjectCopyTemplate.copy();
									subjectCopy.putNumber("subject_scheduled_id", subjectScheduled.getNumber("id"));
									subjectCopy.putString("owner", ((JsonObject) userList.get(i)).getString("owner"));
									subjectCopy.putString("owner_name", ((JsonObject) userList.get(i)).getString("owner_name"));
									subjectCopySqlStatements.addArray(exercizerSqlStatementBuilderService.persistWithAnotherOwner(subjectCopy, user).build());
								}
								
								Sql.getInstance().transaction(subjectCopySqlStatements, SqlResult.validResultHandler(new Handler<Either<String,JsonArray>>() {
									@Override
									public void handle(Either<String, JsonArray> subjectCopyListHandler) {
										
										if (subjectCopyListHandler.isRight()) {
											
											final JsonArray subjectCopyList = subjectCopyListHandler.right().getValue();
											JsonArray grainCopyListTemplate = resource.getArray("grainCopyListTemplate");
											ExercizerSqlStatementBuilderService exercizerSqlStatementBuilderService = new ExercizerSqlStatementBuilderService("exercizer", "grain_copy");
											JsonArray grainCopySqlStatements = new JsonArray();
											
											for (int i = 0; i < subjectCopyList.size(); i++) {
												for (int j = 0; j < grainCopyListTemplate.size(); j++) {
													// the grain scheduled and grain copy must have the same order (AngularJS job)
													JsonObject grainCopy = ((JsonObject) grainCopyListTemplate.get(j)).copy();
													grainCopy.putNumber("subject_copy_id", ((JsonObject) subjectCopyList.get(i)).getNumber("id"));
													grainCopy.putNumber("grain_scheduled_id", ((JsonObject) grainScheduledList.get(j)).getNumber("id"));
													grainCopySqlStatements.addArray(exercizerSqlStatementBuilderService.persist(grainCopy, user).build());
												}
											}
											
											Sql.getInstance().transaction(grainCopySqlStatements, SqlResult.validResultHandler(new Handler<Either<String,JsonArray>>() {
												@Override
												public void handle(Either<String, JsonArray> grainCopyListHandler) {
													
													if (grainCopyListHandler.isRight()) {
														
														// TODO ??
														
													} else {
														// TODO delete subject scheduled, grain scheduled list, subject copy list
													}
												}
											}));
											
											
										} else {
											// TODO delete subject scheduled, grain scheduled
										}
									}
								}));
								
							} else {
								// TODO delete subject scheduled
							}
						}
					}));
					
				} else {
					// TODO ??
				}
			}
		}));


	}

}
