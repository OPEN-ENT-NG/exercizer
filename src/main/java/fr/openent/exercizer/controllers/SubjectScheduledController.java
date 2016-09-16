package fr.openent.exercizer.controllers;

import fr.openent.exercizer.services.ISubjectScheduledService;
import fr.openent.exercizer.services.impl.SubjectScheduledServiceSqlImpl;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.ShareAndOwner;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;
import fr.wseduc.webutils.Either;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;


import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.OwnerOnly;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;
import fr.openent.exercizer.parsers.ResourceParser;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;

import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;


public class SubjectScheduledController extends ControllerHelper {

	private final ISubjectScheduledService subjectScheduledService;

	public SubjectScheduledController() {
		this.subjectScheduledService = new SubjectScheduledServiceSqlImpl();
	}

	@Post("/schedule-subject/:id")
	@ApiDoc("Schedules a subject.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
	public void schedule(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							subjectScheduledService.schedule(resource, user, new Handler<Either<String,JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> r) {
									if (r.isRight()) {
										final JsonObject resourceScheduled  = ResourceParser.beforeAny(r.right().getValue());
										final JsonObject subjectScheduled = resourceScheduled.getObject("subjectScheduled");
										final String subjectScheduleDueDate = subjectScheduled.getString("due_date");
										final String subjectScheduleDueDate_readable = subjectScheduleDueDate.substring(8,10) + "/" + subjectScheduleDueDate.substring(5,7) + "/" + subjectScheduleDueDate.substring(0,4);
										final String subjectName = subjectScheduled.getString("title"); 

										final JsonArray subjectCopyListArray =  resourceScheduled.getArray("subjectCopyList");
										List<String> recipientSet;
										JsonObject subjectCopy;
										recipientSet = new ArrayList<String>();
										for (int i = 0 ; i < subjectCopyListArray.size(); i++) {                                    	
											subjectCopy = subjectCopyListArray.get(i);
											//recipientSet = new ArrayList<String>();
											recipientSet.add(subjectCopy.getString("owner"));
											//String subjectCopyId = Long.toString(subjectCopy.getLong("id"));
											//String relativeUri = "/subject/copy/perform/"+subjectCopyId;
											//sendNotification(request, "assigncopy", user, recipientSet, relativeUri, subjectName, subjectScheduleDueDate_readable, subjectCopyId);
										}
										String relativeUri = "/dashboard/student";
										sendNotification(request, "assigncopy", user, recipientSet, relativeUri, subjectName, subjectScheduleDueDate_readable, null);

										renderJson(request, resourceScheduled); 
									} else {
										renderError(request, new JsonObject().putString("error",r.left().getValue()));
									}
								}
							});
						}
					});
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}

			}
		});
	}

	/**
	 *   Send a notification in copy controller
	 *   @param request : HttpServerRequest client
	 *   @param notificationName : name of the notification
	 *   @param user : user who send the notification
	 *   @param recipientSet : list of student
	 *   @param relativeUri: relative url exemple: /subject/copy/perform/9/
	 *   @param message : message of the notification
	 *   @param idResource : id of the resource
	 **/

	private void sendNotification(
			final HttpServerRequest request,
			final String notificationName,
			final UserInfos user,
			final List<String> recipientSet,
			final String relativeUri,
			final String subjectName,
			final String dueDate,
			final String idResource
			) {
		JsonObject params = new JsonObject();
		params.putString("uri", container.config().getString("host", "http://localhost:8090") +
				"/exercizer#" + relativeUri);
		params.putString("username", user.getUsername());
		params.putString("subjectName", subjectName);
		params.putString("dueDate", dueDate);
		params.putString("resourceUri", params.getString("uri"));
		this.notification.notifyTimeline(request,"exercizer." + notificationName, user, recipientSet, idResource, params);
	}

	@Post("/subject-scheduled/:id")
	@ApiDoc("Persists a subject scheduled.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
	public void persist(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							subjectScheduledService.persist(resource, user, notEmptyResponseHandler(request));
						}
					});
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}

			}
		});
	}

	@Get("/subjects-scheduled")
	@ApiDoc("Gets subject scheduled list.")
	@SecuredAction("exercizer.subject.scheduled.list")
	public void list(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					subjectScheduledService.list(user, arrayResponseHandler(request));
				}
				else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}

	@Get("/subjects-scheduled-by-subjects-copy")
	@ApiDoc("Gets subject scheduled list by subject copy list.")
	@SecuredAction("exercizer.subject.scheduled.list.by.subject.copy.list")
	public void listBySubjectCopyList(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					subjectScheduledService.listBySubjectCopyList(user, arrayResponseHandler(request));
				}
				else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}
}