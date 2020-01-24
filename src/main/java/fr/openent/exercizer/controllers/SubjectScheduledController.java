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

import fr.openent.exercizer.filters.SubjectsScheduledOwner;
import fr.openent.exercizer.filters.SubjectScheduledCorrected;
import fr.openent.exercizer.filters.SubjectScheduledOwner;
import fr.openent.exercizer.services.ISubjectCopyService;
import fr.openent.exercizer.services.ISubjectScheduledService;
import fr.openent.exercizer.services.impl.SubjectCopyServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectScheduledServiceSqlImpl;
import fr.openent.exercizer.utils.GroupUtils;
import fr.openent.exercizer.utils.PushNotificationUtils;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.ShareAndOwner;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.entcore.common.utils.DateUtils;
import org.entcore.common.utils.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.text.ParseException;
import java.util.*;

import static org.entcore.common.http.response.DefaultResponseHandler.*;


public class SubjectScheduledController extends ControllerHelper {

	private final ISubjectScheduledService subjectScheduledService;
	private final ISubjectCopyService subjectCopyService;
	private final Storage storage;
	private enum ScheduledType  {
		SIMPLE,
		INTERACTIVE
	}

	public SubjectScheduledController(final Storage storage) {
		this.subjectScheduledService = new SubjectScheduledServiceSqlImpl();
		this.subjectCopyService = new SubjectCopyServiceSqlImpl();
		this.storage = storage;
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
					RequestUtils.bodyToJson(request, pathPrefix+"subjectScheduled", getScheduleHandler(user, request, subjectId, ScheduledType.INTERACTIVE));
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}

			}
		});
	}

	@Delete("/unschedule-subject/:id")
	@ApiDoc("Unschedules a subject.")
	@ResourceFilter(SubjectScheduledOwner.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void unSchedule(final HttpServerRequest request) {
		final Long subjectScheduledId;
		try {
			subjectScheduledId = Long.parseLong(request.params().get("id"));
		}catch (NumberFormatException e) {
			badRequest(request, e.getMessage());
			return;
		}

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					//find subject title and members of scheduled subject for notification
					subjectScheduledService.findUnscheduledData(subjectScheduledId, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							if (event.isLeft()) {
								leftToResponse(request, event.left());
								return;
							}

							final JsonObject jo = event.right().getValue();
							final List<String> recipientSet = jo.getJsonArray("owners", new fr.wseduc.webutils.collections.JsonArray()).getList();
							subjectScheduledService.unSchedule(subjectScheduledId, new Handler<Either<String, JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> either) {
									if (either.isLeft()) {
										leftToResponse(request, either.left());
										return;
									}

									Renders.noContent(request);
									sendNotification(request, "unassigncopy", user, recipientSet, "", jo.getString("title"),null, jo.getString("due_date"), null);
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

	@Post("/schedule-simple-subject/:id")
	@ApiDoc("Schedules a simple subject.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
	public void simpleSchedule(final HttpServerRequest request) {
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
					RequestUtils.bodyToJson(request, pathPrefix+"simpleSubjectScheduled", getScheduleHandler(user, request, subjectId, ScheduledType.SIMPLE));
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}

			}
		});
	}

	@Get("/members")
	@ApiDoc("Get members of groups.")
	@SecuredAction(value = "", type = ActionType.AUTHENTICATED)
	public void getMembers(final HttpServerRequest request) {
		final String id = request.params().get("id");

		if (StringUtils.isEmpty(id)) {
			badRequest(request);
			return;
		}
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					GroupUtils.findMembers(eb, user.getUserId(), Arrays.asList(id), new Handler<JsonArray>() {
						@Override
						public void handle(JsonArray membersJa) {
							if (membersJa != null) {
								renderJson(request, membersJa);
							} else {
								log.error("Failure to find group members : JsonArray null");
								renderError(request);
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



	@Post("/schedule-subject/modify/:id")
	@ApiDoc("Schedules a simple subject.")
	@ResourceFilter(SubjectScheduledOwner.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void modifySchedule(final HttpServerRequest request) {
		String subjectId = request.params().get("id");
		if(subjectId == null || subjectId.trim().isEmpty()){
			badRequest(request);
		}
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix+"modifySchedule", new Handler<JsonObject>() {
						@Override
						public void handle( final JsonObject body) {
							Integer offset = - body.getInteger("offset", 0);
							int hours = offset / 60;
							int minutes = offset % 60;
							final Date nowClient = new DateTime(DateTimeZone.forOffsetHoursMinutes(hours, minutes)).toLocalDateTime().toDate();
   							final Map<String, Date> newDates = new HashMap<String, Date>();
							try {
								newDates.put("beginDate", DateUtils.parseTimestampWithoutTimezone(body.getString("beginDate")));
								newDates.put("dueDate", DateUtils.parseTimestampWithoutTimezone(body.getString("dueDate")));
								if(body.getString("correctedDate") != null)
									newDates.put("correctedDate", DateUtils.parseTimestampWithoutTimezone(body.getString("correctedDate")));
							} catch (ParseException e) {
								log.error("can't parse dates of scheduled subject", e);
								badRequest(request);
								return;
							}

							final Date newBeginDate = newDates.get("beginDate");
							final Date newDueDate = newDates.get("dueDate");

							if(newBeginDate.after(newDueDate)) {
								badRequest(request, "exercizer.schedule.rule.date");
								return;
							}

							subjectScheduledService.getById(subjectId, user, new Handler<Either<String, JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> event) {
									if(event.isLeft()){
										badRequest(request);
										return;
									}else {
										JsonObject scheduledSubject = event.right().getValue();
										final Date oldBeginDate;

										try {
											oldBeginDate = DateUtils.parseTimestampWithoutTimezone(scheduledSubject.getString("begin_date"));
										} catch (ParseException e) {
											log.error("can't parse dates of scheduled subject", e);
											renderError(request);
											return;
										}

										if(!newBeginDate.equals(oldBeginDate)){
											if(nowClient.after(newBeginDate)) {
												badRequest(request, "exercizer.schedule.rule.date.start");
												return;
											}
											subjectCopyService.getSubmittedBySubjectScheduled(subjectId, new Handler<Either<String, JsonArray>>() {
													@Override
													public void handle(Either<String, JsonArray> event) {
														if (event.isLeft()) {

														} else {
															if (!event.right().getValue().isEmpty()) {
																badRequest(request, "exercizer.schedule.rule.copies");
																return;
															}
															checkAndModifySchedule(request, subjectId, scheduledSubject, newDates, body, true, user);
														}
													}
												});

										}else {
											checkAndModifySchedule(request, subjectId, scheduledSubject, newDates, body, false, user);
										}
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

	private void checkAndModifySchedule(final HttpServerRequest request, final String subjectId, final JsonObject scheduledSubject,
											  final Map<String, Date> newDates, JsonObject values, boolean changeBegin , UserInfos user){
		Date beginDate = newDates.get("beginDate");
		Date newDueDate = newDates.get("dueDate");
		Date newCorrectedDate = newDates.get("correctedDate");
		Date oldDueDate;
		JsonObject fields = new JsonObject();

		if(changeBegin)
			fields.put("beginDate", values.getString("beginDate"));

		try {
			oldDueDate = DateUtils.parseTimestampWithoutTimezone(scheduledSubject.getString("due_date"));
		} catch (ParseException e) {
			log.error("can't parse old DueDate of scheduled subject", e);
			renderError(request);
			return;
		}

		if (!newDueDate.equals(oldDueDate)){
			fields.put("dueDate", values.getString("dueDate"));
		}

		if(scheduledSubject.getString("corrected_date") != null && newCorrectedDate != null){
			fields.put("correctedDate", values.getString("correctedDate"));
		}
		if(values.containsKey("isTrainingPermitted")){
			fields.put("isTrainingPermitted", values.getBoolean("isTrainingPermitted"));
		}
		subjectScheduledService.modify(subjectId, fields, new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				if (event.isRight()) {
					if (scheduledSubject.getBoolean("is_notify")){
						String notification = changeBegin ? "modifybegin" : null;
						if(fields.containsKey("dueDate"))
							notification = notification != null ? "modifyperiod" : "modifydue";
						if(notification != null)
							notifyModification(request, user, subjectId, fields.put("title", scheduledSubject.getString("title")), notification);
					}
					renderJson(request, fields);
				} else {
					renderError(request, new fr.wseduc.webutils.collections.JsonObject().put("error","exercizer.subject.scheduled.error"));
				}
			}
		});
	}

	private void notifyModification(final HttpServerRequest request, final UserInfos user, final String subjectId, final JsonObject values, final String notificationName){
			subjectScheduledService.getMember(subjectId, new Handler<Either<String, JsonArray>>() {
				@Override
				public void handle(Either<String, JsonArray> event) {
					final JsonArray members = event.right().getValue();
					final List<String> recipientSet = new ArrayList<String>();
					final String subjectName = values.getString("title");

					for (Object member : members) {
						if (!(member instanceof JsonObject)) continue;
						recipientSet.add(((JsonObject) member).getString("owner"));
					}
					sendNotification(request, notificationName, user, recipientSet, "/dashboard/student", subjectName, values.getString("beginDate"),
							values.getString("dueDate"), null);
				}
			});
	}


	private Handler<JsonObject> getScheduleHandler(final UserInfos user, final HttpServerRequest request, final Long subjectId, final ScheduledType type) {
		return new Handler<JsonObject>() {
            @Override
            public void handle(final JsonObject scheduledSubject) {
                if (checkScheduledSubject(request, scheduledSubject, type)) {
                    scheduledSubject.put("subjectId", subjectId);

                    final JsonObject scheduledAt = scheduledSubject.getJsonObject("scheduledAt");
                    final JsonArray usersJa = scheduledAt.getJsonArray("userList", new fr.wseduc.webutils.collections.JsonArray());
                    final JsonArray groupsJa = scheduledAt.getJsonArray("groupList", new fr.wseduc.webutils.collections.JsonArray());
					final JsonArray excludeJa = scheduledAt.getJsonArray("exclude", new fr.wseduc.webutils.collections.JsonArray());

                    if (groupsJa.size() > 0) {
                        //find group member
                        Set<String> groupIds = new HashSet<String>();
                        for (int i = 0; i < groupsJa.size(); i++) {
                            if (!(groupsJa.getValue(i) instanceof JsonObject)) continue;
                            groupIds.add(groupsJa.getJsonObject(i).getString("_id"));
                        }

                        GroupUtils.findMembers(eb, user.getUserId(), new ArrayList<String>(groupIds), new Handler<JsonArray>() {
                                    @Override
                                    public void handle(JsonArray membersJa) {
                                        if (membersJa != null) {
                                            //users list without duplicates
                                            final JsonArray usersSafe = new fr.wseduc.webutils.collections.JsonArray();
                                            final Set<String> userIds = new HashSet<String>();

                                            //users
                                            safeUsersCollections(usersJa, usersSafe, userIds, excludeJa);

                                            //members of groups
                                            safeUsersCollections(membersJa, usersSafe, userIds, excludeJa);

                                            scheduledSubject.put("users", usersSafe);

                                            //check, mainly in case of groups, they contain members
                                            if (userIds.size() > 0) {
                                                scheduleAndNotifies(scheduledSubject, user, userIds, request, type);
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
                        final JsonArray usersSafe = new fr.wseduc.webutils.collections.JsonArray();
                        final Set<String> userIds = new HashSet<String>();
                        safeUsersCollections(usersJa, usersSafe, userIds, excludeJa);

                        scheduledSubject.put("users", usersSafe);
                        scheduleAndNotifies(scheduledSubject, user, userIds, request, type);
                    }
                }
            }
        };
	}

	private boolean checkScheduledSubject(final HttpServerRequest request, final JsonObject scheduledSubject, final ScheduledType type) {
		final String sBeginDate = scheduledSubject.getString("beginDate");
		final String sDueDate = scheduledSubject.getString("dueDate");
		final String sCorrectedDate = scheduledSubject.getString("correctedDate");
		if (StringUtils.isEmpty(sBeginDate) || StringUtils.isEmpty(sDueDate)) {
			badRequest(request, "exercizer.schedule.empty.date");
			return false;
		}

		if (ScheduledType.SIMPLE.equals(type) && StringUtils.isEmpty(sCorrectedDate)) {
			badRequest(request, "exercizer.schedule.empty.corrected.date");
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

		final JsonObject scheduledAt = scheduledSubject.getJsonObject("scheduledAt");
		if (scheduledAt.getJsonArray("userList", new fr.wseduc.webutils.collections.JsonArray()).size() == 0 && scheduledAt.getJsonArray("groupList", new JsonArray()).size() == 0) {
			badRequest(request, "exercizer.schedule.empty.users");
			return false;
		}

		return true;
	}

	private void safeUsersCollections(JsonArray usersParam, JsonArray usersSafe, Set<String> userIds, JsonArray excludeJa) {
		for (int i=0;i<usersParam.size();i++) {
			if (!(usersParam.getValue(i) instanceof JsonObject)) continue;
			final JsonObject joUser = usersParam.getJsonObject(i);
			final String currentUserId = joUser.getString("_id");
			boolean exclude = false;
			for (Object o : excludeJa) {
				if (!(o instanceof JsonObject)) continue;
				if (StringUtils.trimToBlank(currentUserId).equals(((JsonObject)o).getString("_id"))) {
					exclude = true;
					break;
				}
			}

			if (!userIds.contains(currentUserId) && !exclude) {
				userIds.add(currentUserId);
				usersSafe.add(joUser);
			}
		}
	}

	private void scheduleAndNotifies(final JsonObject scheduledSubject, final UserInfos user, final Set<String> userIds,
	                                 final HttpServerRequest request, final ScheduledType type) {
		Date beginDate = null;
		try {
			beginDate = DateUtils.parseTimestampWithoutTimezone(scheduledSubject.getString("beginDate"));
		} catch (ParseException e) {
			log.error("can't parse beginDate of scheduled subject", e);
			renderError(request);
			return;
		}

		final Date nowUTC = new DateTime(DateTimeZone.UTC).toLocalDateTime().toDate();
		final Boolean isNotify = DateUtils.lessOrEqualsWithoutTime(beginDate, nowUTC);
		scheduledSubject.put("isNotify", isNotify);
		scheduledSubject.put("locale",  I18n.acceptLanguage(request));

		if (ScheduledType.SIMPLE.equals(type)) {
			subjectScheduledService.simpleSchedule(scheduledSubject, user, getHandlerScheduleAndNotifies(scheduledSubject, user, userIds, request, isNotify));
		} else {
			subjectScheduledService.schedule(scheduledSubject, user, getHandlerScheduleAndNotifies(scheduledSubject, user, userIds, request, isNotify));
		}
	}

	private Handler<Either<String, JsonObject>> getHandlerScheduleAndNotifies(final JsonObject scheduledSubject, final UserInfos user, final Set<String> userIds, final HttpServerRequest request,
	                                                                          final boolean isNotify) {
		return new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				if (event.isRight()) {
					if (isNotify) {
						final String subjectName = scheduledSubject.getString("subjectTitle");
						final List<String> recipientSet = new ArrayList<String>(userIds);
						sendNotification(request, "assigncopy", user, recipientSet, "/dashboard/student", subjectName, scheduledSubject.getString("beginDate"), scheduledSubject.getString("dueDate"), null);
					}

					String result = event.right().getValue().toString();
					request.response().putHeader("Content-Length", String.valueOf(result.length()));
					request.response().write(result);
					Renders.created(request);
				} else {
					renderError(request, new fr.wseduc.webutils.collections.JsonObject().put("error","exercizer.subject.scheduled.error"));
				}
			}
		};
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
			final String startDate,
			final String endDate,
			final String idResource
			) {
		if (recipientSet.size() > 0) {
			Date dueDate = new Date();
			Date beginDate = new Date();
			try {
				if(endDate != null)
					dueDate = DateUtils.parseTimestampWithoutTimezone(endDate);
				if(startDate != null)
					beginDate = DateUtils.parseTimestampWithoutTimezone(startDate);
			} catch (ParseException e) {
				log.error("can't parse dueDate of scheduled subject", e);
			}

			JsonObject params = new fr.wseduc.webutils.collections.JsonObject();
			params.put("uri", pathPrefix + "#" + relativeUri);
			params.put("userUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
			params.put("username", user.getUsername());
			params.put("subjectName", subjectName);
			params.put("resourceUri", params.getString("uri", ""));
			params.put("disableAntiFlood", true);
			params.put("pushNotif", PushNotificationUtils.getNotification(request, notificationName, params));
			if(endDate != null) {
				params.put("dueDate", DateUtils.format(dueDate));
				params.put("dueTime", DateUtils.format(dueDate, "HH:mm"));
			}
			if(startDate != null) {
				params.put("beginDate", DateUtils.format(beginDate));
				params.put("beginTime", DateUtils.format(beginDate, "HH:mm"));
			}
			this.notification.notifyTimeline(request, "exercizer." + notificationName, user, recipientSet, idResource, params);
		}
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

	@Get("/subject-scheduled/corrected/download/:id")
	@ApiDoc("Download a corrected.")
	@ResourceFilter(SubjectScheduledCorrected.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void downloadCorrected(final HttpServerRequest request) {
		final String id = request.params().get("id");

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					subjectScheduledService.getCorrectedDownloadInformation(id, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							if (event.isRight()) {
								final JsonObject subjectScheduled = event.right().getValue();
								final String correctedFileId = subjectScheduled.getString("corrected_file_id");

								Date nowUTC = new DateTime(DateTimeZone.UTC).toLocalDateTime().toDate();
								Date correctedDate;
								try {
									correctedDate = DateUtils.parseTimestampWithoutTimezone(subjectScheduled.getString("corrected_date"));
								} catch (ParseException e) {
									log.error("can't parse corrected_date of scheduled subject", e);
									renderError(request);
									return;
								}

								//check download is authorized only if corrected date is passed
								if (DateUtils.lessOrEqualsWithoutTime(correctedDate, nowUTC) || subjectScheduled.getString("owner").equals(user.getUserId())) {
									if (correctedFileId != null) {
										final JsonObject metadata = subjectScheduled.getJsonObject("corrected_metadata");
										storage.sendFile(correctedFileId, metadata.getString("filename"), request, false, metadata);
									} else {
										Renders.badRequest(request);
									}
								} else {
									unauthorized(request);
								}
							} else {
								Renders.badRequest(request);
							}
						}
					});
				}
				else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}

	@Put("/subject-scheduled/remove/corrected/:id")
	@ApiDoc("Removing a corrected file to a subject scheduled.")
	@ResourceFilter(SubjectScheduledOwner.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void removeCorrectedFile(final HttpServerRequest request) {
		final String id = request.params().get("id");
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					request.pause();
					subjectScheduledService.retieve(id, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							request.resume();
							if (event.isRight()) {
								final JsonObject subjectScheduled = event.right().getValue();
								//replace corrected file
								if (subjectScheduled.getString("corrected_file_id") != null) {
									final String existingFileId = subjectScheduled.getString("corrected_file_id");
									request.pause();
									storage.removeFile(existingFileId, new Handler<JsonObject>() {
										@Override
										public void handle(JsonObject event) {
											request.resume();
											if ("error".equals(event.getString("status"))) {
												log.error(event.getString("message"));
												Renders.badRequest(request, event.getString("message"));
											} else {
												subjectScheduledService.removeCorrectedFile(id, defaultResponseHandler(request));
											}
										}
									});
								} else {
									Renders.badRequest(request);
								}
							} else {
								Renders.badRequest(request, event.left().getValue());
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


	@Put("/subject-scheduled/add/corrected/:id")
	@ApiDoc("Adding a corrected file to a subject scheduled.")
	@ResourceFilter(SubjectScheduledOwner.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void addCorrectedFile(final HttpServerRequest request) {
		final String id = request.params().get("id");
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					request.pause();
					subjectScheduledService.retieve(id, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							request.resume();
							if (event.isRight()) {
								final JsonObject subjectScheduled = event.right().getValue();
								final String subjectTitle = subjectScheduled.getString("title");
								final String existingFileId = subjectScheduled.getString("corrected_file_id", "");
								storage.writeUploadFile(request, getAddOrReplaceCorrectedFileHandler(request, id, user, subjectTitle, existingFileId));
							} else {
								Renders.badRequest(request, event.left().getValue());
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

	private Handler<JsonObject> getAddOrReplaceCorrectedFileHandler(final HttpServerRequest request, final String id, final UserInfos user, final String subjectTitle, final String existingFileId) {
		return new Handler<JsonObject>() {
            @Override
            public void handle(JsonObject event) {
                if ("ok".equals(event.getString("status"))) {
                    final String fileId = event.getString("_id");
                    final JsonObject metadata = event.getJsonObject("metadata");
                    subjectScheduledService.addCorrectedFile(id, fileId, metadata, new Handler<Either<String, JsonObject>>() {
	                    @Override
	                    public void handle(Either<String, JsonObject> event) {
		                    if (event.isRight()) {
			                    subjectScheduledService.getMember(id, new Handler<Either<String, JsonArray>>() {
				                    @Override
				                    public void handle(Either<String, JsonArray> event) {
					                    if (event.isRight()) {
						                    Renders.renderJson(request, new fr.wseduc.webutils.collections.JsonObject().put("fileId", fileId));

						                    final JsonArray members = event.right().getValue();
						                    final List<String> recipientSet = new ArrayList<String>();

						                    for (Object member : members) {
							                    if (!(member instanceof JsonObject)) continue;
							                    recipientSet.add(((JsonObject)member).getString("owner"));
						                    }

						                    JsonObject params = new fr.wseduc.webutils.collections.JsonObject();
						                    params.put("uri", pathPrefix + "#/dashboard/student");
						                    params.put("userUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
						                    params.put("username", user.getUsername());
						                    params.put("subjectName", subjectTitle);
						                    params.put("resourceUri", params.getString("uri"));
						                    params.put("pushNotif", PushNotificationUtils.getNotification(request, "correcthomework", params));
						                    notification.notifyTimeline(request, "exercizer.correcthomework", user, recipientSet, id, params);

											if (!StringUtils.isEmpty(existingFileId)) {
												storage.removeFile(existingFileId, new Handler<JsonObject>() {
													@Override
													public void handle(JsonObject event) {
														if ("error".equals(event.getString("status"))) {
															log.warn("Fail to delete file due to : " + event.getString("message"));
														}
													}
												});
											}
					                    } else {
						                    Renders.badRequest(request, event.left().getValue());
					                    }
				                    }
			                    });
		                    } else {
			                    Renders.badRequest(request, event.left().getValue());
		                    }
	                    }
                    });

                } else {
                    Renders.badRequest(request, event.getString("message"));
                }
            }

        };
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

	@Get("/subjects-scheduled-by-subjects-copy/:offset")
	@ApiDoc("Gets subject scheduled list by subject copy list.")
	@SecuredAction("exercizer.subject.scheduled.list.by.subject.copy.list")
	public void listBySubjectCopyList(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					final Integer offset = Integer.parseInt(request.params().get("offset"));
					subjectScheduledService.listBySubjectCopyList(user, new Handler<Either<String, JsonArray>>() {
						@Override
						public void handle(Either<String, JsonArray> event) {
							if(event.isRight()){
								JsonArray subjects = event.right().getValue();
								int hours = offset / 60;
								int minutes = offset % 60;
								final Date nowClient = new DateTime(DateTimeZone.forOffsetHoursMinutes(hours, minutes)).toLocalDateTime().toDate();
								subjects.forEach( s -> {
									JsonObject subject = (JsonObject)s;
									try {
										Date beginDate = DateUtils.parseTimestampWithoutTimezone(subject.getString("begin_date"));
										if(nowClient.before(beginDate))
											subject.put("description", "");
									} catch (ParseException e) {
										log.error("can't parse dates of scheduled subject", e);
										renderError(request);
										return;
									}

								});
								renderJson(request, subjects);
							}else{
								Renders.badRequest(request, event.left().getValue());
							}
						}
					});
				}
				else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}

	@Get("/archive/subjects-scheduled")
	@SecuredAction("exercizer.subject.scheduled.list.archive")
	public void listArchivedSubjects(final HttpServerRequest request){
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if(user != null){
					subjectScheduledService.getArchive(user, arrayResponseHandler(request));
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}

	@Get("/archive/subjects-scheduled/export-csv")
	@ResourceFilter(SubjectsScheduledOwner.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void exportArchiedSubjectScheduled(final HttpServerRequest request){
		final List<String> ids = request.params().getAll("id");

		if (ids == null || ids.isEmpty()) {
			badRequest(request);
			return;
		}

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(UserInfos user) {
				if(user != null){
					subjectScheduledService.getListForExport(user, ids, new Handler<Either<String, JsonArray>>() {
						@Override
						public void handle(Either<String, JsonArray> event) {
							if (event.isLeft()) {
								renderError(request, new fr.wseduc.webutils.collections.JsonObject().put("error", event.left().getValue()));
								return;
							}

							JsonArray r = event.right().getValue();
							r = r == null ? new fr.wseduc.webutils.collections.JsonArray() : r;
							processTemplate(request, "text/export.txt",
									new fr.wseduc.webutils.collections.JsonObject().put("list", r), new Handler<String>() {
										@Override
										public void handle(String export) {
											if (export != null) {
												String filename = "Exercices_et_évaluations_" +
														DateUtils.format(new Date()) + ".csv";
												request.response().putHeader("Content-Type", "application/csv");
												request.response().putHeader("Content-Disposition",
														"attachment; filename=" + filename);
												request.response().end(export);
											} else {
												renderError(request);
											}
										}
									});

						}
					});
				}else{
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}
}
