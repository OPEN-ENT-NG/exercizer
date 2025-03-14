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

import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.filters.*;
import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainCopyService;
import fr.openent.exercizer.services.ISubjectCopyService;
import fr.openent.exercizer.services.ISubjectScheduledService;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.services.ISubjectCopyService.FileType;
import fr.openent.exercizer.services.impl.GrainCopyServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectCopyServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectScheduledServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import fr.openent.exercizer.utils.PushNotificationUtils;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.rs.Delete;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.OwnerOnly;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.entcore.common.utils.DateUtils;
import org.entcore.common.utils.FileUtils;
import org.entcore.common.utils.StringUtils;
import org.entcore.common.utils.Zip;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.eventbus.Message;
import io.vertx.core.file.FileSystem;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.io.File;
import java.text.ParseException;
import java.util.*;
import java.util.zip.Deflater;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.*;

public class SubjectCopyController extends ControllerHelper {

	private final ISubjectCopyService subjectCopyService;
	private final ISubjectScheduledService subjectScheduledService;
	private final ISubjectService subjectService;
	private final IGrainCopyService grainCopyService;
	private final Storage storage;
	private final FileSystem fs;
	private final String exportPath;
	private static final String CONVERSATION_ADDRESS = "org.entcore.conversation";

	public SubjectCopyController(final ExercizerExplorerPlugin plugin, final FileSystem fs, final Storage storage, final String exportPath) {
		this.subjectCopyService = new SubjectCopyServiceSqlImpl();
		this.subjectScheduledService = new SubjectScheduledServiceSqlImpl();
		this.subjectService = new SubjectServiceSqlImpl(plugin);
		this.grainCopyService = new GrainCopyServiceSqlImpl();
		this.storage = storage;
		this.fs = fs;
		this.exportPath = exportPath;
	}

