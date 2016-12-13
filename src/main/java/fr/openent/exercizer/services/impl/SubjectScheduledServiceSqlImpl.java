package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.ISubjectScheduledService;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.Renders;

import java.util.ArrayList;
import java.util.List;

import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

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
	public void schedule(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {

    	final JsonObject body = ResourceParser.beforeAny(resource);
		JsonObject subjectScheduled = body.getObject("subjectScheduled");
		subjectScheduled.putString("owner", user.getUserId());
    	subjectScheduled.putString("owner_username", user.getUsername());
		final ExercizerSqlStatementBuilderService exercizerSubjectScheduledSqlStatementBuilderService = new ExercizerSqlStatementBuilderService("exercizer", "subject_scheduled");
		SqlStatementsBuilder subjectScheduledSqlStatement = exercizerSubjectScheduledSqlStatementBuilderService.persist(subjectScheduled, user, null);

		Sql.getInstance().transaction(subjectScheduledSqlStatement.build(), SqlResult.validUniqueResultHandler(1, new Handler<Either<String,JsonObject>>() {
			@Override
			public void handle(final Either<String, JsonObject> subjectScheduledHandler) {
				
				if (subjectScheduledHandler.isRight()) {
					
					final JsonObject subjectScheduled = ResourceParser.beforeAny(subjectScheduledHandler.right().getValue());
					JsonArray grainScheduledList = body.getArray("grainScheduledList");
					final ExercizerSqlStatementBuilderService exercizerGrainScheduledSqlStatementBuilderService = new ExercizerSqlStatementBuilderService("exercizer", "grain_scheduled");
					SqlStatementsBuilder grainScheduledListSqlStatement = new SqlStatementsBuilder();
					
					for (int i = 0; i < grainScheduledList.size(); i++) {
						JsonObject grainScheduled = grainScheduledList.get(i);
						grainScheduled.putNumber("subject_scheduled_id", subjectScheduled.getNumber("id"));
						grainScheduledListSqlStatement = exercizerGrainScheduledSqlStatementBuilderService.persist(grainScheduled, grainScheduledListSqlStatement);
					}
					
					Sql.getInstance().transaction(grainScheduledListSqlStatement.build(), SqlResult.validResultsHandler(new Handler<Either<String,JsonArray>>() {
						@Override
						public void handle(Either<String, JsonArray> grainScheduledListHandler) {
							
							if (grainScheduledListHandler.isRight()) {
								
								final JsonArray grainScheduledListResult = grainScheduledListHandler.right().getValue();
								JsonArray userList = body.getArray("userList");
								JsonObject subjectCopyTemplate = body.getObject("subjectCopyTemplate");
								final ExercizerSqlStatementBuilderService exercizerSubjectCopySqlStatementBuilderService = new ExercizerSqlStatementBuilderService("exercizer", "subject_copy");
								SqlStatementsBuilder subjectCopyListSqlStatement = new SqlStatementsBuilder();
								
								for (int i = 0; i < userList.size(); i++) {
									JsonObject subjectCopy = subjectCopyTemplate.copy();
									JsonObject currentUser = new JsonObject(userList.get(i).toString());
									subjectCopy.putNumber("subject_scheduled_id", subjectScheduled.getNumber("id"));
									subjectCopy.putString("owner", currentUser.getString("id"));
									subjectCopy.putString("owner_username", currentUser.getString("name"));
									subjectCopyListSqlStatement = exercizerSubjectCopySqlStatementBuilderService.persistWithAnotherOwner(subjectCopy, subjectCopyListSqlStatement);
								}
								
								Sql.getInstance().transaction(subjectCopyListSqlStatement.build(), SqlResult.validResultsHandler(new Handler<Either<String,JsonArray>>() {
									@Override
									public void handle(Either<String, JsonArray> subjectCopyListHandler) {
										
										if (subjectCopyListHandler.isRight()) {
											
											final JsonArray subjectCopyListResult = subjectCopyListHandler.right().getValue();
											JsonArray grainCopyListTemplate = body.getArray("grainCopyListTemplate");
											final ExercizerSqlStatementBuilderService exercizerGrainCopySqlStatementBuilderService = new ExercizerSqlStatementBuilderService("exercizer", "grain_copy");
											SqlStatementsBuilder grainCopyListSqlStatement = new SqlStatementsBuilder();
											
											// first, rebuilds arrays of grain scheduled and subject copy (because of merge user requests)
											final List<JsonObject> grainScheduledList = new ArrayList<>();
											
											for (int i = 0; i < grainScheduledListResult.size(); i++) {
												JsonArray currentResult = grainScheduledListResult.get(i);
												JsonObject currentParsedResult = new JsonObject(currentResult.get(0).toString());
												
												if (currentParsedResult.containsField("id")) {
													grainScheduledList.add(currentParsedResult);
												}
											}
											
											final List<JsonObject> subjectCopyList = new ArrayList<>();
											
											for (int i = 0; i < subjectCopyListResult.size(); i++) {
												JsonArray currentResult = subjectCopyListResult.get(i);
												JsonObject currentParsedResult = new JsonObject(currentResult.get(0).toString());
												
												if (currentParsedResult.containsField("id")) {
													subjectCopyList.add(currentParsedResult);
												}
											}
											
											// then builds the statements of grain copy inserts
											for (int i = 0; i < subjectCopyList.size(); i++) {
												for (int j = 0; j < grainCopyListTemplate.size(); j++) {
													// the grain scheduled and grain copy must have the same order (AngularJS job)
													JsonObject currentSubjectCopy = subjectCopyList.get(i);
													JsonObject currentGrainScheduled = grainScheduledList.get(j);
													JsonObject currentGrainCopyTemplate = new JsonObject(grainCopyListTemplate.get(j).toString());
													JsonObject grainCopy = currentGrainCopyTemplate.copy();
													grainCopy.putNumber("subject_copy_id", currentSubjectCopy.getNumber("id"));
													grainCopy.putNumber("grain_scheduled_id", currentGrainScheduled.getNumber("id"));
													grainCopyListSqlStatement = exercizerGrainCopySqlStatementBuilderService.persist(grainCopy, grainCopyListSqlStatement);
												}
											}
											
											Sql.getInstance().transaction(grainCopyListSqlStatement.build(), SqlResult.validResultsHandler(new Handler<Either<String,JsonArray>>() {
												@Override
												public void handle(Either<String, JsonArray> grainCopyListHandler) {
													
													if (grainCopyListHandler.isLeft()) {
														SqlStatementsBuilder deleteStatement = exercizerSubjectScheduledSqlStatementBuilderService.delete(subjectScheduled.getNumber("id"), "id");
														Sql.getInstance().transaction(deleteStatement.build(), SqlResult.validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
															@Override
															public void handle(final Either<String, JsonObject> deleteHandler) {
																
																if (deleteHandler.isLeft()) {
																	log.debug("Failed to delete object 'subject_scheduled' with id = " + subjectScheduled.getNumber("id") + " and associated 'grain_scheduled' and 'subject_copy' objects.");
																}
																
																handler.handle(new Either.Left<String, JsonObject>(""));
															}
														}));
													} else {
														// first, rebuilds array of grain copy.
														JsonArray grainCopyListResult = grainCopyListHandler.right().getValue();
														final List<JsonObject> grainCopyList = new ArrayList<>();
														
														for (int i = 0; i < grainCopyListResult.size(); i++) {
															JsonArray currentResult = grainCopyListResult.get(i);
															JsonObject currentParsedResult = new JsonObject(currentResult.get(0).toString());
															
															if (currentParsedResult.containsField("id")) {
																grainCopyList.add(currentParsedResult);
															}
														}
														
														
														// then builds arrays results.
														JsonArray grainScheduledListArray = new JsonArray();
														for (JsonObject grainScheduled : grainScheduledList) {
															grainScheduledListArray.addObject(grainScheduled);
														}
														
														JsonArray subjectCopyListArray = new JsonArray();
														for (JsonObject subjectCopy : subjectCopyList) {
															subjectCopyListArray.addObject(subjectCopy);
														}
														
														JsonArray grainCopyListArray = new JsonArray();
														for (JsonObject grainCopy : grainCopyList) {
															grainCopyListArray.addObject(grainCopy);
														}
														
														JsonObject result = new JsonObject();
														result.putObject("subjectScheduled", subjectScheduled);
														result.putArray("grainScheduledList", grainScheduledListArray);
														result.putArray("subjectCopyList", subjectCopyListArray);
														result.putArray("grainCopyList", grainCopyListArray);
														
														handler.handle(new Either.Right<String, JsonObject>(result));
													}
												}
											}));
											
											
										} else {
											SqlStatementsBuilder deleteStatement = exercizerSubjectScheduledSqlStatementBuilderService.delete(subjectScheduled.getNumber("id"), "id");
											Sql.getInstance().transaction(deleteStatement.build(), SqlResult.validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
												@Override
												public void handle(final Either<String, JsonObject> deleteHandler) {
													
													if (deleteHandler.isLeft()) {
														log.debug("Failed to delete object 'subject_scheduled' with id = " + subjectScheduled.getNumber("id") + " and associated 'grain_scheduled' objects.");
													}
													
													handler.handle(new Either.Left<String, JsonObject>(""));
												}
											}));
										}
									}
								}));
								
							} else {
								SqlStatementsBuilder deleteStatement = exercizerSubjectScheduledSqlStatementBuilderService.delete(subjectScheduled.getNumber("id"), "id");
								Sql.getInstance().transaction(deleteStatement.build(), SqlResult.validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
									@Override
									public void handle(final Either<String, JsonObject> deleteHandler) {
										
										if (deleteHandler.isLeft()) {
											log.debug("Failed to delete object 'subject_scheduled' with id = " + subjectScheduled.getNumber("id") + ".");
										}
										
										handler.handle(new Either.Left<String, JsonObject>(""));
									}
								}));
							}
						}
					}));
					
				}
			}
		}));
    }

}
