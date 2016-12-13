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

package fr.openent.exercizer.controllers;

import fr.openent.exercizer.services.ISubjectScheduledService;
import fr.openent.exercizer.services.impl.SubjectScheduledServiceSqlImpl;
import fr.openent.exercizer.utils.GroupUtils;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.ShareAndOwner;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.entcore.common.utils.DateUtils;
import org.entcore.common.utils.StringUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.text.ParseException;
import java.util.*;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;


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
		final Long subjectId;
		try {
			subjectId = Long.parseLong(request.params().get("id"));
		}catch (NumberFormatException e) {
			badRequest(request, e.getMessage());
			return;
		}

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix+"subjectScheduled", new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject scheduledSubject) {
							if (checkScheduledSubject(request, scheduledSubject)) {
								scheduledSubject.putNumber("subjectId", subjectId);

								final JsonObject scheduledAt = scheduledSubject.getObject("scheduledAt");
								final JsonArray usersJa = scheduledAt.getArray("userList", new JsonArray());
								final JsonArray groupsJa = scheduledAt.getArray("groupList", new JsonArray());

								if (groupsJa.size() > 0) {
									//find group member
									Set<String> groupIds = new HashSet<String>();
									for (int i = 0; i < groupsJa.size(); i++) {
										if (!(groupsJa.get(i) instanceof JsonObject)) continue;
										groupIds.add(groupsJa.<JsonObject>get(i).getString("_id"));
									}

									GroupUtils.findMembers(eb, user.getUserId(), new ArrayList<String>(groupIds), new Handler<JsonArray>() {
												@Override
												public void handle(JsonArray membersJa) {
													if (membersJa != null) {
														//users list without duplicates
														final JsonArray usersSafe = new JsonArray();
														final Set<String> userIds = new HashSet<String>();

														//users
														safeUsersCollections(usersJa, usersSafe, userIds);

														//members of groups
														safeUsersCollections(membersJa, usersSafe, userIds);

														scheduledSubject.putArray("users", usersSafe);

														//check, mainly in case of groups, they contain members
														if (userIds.size() > 0) {
															scheduleAndNotifies(scheduledSubject, user, userIds, request);
														} else {
															badRequest(request, "exercizer.schedule.empty.groups");
														}
													} else {
														log.error("Failure to find group members : JsonArray null");
														renderError(request);
													}
												}
											}
									);
								} else {
									//only users
									final JsonArray usersSafe = new JsonArray();
									final Set<String> userIds = new HashSet<String>();
									safeUsersCollections(usersJa, usersSafe, userIds);

									scheduledSubject.putArray("users", usersSafe);
									scheduleAndNotifies(scheduledSubject, user, userIds, request);
								}
							}
						}
					});
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}

			}
		});
	}

	private boolean checkScheduledSubject(final HttpServerRequest request, final JsonObject scheduledSubject) {
		final String sBeginDate = scheduledSubject.getString("beginDate");
		final String sDueDate = scheduledSubject.getString("dueDate");
		if (StringUtils.isEmpty(sBeginDate) || StringUtils.isEmpty(sDueDate)) {
			badRequest(request, "exercizer.schedule.empty.date");
			return false;
		}

		Date beginDate;
		Date dueDate;

		try {
			beginDate = DateUtils.parseTimestampWithoutTimezone(sBeginDate);
			dueDate = DateUtils.parseTimestampWithoutTimezone(sDueDate);
		} catch (ParseException e) {
			log.error("can't parse dueDate or beginDate of scheduled subject", e);
			renderError(request);
			return false;
		}

		if (beginDate.after(dueDate)) {
			badRequest(request, "exercizer.schedule.rule.date");
			return false;
		}

		final JsonObject scheduledAt = scheduledSubject.getObject("scheduledAt");
		if (scheduledAt.getArray("userList", new JsonArray()).size() == 0 && scheduledAt.getArray("groupList", new JsonArray()).size() == 0) {
			badRequest(request, "exercizer.schedule.empty.users");
			return false;
		}

		return true;
	}

	private void safeUsersCollections(JsonArray usersParam, JsonArray usersSafe, Set<String> userIds) {
		for (int i=0;i<usersParam.size();i++) {
			if (!(usersParam.get(i) instanceof JsonObject)) continue;
			final JsonObject joUser = usersParam.<JsonObject>get(i);
			final String currentUserId = joUser.getString("_id");
			if (!userIds.contains(currentUserId)) {
				userIds.add(currentUserId);
				usersSafe.add(joUser);
			}
		}
	}

	private void scheduleAndNotifies(final JsonObject scheduledSubject, final UserInfos user, final Set<String> userIds, final HttpServerRequest request) {
		subjectScheduledService.schedule(scheduledSubject, user, new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				if (event.isRight()) {
					Date dueDate = new Date();
					try {
						dueDate = DateUtils.parseTimestampWithoutTimezone(scheduledSubject.getString("dueDate"));
					} catch (ParseException e) {
						log.error("can't parse dueDate of scheduled subject", e);
					}
					final String dueDateFormat = DateUtils.format(dueDate);
					final String subjectName = scheduledSubject.getString("subjectTitle");

					final List<String> recipientSet = new ArrayList<String>(userIds);
					sendNotification(request, "assigncopy", user, recipientSet, "/dashboard/student", subjectName, dueDateFormat, null);

					Renders.created(request);
				} else {
					renderError(request, new JsonObject().putString("error","exercizer.subject.scheduled.error"));
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
	 *   @param relativeUri: relative url exemple: /subject/copy/perform/9/	 *
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
        params.putString("userUri", container.config().getString("host", "http://localhost:8090") +
                "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
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