	@Post("/subject-copy/:id")
    @ApiDoc("Persists a subject copy.")
	@ResourceFilter(OwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
    public void persist(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject resource) {
                            subjectCopyService.persist(resource, user, new Handler<Either<String,JsonObject>>() {
                                    @Override
                                    public void handle(Either<String, JsonObject> r) {
                                        if (r.isRight()) {
                                            final JsonObject subjectCopy  = ResourceParser.beforeAny(r.right().getValue());
                                            Long subjectCopyId = subjectCopy.getLong("id");
                                            final String subjectCopyId_string = Long.toString(subjectCopyId);
                                            Long subjectScheduleId = subjectCopy.getLong("subject_scheduled_id");
                                        	String subjectScheduleId_string = Long.toString(subjectScheduleId);

                                        	subjectScheduledService.getById(subjectScheduleId_string, user, new Handler<Either<String,JsonObject>>() {
                                                @Override
                                                public void handle(Either<String, JsonObject> r) {
                                                	JsonObject subjectSchedule  = ResourceParser.beforeAny(r.right().getValue());
                                                    String subjectScheduleDueDate = subjectSchedule.getString("due_date");
                                                    final String subjectScheduleDueDate_readable = subjectScheduleDueDate.substring(8,10) + "/" + subjectScheduleDueDate.substring(5,7) + "/" + subjectScheduleDueDate.substring(0,4);
                                                    Long subjectId = subjectSchedule.getLong("subject_id");
                                                	String subjectId_string = Long.toString(subjectId);

                                                	subjectService.getById(subjectId_string, user, new Handler<Either<String,JsonObject>>() {
                                                        @Override
                                                        public void handle(Either<String, JsonObject> r) {
                                                        	JsonObject subject  = ResourceParser.beforeAny(r.right().getValue());
                                                            final String subjectName = subject.getString("title");

                                                            final List<String> recipientSet = new ArrayList<String>();
                                                            recipientSet.add(subjectCopy.getString("owner"));
                                                            String relativeUri = "/subject/copy/perform/"+subjectCopyId_string;
                                                            String message = "";
                                                            sendNotification(request, CopyAction.ASSIGNCOPY.name().toLowerCase(), user, recipientSet, relativeUri, subjectName, subjectScheduleDueDate_readable, subjectCopyId_string);
                                                            renderJson(request, subjectCopy);

                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }
                            );
                        }
                    });
                } else {
                    log.debug("User not found in session.");
                    unauthorized(request);
                }

            }
        });
    }

	private enum CopyAction  {

		SUBMITCOPY(Arrays.asList("id", "offset")),
		CORRECTCOPY(Arrays.asList("id", "subject_copy_id", "calculated_score", "final_score", "comment", "is_corrected")),
		ASSIGNCOPY(Arrays.asList("id")),
		REPORTCOPY(Arrays.asList("id", "subject_copy_id", "calculated_score", "final_score", "comment", "has_been_started"));

		private final List<String> fields;

		CopyAction(List<String> fields ) {
			this.fields = fields;
		}

		public List<String> getFields() {
			return fields;
		}

	}

    /**
    *   Send a notification in copy controller
    *   @param request : HttpServerRequest client
    *   @param notificationName : template name
    *   @param user : user who send the notification
    *   @param recipientSet : list of student
    *   @param relativeUri: relative url exemple: /subject/copy/perform/9/
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
			if (relativeUri != null) {
				params.put("uri", pathPrefix + "#" + relativeUri);
				params.put("resourceUri", params.getString("uri"));
			}
	        params.put("userUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
	        params.put("username", user.getUsername());
	        params.put("subjectName", subjectName);
			if (dueDate != null) {
				params.put("dueDate", dueDate);
			}
		    params.put("disableAntiFlood", true);
            params.put("pushNotif", PushNotificationUtils.getNotification(request, notificationName, params));
	        this.notification.notifyTimeline(request,"exercizer." + notificationName, user, recipientSet, idResource, params);
		}

	private Handler<Either<String, JsonObject>> notifyHandler(
			final HttpServerRequest request, final UserInfos user,
			final JsonObject subjectCopy, final CopyAction copyAction) {
		final String subjectCopyId = Long.toString(subjectCopy.getLong("id"));
		final String subjectScheduleId = Long.toString(subjectCopy.getLong("subject_scheduled_id"));
		final Boolean isTrainingCopy = subjectCopy.getBoolean("is_training_copy");
		return new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				if (event.isLeft()) {
					badRequest(request, event.left().getValue());
					return;
				}
				if (!isTrainingCopy.booleanValue()) {
					subjectScheduledService.getById(subjectScheduleId, user, new Handler<Either<String,JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> r) {
							final JsonObject subjectSchedule  = ResourceParser.beforeAny(r.right().getValue());
							subjectService.getById(Long.toString(subjectSchedule.getLong("subject_id")), user, new Handler<Either<String,JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> r) {
									final JsonObject subject  = ResourceParser.beforeAny(r.right().getValue());
									String recipient = "";
									String url = "";
									switch (copyAction) {
										case SUBMITCOPY: recipient = subjectSchedule.getString("owner"); url = "/dashboard/teacher/correction/"+ subjectScheduleId; break;
										case CORRECTCOPY: recipient = subjectCopy.getString("owner");  url = "/subject/copy/view/"+ subjectCopyId; break;
										case ASSIGNCOPY: recipient = subjectCopy.getString("owner");  url = "/subject/copy/view/"+ subject.getLong("id") +"/"+subjectCopyId; break;
									}
									sendNotification(request,  copyAction.name().toLowerCase(), user,
											Arrays.asList(recipient),
											url,
											subject.getString("title"),
											null,
											subjectCopyId);
/* WB-728 Why sending another notif here ?
									if( copyAction==CopyAction.SUBMITCOPY && "Student".equalsIgnoreCase(user.getType()) ) {
										url = "/dashboard/teacher/correction/"+ subjectCopy.getLong("subject_scheduled_id");
										String notificationName="submithomework";
										recipient = subjectCopy.getString("subject_owner");
										sendNotification(request, notificationName, user, Arrays.asList(recipient), url, subjectCopy.getString("title"), null, subjectCopyId);
									}
*/
								}
							});
						}
					});
				}
				renderJson(request, event.right().getValue(), 200);
			}
		};
	}

	private void writeCopy(final HttpServerRequest request, final CopyAction copyAction) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							final String ressourceId = Long.toString(resource.getLong("id"));
							final Integer offset = resource.getInteger("offset", 0);
							// hack : remove useless fields
							Iterator<String> it = resource.fieldNames().iterator();
							while (it.hasNext()) {
								String fieldName = it.next();
								if (!copyAction.getFields().contains(fieldName))
									it.remove();
							}
							subjectCopyService.getById(ressourceId, user, new Handler<Either<String, JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> r) {
									if (r.isLeft()) {
										renderError(request, new JsonObject().put("error", r.left().getValue()));
										return;
									}
									final JsonObject subjectCopy = ResourceParser.beforeAny(r.right().getValue());
									switch (copyAction) {
									case SUBMITCOPY:
										if (subjectCopy.getBoolean("is_corrected", false) || subjectCopy.getBoolean("is_correction_on_going", false)) {
											Renders.badRequest(request, "exercizer.check.corrected");
											return;
										} else {
											subjectCopyService.submitCopy(resource.getLong("id"), offset,
													notifyHandler(request, user, subjectCopy, CopyAction.SUBMITCOPY));


											if("Teacher".equalsIgnoreCase(user.getType())) {
												subjectScheduledService.getById(Long.toString(subjectCopy.getLong("subject_scheduled_id")),
														user, r2 -> {
															final JsonObject subjectScheduled = ResourceParser.beforeAny(r2.right().getValue());
															final JsonObject params = new JsonObject()
																	.put("username", user.getUsername())
																	.put("userUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
																	.put("subjectName", subjectScheduled.getString("title"))
																	.put("uri", pathPrefix + "#" + "/dashboard/student")
																	.put("disableAntiFlood", true);
															notification.notifyTimeline(request, "exercizer.considersubmitted", user,
																	Arrays.asList(subjectCopy.getString("owner")), params);
														});
											}
										}
										break;
									case CORRECTCOPY:
										subjectCopyService.update(resource, user,
												notifyHandler(request, user, subjectCopy, CopyAction.CORRECTCOPY)); break;
									case REPORTCOPY:
										subjectCopyService.update(resource, user, notEmptyResponseHandler(request)); break;

									}
								}
							});
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

	@Put("/subject-copy/submit")
	@ApiDoc("Acknowledge copy submission")
	@ResourceFilter(SubjectCopyCorrected.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void submitCopy(final HttpServerRequest request) {
		writeCopy(request, CopyAction.SUBMITCOPY);
	}

	@Put("/subject-copy/correct")
	@ApiDoc("Acknowledge copy correction")
	@ResourceFilter(SubjectScheduledOwnerForSubjectCopy.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void correctCopy(final HttpServerRequest request) {
		writeCopy(request, CopyAction.CORRECTCOPY);
	}

	@Put("/subject-copy/report")
	@ApiDoc("Report copy final_score and general comment")
	@ResourceFilter(SubjectCopyCorrected.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void reportCopy(final HttpServerRequest request) {
		writeCopy(request, CopyAction.REPORTCOPY);
	}

	@Post("/subject-copy/:id/last-grain/:grainCopyId")
	@ResourceFilter(SubjectCopyCorrected.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void setCurrentGrain(final HttpServerRequest request) {
		final String subjectCopyId = request.params().get("id");
		final String grainCopyId = request.params().get("grainCopyId");
		if (!StringUtils.isEmpty(grainCopyId)) {
			subjectCopyService.setCurrentGrain(subjectCopyId, grainCopyId, result -> {
				if (result.isLeft()) {
					renderError(request);
				} else {
					Renders.ok(request);
				}
			});
		}
	}


	@Get("/subject-copy/check/no-corrected/:id")
    @ApiDoc("Check subject copy status.")
	@SecuredAction(value = "check.corrected", type = ActionType.AUTHENTICATED)
    public void checkIsNotCorrected(final HttpServerRequest request) {
		final String subjectCopyId = request.params().get("id");
		if (StringUtils.isEmpty(subjectCopyId)) {
			badRequest(request);
			return;
		}
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
	                subjectCopyService.getById(subjectCopyId, user, new Handler<Either<String, JsonObject>>() {
		                @Override
		                public void handle(Either<String, JsonObject> r) {
			                if (r.isLeft()) {
				                renderError(request, new JsonObject().put("error", r.left().getValue()));
				                return;
			                }
			                final JsonObject subjectCopy = r.right().getValue();
			                final boolean result = !subjectCopy.getBoolean("is_corrected", false) && !subjectCopy.getBoolean("is_correction_on_going", false);
                            Renders.renderJson(request, new JsonObject().put("result", result));
	                    }
                    });
                } else {
                    log.debug("User not found in session.");
                    unauthorized(request);
                }
            }
        });
    }

	@Get("/subjects-copy")
    @ApiDoc("Gets subject copy list.")
	@SecuredAction("exercizer.subject.copy.list")
    public void list(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    subjectCopyService.list(user, arrayResponseHandler(request));
                }
                else {
                    log.debug("User not found in session.");
                    unauthorized(request);
                }
            }
        });
    }

	@Post("/subjects-copy-by-subject-scheduled/:id")
    @ApiDoc("Gets subject copy list by subject scheduled.")
	@ResourceFilter(OwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
    public void listBySubjectSheduled(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                	RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							subjectCopyService.listBySubjectScheduled(resource, arrayResponseHandler(request));
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

    @Get("/subjects-copy-by-subjects-scheduled")
    @ApiDoc("Gets subject copy list by subject scheduled list.")
    @SecuredAction("exercizer.subject.copy.list.by.subject.scheduled.list")
    public void listBySubjectSheduledList(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    subjectCopyService.listBySubjectScheduledList(user, arrayResponseHandler(request));
                }
                else {
                    log.debug("User not found in session.");
                    unauthorized(request);
                }
            }
        });
    }

	public enum grainCopyMode {
		// For student copy completion
		PERFORM(
				Arrays.asList("id", "subject_copy_id", "calculated_score", "grain_copy_data"),
				"has_been_started"
				),
		// For teacher copy correction
		CORRECT(
				Arrays.asList("id", "subject_copy_id", "calculated_score", "final_score", "comment"),
				"is_correction_on_going"
		);

		private final List<String> fields;
		private final String subjectCopyState;

		grainCopyMode(List<String> fields, String subjectCopyState) {
			this.fields = fields;
			this.subjectCopyState =subjectCopyState;
		}

		public List<String> getFields() {
			return fields;
		}

		public String getSubjectCopyState() {
			return subjectCopyState;
		}
	}

	private void writeGrain(final HttpServerRequest request, final grainCopyMode mode) {
		RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
			@Override
			public void handle(final JsonObject resource) {
				// hack : remove useless fields
				Iterator<String> it = resource.fieldNames().iterator();
				while (it.hasNext()) {
					String fieldName = it.next();
					if (!mode.getFields().contains(fieldName))
						it.remove();
				}
				log.debug(resource.encodePrettily());
				if (resource.size() <= 2) {
					badRequest(request);
					return;
				}

				if (grainCopyMode.CORRECT.equals(mode)) {
					grainCopyService.updateAndScore(resource, mode.getSubjectCopyState(), notEmptyResponseHandler(request));
				} else {
					grainCopyService.update(resource, mode.getSubjectCopyState(), notEmptyResponseHandler(request));
				}
			}
		});
	}

	@Put("/grain-copy")
	@ApiDoc("Updates a grain copy.")
	@ResourceFilter(SubjectCopyOwnerForGrain.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void updateGrain(final HttpServerRequest request) {
		writeGrain(request, grainCopyMode.PERFORM);
	}

	@Put("/grain-copy/correct")
	@ApiDoc("Correct a grain copy.")
	@ResourceFilter(SubjectScheduledOwnerForGrainCopy.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void correctGrain(final HttpServerRequest request) {
		writeGrain(request, grainCopyMode.CORRECT);
	}

	@Post("/grains-copy-by-subjects")
	@ApiDoc("ets grain copy list by subjects id")
	@ResourceFilter(SubjectCopiesOwner.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void listGrainsBySubjectIds(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject body) {
							JsonArray subjectIds = body.getJsonArray("ids");
							if (subjectIds == null || subjectIds.size() == 0) {
								badRequest(request);
								return;
							}

							grainCopyService.listBySubjectIds(subjectIds, arrayResponseHandler(request));
						}
					});
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}

	@Post("/grains-copy")
	@ApiDoc("Gets grain copy list.")
	@ResourceFilter(GrainsCopyAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void listGrain(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							grainCopyService.list(resource, arrayResponseHandler(request));
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

	/**
	 * Helper function to retrieve the current UserInfo, if authorized. 
	 * Otherwise, responds to request with HTTP 401 Unauthorized.
	 */
	protected Future<UserInfos> checkAuth(final HttpServerRequest request){
		final Promise<UserInfos> promise = Promise.promise();
		UserUtils.getUserInfos(eb, request, user -> {
            if( user != null ) {
				promise.complete( user );
            } else {
				final String unauthorized = "User not found in session.";
                log.debug( unauthorized );
                unauthorized( request );
				promise.fail( unauthorized );
            }
		});
		return promise.future();
	}

	/**
	 * Helper function to get metadata of a subject.
	 * Responds to request with HTTP BadRequest in case of failure.
	 * @param request
	 * @param id of the subject-copy
	 * @param fileType which metadata is needed
	 * @return see {@link ISubjectCopyService}.getMetadataOfSubject
	 */
	protected Future<JsonObject> getMetadataOfSubject(final HttpServerRequest request, final String id, final ISubjectCopyService.FileType fileType) {
		final Promise<JsonObject> promise = Promise.promise();
		request.pause();
		subjectCopyService.getMetadataOfSubject(id, fileType, event -> {
			request.resume();
			if (event.isRight()) {
				promise.complete( event.right().getValue() );
			} else {
				final String msg = event.left().getValue();
				Renders.badRequest(request, msg);
				promise.fail( msg );
			}
		});
		return promise.future();
	}

	@Get("/subject-copy/:id/files")
	@ResourceFilter(SubjectCopyCorrected.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void listFiles(final HttpServerRequest request){
		checkAuth(request).onSuccess( user -> {
			try {
				final Long subjectCopyId = Long.parseLong( request.params().get("id") );
				subjectCopyService.listFiles(subjectCopyId, arrayResponseHandler(request));
			} catch( Exception e ) {
				badRequest(request);
			}
		});
	}

	@Put("/subject-copy/:id/homework")
	@ApiDoc("Add a homework file to a subject copy.")
	@ResourceFilter(SubjectCopyLearnerAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void addHomeworkFile(final HttpServerRequest request) {
		final String id = request.params().get("id");
		try {
			checkAuth(request).onSuccess( user -> {
				addFile(request, id, ISubjectCopyService.FileType.HOMEWORK, user);
			});
		} catch (Exception e) {
			badRequest(request);
		}
	}

	@Put("/subject-copy/:id/corrected")
	@ApiDoc("Adding a corrected file to a subject copy.")
	@ResourceFilter(SubjectCopyAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void addCorrectedFile(final HttpServerRequest request) {
		final String id = request.params().get("id");
		try {
			checkAuth(request).onSuccess( user -> {
				addFile(request, id, ISubjectCopyService.FileType.CORRECTED, user);
			});
		} catch (Exception e) {
			badRequest(request);
		}
	}

	private void addFile(final HttpServerRequest request, final String id, final ISubjectCopyService.FileType fileType, final UserInfos user) {
		getMetadataOfSubject(request, id, fileType).onSuccess( subjectCopy -> {
			storage.writeUploadFile(request, writeRes -> {
				if ("ok".equals(writeRes.getString("status"))) {
					final String fileId = writeRes.getString("_id");
					final JsonObject metadata = writeRes.getJsonObject("metadata");
					subjectCopyService.addFile(id, fileId, metadata, fileType, event-> {
						if (event.isRight()) {
							Renders.renderJson( request, new JsonObject()
								.put("file_id", fileId)
								.put("metadata", metadata)
							);
							if( fileType == FileType.CORRECTED ) {
								String relativeUri = "/subject/copy/perform/simple/"+ id;
								String notificationName="correcthomework";
								String recipient = subjectCopy.getString("copy_owner");
								sendNotification(request, notificationName, user, Arrays.asList(recipient), relativeUri, subjectCopy.getString("title"), null, id);
							}
						} else {
							Renders.badRequest(request, event.left().getValue());
						}
					});
				} else {
					Renders.badRequest(request, writeRes.getString("message"));
				}
			});
        });
	}

	@Delete("/subject-copy/:id/homework/:fileId")
	@ApiDoc("Delete a homework file from a subject copy.")
	@ResourceFilter(SubjectCopyLearnerAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void removeHomeworkFile(final HttpServerRequest request) {
		try {
			final Long id = Long.parseLong( request.params().get("id") );
			final String fileId = request.params().get("fileId");
			checkAuth(request).onSuccess( user -> {
				deleteFile(request, id, fileId, ISubjectCopyService.FileType.HOMEWORK, user);
			});
		} catch (Exception e) {
			badRequest(request);
		}
	}

	@Delete("/subject-copy/:id/corrected/:fileId")
	@ApiDoc("Remove a corrected file from a subject copy.")
	@ResourceFilter(SubjectCopyAccess.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void removeCorrectedFile(final HttpServerRequest request) {
		try {
			final Long id = Long.parseLong( request.params().get("id") );
			final String fileId = request.params().get("fileId");
			checkAuth(request).onSuccess( user -> {
				deleteFile(request, id, fileId, ISubjectCopyService.FileType.CORRECTED, user);
			});
		} catch (Exception e) {
			badRequest(request);
		}
	}

	/** 
	 * Delete an existing file from DB then storage.
	 * Update the copy correction status afterwards.
	 */
	private void deleteFile(final HttpServerRequest request, final Long id, final String fileId, final ISubjectCopyService.FileType fileType, final UserInfos user) {
		request.pause();
		storage.removeFile(fileId, event -> {
			request.resume();
			if ("error".equals(event.getString("status"))) {
				log.error(event.getString("message"));
				Renders.badRequest(request, event.getString("message"));
			} else {
				subjectCopyService.deleteFile(id, fileId, result -> {
					if( result.isRight() ) {
						subjectCopyService.removeIndividualCorrectedFile(id, result2 -> {
							// result2 being left or right, we cannot rollback => render the deleted subject copy.
							Renders.renderJson( request, result.right().getValue() );
						});
					} else {
						Renders.badRequest(request, result.left().getValue() );
					}
				});				
			}
		});
	}

	@Get("/subject-copy/:id/corrected/:fileId")
	@ApiDoc("Download a corrected.")
	@ResourceFilter(SubjectCopyCorrected.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void downloadCorrected(final HttpServerRequest request) {
		final String id = request.params().get("id");
		final String fileId = request.params().get("fileId");
		if( id==null ||id.isEmpty() || fileId==null || fileId.isEmpty() ) {
			Renders.badRequest(request);
			return;
		}

		checkAuth(request).onSuccess( user -> {
			subjectCopyService.getDownloadInformation(Arrays.asList(new String[]{id}), event -> {
				if (event.isRight() && event.right().getValue() != null && event.right().getValue().size() == 1) {
					final JsonObject jo = event.right().getValue().getJsonObject(0);
					final JsonArray files = jo.getJsonArray("files");
					if( files==null || files.isEmpty() ) {
						notFound(request);
						return;
					}

					JsonObject fo = null;
					for( Object o : files ) {
						if (!(o instanceof JsonObject)) continue;
						fo = (JsonObject) o;
						if( fileId.equals( fo.getString("file_id") ) 
								&& ISubjectCopyService.FileType.CORRECTED.getKey().equals( fo.getString("file_type") ) ) {
							break; // found
						} else {
							fo = null;
						}
					}
					if( fo==null ) {
						notFound(request);
						return;
					}

					final Date nowUtc = new DateTime(DateTimeZone.UTC).toLocalDateTime().toDate();
					Date correctedDate;
					try {
						correctedDate = DateUtils.parseTimestampWithoutTimezone(jo.getString("corrected_date"));
					} catch (ParseException e) {
						log.error("can't parse corrected_date of scheduled subject", e);
						renderError(request);
						return;
					}

					//check download is authorized only if corrected date is passed
					if (DateUtils.lessOrEqualsWithoutTime(correctedDate, nowUtc)) {
						final JsonObject metadata = fo.getJsonObject("metadata");
						storage.sendFile(fileId, metadata.getString("filename"),  request, false, metadata);
					} else {
						unauthorized(request);
					}
				} else {
					Renders.badRequest(request);
				}
			});
		});
	}

	@Get("/subject-copy/:id/homework/:fileId")
	@ApiDoc("Download a simple copy.")
	@ResourceFilter(SubjectCopyAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void downloadCopy(final HttpServerRequest request) {
		final String id = request.params().get("id");
		final String fileId = request.params().get("fileId");

		checkAuth(request).onSuccess( user -> {
			final List<String> ids = Arrays.asList(new String[]{id});
			subjectCopyService.getDownloadInformation(ids, event -> {
				if (event.isRight() && event.right().getValue() != null && event.right().getValue().size() == 1) {
					final JsonObject jo = event.right().getValue().getJsonObject(0);
					final JsonArray files = jo.getJsonArray("files");
					if( files==null || files.isEmpty() ) {
						notFound(request);
						return;
					}

					JsonObject fo = null;
					for( Object o : files ) {
						if (!(o instanceof JsonObject)) continue;
						fo = (JsonObject) o;
						if( fileId.equals( fo.getString("file_id") ) 
								&& ISubjectCopyService.FileType.HOMEWORK.getKey().equals( fo.getString("file_type") ) ) {
							break; // found
						} else {
							fo = null;
						}
					}
					if( fo==null ) {
						notFound(request);
						return;
					}

					final String fileName = makeDownloadFileName(jo, fo);

					storage.sendFile(fileId, fileName, request, false, fo.getJsonObject("metadata"), new Handler<AsyncResult<Void>>() {
						@Override
						public void handle(AsyncResult<Void> event) {
							if (event.succeeded()) {
								subjectCopyService.correctedInProgress(ids, new Handler<Either<String, JsonObject>>() {
									@Override
									public void handle(Either<String, JsonObject> event) {
										if (event.isLeft()) {
											log.error("Error can't update subject copy state to in progress (is_correction_on_going) : " + event.left().getValue());
										}
									}
								});
							}
						}
					});
				} else {
					Renders.badRequest(request);
				}
			});
		});
	}

	@Get("/subject-copy/:id/mine/:fileId")
	@ApiDoc("Download my simple copy.")
	@ResourceFilter(SubjectCopyLearnerAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void downloadMineCopy(final HttpServerRequest request) {
		final String id = request.params().get("id");
		final String fileId = request.params().get("fileId");
		checkAuth(request).onSuccess( user -> {
			final List<String> ids = Arrays.asList(new String[]{id});
			subjectCopyService.getDownloadInformation(ids, event -> {
				if (event.isRight() && event.right().getValue() != null && event.right().getValue().size() == 1) {
					final JsonObject jo = event.right().getValue().getJsonObject(0);
					final JsonArray files = jo.getJsonArray("files");
					if( files==null || files.isEmpty() ) {
						notFound(request);
						return;
					}

					JsonObject fo = null;
					for( Object o : files ) {
						if (!(o instanceof JsonObject)) continue;
						fo = (JsonObject) o;
						if( fileId.equals( fo.getString("file_id") ) 
								&& ISubjectCopyService.FileType.HOMEWORK.getKey().equals( fo.getString("file_type") ) ) {
							break; // found
						} else {
							fo = null;
						}
					}
					if( fo==null ) {
						notFound(request);
						return;
					}

					final String fileName = makeDownloadFileName(jo, fo);
					storage.sendFile(fileId, fileName, request, false, fo.getJsonObject("metadata"));
				} else {
					Renders.badRequest(request);
				}
			});
		});
	}

	@Get("/subject-copy/simple/downloads")
	@ApiDoc("Download simple copies.")
	@ResourceFilter(SubjectCopyAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void downloadCopies(final HttpServerRequest request) {

		final List<String> ids =  request.params().getAll("id");

		checkAuth(request).onSuccess( user -> {
			subjectCopyService.getDownloadInformation(ids, event-> {
				final JsonArray infos = event.isRight() ? event.right().getValue() : null;
				if (infos != null && infos.size() > 0) {
					final JsonObject aliasFileName = new JsonObject();
					final List<String> fileIds = new ArrayList<String>();

					String subjectTitle = "";

					for (final Object o : infos) {
						if (!(o instanceof JsonObject)) continue;
						final JsonObject jo = (JsonObject) o;
						final JsonArray joFiles = jo.getJsonArray("files", null);
						if( joFiles==null || joFiles.isEmpty() )  continue;

						for( final Object f : joFiles ) {
							if (!(f instanceof JsonObject)) continue;
							final JsonObject fo = (JsonObject) f;
							final String fileId = fo.getString("file_id");
							final String fileName = FileUtils.getNameWithExtension(makeDownloadFileName(jo, fo), fo.getJsonObject("metadata"));
							if( fileId!=null && !fileId.isEmpty() && !aliasFileName.containsKey(fileId) ) {
								final int count = (aliasFileName.size()+1);
								aliasFileName.put(fileId, count + "_" + fileName);
								fileIds.add( fileId );
								subjectTitle = jo.getString("title", "file");
							}
						}
					}

					if( fileIds.isEmpty() ) {
						notFound(request);
						return;
					}

					final String zipDownloadName = makeZipFileName(subjectTitle);
					final String zipDirectory = exportPath + File.separator + UUID.randomUUID().toString();

					fs.mkdirs(zipDirectory, new Handler<AsyncResult<Void>>() {
						@Override
						public void handle(AsyncResult<Void> event) {
							if (event.succeeded()) {
								final String zipFile = zipDirectory + ".zip";

								storage.writeToFileSystem(fileIds.toArray(new String[0]), zipDirectory, aliasFileName, new Handler<JsonObject>() {
									@Override
									public void handle(JsonObject event) {
										if (!"ok".equals(event.getString("status"))) {
											log.error("Can't write to zip directory : " + event.getString("message"));
											deleteZipDirectory();
										} else {
											zipDirectory();
										}
									}

									private void zipDirectory() {
										Zip.getInstance().zipFolder(zipDirectory, zipFile, true,
												Deflater.NO_COMPRESSION, new Handler<Message<JsonObject>>() {
													@Override
													public void handle(final Message<JsonObject> event) {
														if (!"ok".equals(event.body().getString("status"))) {
															log.error("Zip export " + zipDirectory + " error : " +
																	event.body().getString("message"));
															deleteZipDirectory();
														} else {

															final HttpServerResponse resp = request.response();
															resp.putHeader("Content-Disposition", "attachment; filename=\"" + zipDownloadName + "\"");
															resp.putHeader("Content-Type", "application/zip; name=\"\" + zipDownloadName + \"\"");

															resp.sendFile(zipFile, new Handler<AsyncResult<Void>>() {
																@Override
																public void handle(AsyncResult<Void> event) {
																	deleteZipFile();

																	if (event.succeeded()) {
																		subjectCopyService.correctedInProgress(ids, new Handler<Either<String, JsonObject>>() {
																			@Override
																			public void handle(Either<String, JsonObject> event) {
																				if (event.isLeft()) {
																					log.error("Error can't update subject copy state to in progress (is_correction_on_going) : " + event.left().getValue());
																				}
																			}
																		});
																	} else {
																		log.error("Error can't send  the file: ", event.cause());
																	}
																}
															});
														}
													}
												});
									}

									private void deleteZipDirectory() {
										fs.deleteRecursive(zipDirectory, true, new Handler<AsyncResult<Void>>() {
											@Override
											public void handle(AsyncResult<Void> event) {
												if (event.failed()) {
													log.error("Error deleting directory : " + zipDirectory, event.cause());
												}
											}
										});
										Renders.badRequest(request);
									}

									private void deleteZipFile() {
										fs.deleteRecursive(zipFile, true, new Handler<AsyncResult<Void>>() {
											@Override
											public void handle(AsyncResult<Void> event) {
												if (event.failed()) {
													log.error("Error deleting zip file : " + zipFile, event.cause());
												}
											}
										});
									}
								});
							} else {
								log.error("Can't create zip directory.", event.cause());
								badRequest(request);
							}

						}
					});
				} else {
					Renders.badRequest(request);
				}
			});
		});
	}

	private String makeDownloadFileName(JsonObject jo, JsonObject fo) {
		final String title = makeDownloadTitle(jo.getString("title", ""));

		final String username = StringUtils.stripAccents(jo.getString("owner_username","")
				.replaceAll("(?!-)\\p{Punct}","").replaceAll("\\s", "-"));

		return title + "-" + username;
	}

	private String makeDownloadTitle(final String subjectTitle) {
		String title = StringUtils.stripSpaces(subjectTitle).replaceAll("\\p{Punct}","");
		if (title.length() > 20) {
			title = title.substring(0, 21);
		}

		return StringUtils.stripAccents(title);
	}

	private String makeZipFileName(final String subjectTitle) {
		return makeDownloadTitle(subjectTitle) + ".zip";
	}

	@Post("/subject-copy/custom/reminder")
	@ApiDoc("send custom mail reminder.")
	@ResourceFilter(SubjectCopiesOwner.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void customReminder(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "reminder", new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject param) {
							if (param.getString("subject") == null || param.getString("body") == null) {
								badRequest(request);
								return;
							}

							subjectCopyService.getOwners(param.getJsonArray("ids"), new Handler<Either<String, JsonArray>>() {
								@Override
								public void handle(Either<String, JsonArray> event) {
									if (event.isRight()) {
										final JsonArray owners = event.right().getValue();
										final List<String> to = new ArrayList<String>();
										for (Object owner : owners) {
											if (!(owner instanceof JsonObject)) continue;
											to.add(((JsonObject)owner).getString("owner"));
										}

										final JsonObject message = new JsonObject();
										message.put("subject", param.getString("subject"));
										message.put("body", param.getString("body"));
										message.put("to", new JsonArray(to));

										sendMail(message, user, request);
									} else {
										renderError(request);
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


	private void sendMail(JsonObject message, UserInfos user, final HttpServerRequest request) {
		JsonObject jo = new JsonObject();
		jo.put("action", "send");
		jo.put("message", message);
		jo.put("userId", user.getUserId());
		jo.put("username", user.getUsername());
		jo.put("request", new JsonObject()
						.put("headers", new JsonObject()
								.put("Host", Renders.getHost(request))
								.put("X-Forwarded-Proto", Renders.getScheme(request))
								.put("Accept-Language", I18n.acceptLanguage(request))));

		SubjectCopyController.this.eb.request(CONVERSATION_ADDRESS, jo, handlerToAsyncHandler(new Handler<Message<JsonObject>>() {
			@Override
			public void handle(Message<JsonObject> response) {
				if ("ok".equals(response.body().getString("status"))) {
					Renders.created(request);
				} else {
					Renders.badRequest(request);
				}
			}
		}));
	}

	@Post("/subject-copy/automatic/reminder/:subjectScheduledId")
	@ApiDoc("send a standard notify reminder.")
	@ResourceFilter(SubjectCopiesOwner.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void automaticReminder(final HttpServerRequest request) {
		final String subjectScheduledId = request.params().get("subjectScheduledId");

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "reminder", new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject param) {
							subjectScheduledService.retieve(subjectScheduledId, new Handler<Either<String, JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> event) {
									if (event.isRight()) {
										final JsonObject subject = event.right().getValue();
										final String subjectName = subject.getString("title");

										subjectCopyService.getOwners(param.getJsonArray("ids"), new Handler<Either<String, JsonArray>>() {
											@Override
											public void handle(Either<String, JsonArray> event) {
												if (event.isRight()) {
													final JsonArray owners = event.right().getValue();
													final List<String> recipent = new ArrayList<String>();
													for (Object owner : owners) {
														if (!(owner instanceof JsonObject)) continue;
														recipent.add(((JsonObject)owner).getString("owner"));
													}

													Date dueDate;
													try {
														dueDate = DateUtils.parseTimestampWithoutTimezone(subject.getString("due_date"));
													} catch (ParseException e) {
														log.error("can't parse dueDate of scheduled subject", e);
														renderError(request);
														return;
													}

													sendNotification(request, "homeworkreminder", user, recipent, "/dashboard/student",
															subjectName, DateUtils.format(dueDate), subjectScheduledId);
													Renders.created(request);
												} else {
													renderError(request);
												}
											}
										});
									} else {
										renderError(request);
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

	@Post("/subject-copy/action/exclude")
	@ApiDoc("Exclude copies.")
	@ResourceFilter(SubjectCopiesOwner.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void exclude(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject param) {
							if (param.getJsonArray("ids") == null || param.getJsonArray("ids").size() == 0) {
								badRequest(request);
								return;
							}
							subjectCopyService.exclude(param.getJsonArray("ids"), arrayResponseHandler(request));
						}
					});
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}

	@Get("/archive/subjects-copy-by-subjects-scheduled")
	@ResourceFilter(SubjectsScheduledOwner.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void listArchivedCopy(final HttpServerRequest request) {
		final List<String> ids = request.params().getAll("id");
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					subjectCopyService.getArchive(ids, arrayResponseHandler(request));
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}
}
