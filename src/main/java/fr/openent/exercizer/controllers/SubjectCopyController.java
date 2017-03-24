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

import fr.openent.exercizer.filters.*;
import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainCopyService;
import fr.openent.exercizer.services.ISubjectCopyService;
import fr.openent.exercizer.services.ISubjectScheduledService;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.services.impl.GrainCopyServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectCopyServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectScheduledServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.swift.utils.FileUtils;
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
import org.entcore.common.utils.StringUtils;
import org.entcore.common.utils.Zip;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.vertx.java.core.AsyncResult;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.file.FileSystem;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.http.HttpServerResponse;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.io.File;
import java.text.ParseException;
import java.util.*;
import java.util.zip.Deflater;

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

	public SubjectCopyController(final FileSystem fs, final Storage storage, final String exportPath) {
		this.subjectCopyService = new SubjectCopyServiceSqlImpl();
		this.subjectScheduledService = new SubjectScheduledServiceSqlImpl();
		this.subjectService = new SubjectServiceSqlImpl();
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

		SUBMITCOPY(Arrays.asList("id")),
		CORRECTCOPY(Arrays.asList("id", "subject_copy_id", "calculated_score", "final_score", "comment", "is_corrected")),
		ASSIGNCOPY(Arrays.asList("id")),
		REPORTCOPY(Arrays.asList("id", "subject_copy_id", "calculated_score", "final_score", "comment"));

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
				params.putString("uri", container.config().getString("host", "http://localhost:8090") +
						"/exercizer#" + relativeUri);
				params.putString("resourceUri", params.getString("uri"));
			}
	        params.putString("userUri", container.config().getString("host", "http://localhost:8090") +
	                "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
	        params.putString("username", user.getUsername());
	        params.putString("subjectName", subjectName);
			if (dueDate != null) {
				params.putString("dueDate", dueDate);
			}

	        this.notification.notifyTimeline(request,"exercizer." + notificationName, user, recipientSet, idResource, params);
		}

	private Handler<Either<String, JsonObject>> notifyHandler(
			final HttpServerRequest request, final UserInfos user,
			final JsonObject subjectCopy, final CopyAction copyAction) {
		final String subjectCopyId = Long.toString(subjectCopy.getLong("id"));
		final String subjectScheduleId = Long.toString(subjectCopy.getLong("subject_scheduled_id"));
		return new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				if (event.isLeft()) {
					badRequest(request, event.left().getValue());
					return;
				}
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
									case SUBMITCOPY: recipient = subjectSchedule.getString("owner"); url = "/subject/copy/view/"+ subject.getLong("id") +"/"+subjectCopyId; break;
									case CORRECTCOPY: recipient = subjectCopy.getString("owner");  url = "/subject/copy/view/"+ subjectCopyId; break;
									case ASSIGNCOPY: recipient = subjectCopy.getString("owner");  url = "/subject/copy/view/"+ subject.getLong("id") +"/"+subjectCopyId; break;
								}
								sendNotification(request,  copyAction.name().toLowerCase(), user,
										Arrays.asList(recipient),
										url,
										subject.getString("title"),
										null,
										subjectCopyId);
							}
						});
					}
				});
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
							// hack : remove useless fields
							Iterator<String> it = resource.getFieldNames().iterator();
							while (it.hasNext()) {
								String fieldName = it.next();
								if (!copyAction.getFields().contains(fieldName))
									it.remove();
							}
							subjectCopyService.getById(ressourceId, user, new Handler<Either<String, JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> r) {
									if (r.isLeft()) {
										renderError(request, new JsonObject().putString("error", r.left().getValue()));
										return;
									}
									final JsonObject subjectCopy = ResourceParser.beforeAny(r.right().getValue());
									switch (copyAction) {
									case SUBMITCOPY:
										subjectCopyService.submitCopy(resource.getLong("id"),
												notifyHandler(request, user, subjectCopy, CopyAction.SUBMITCOPY)); break;
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
	@ResourceFilter(SubjectCopyOwner.class)
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
	@ResourceFilter(SubjectScheduledOwnerForSubjectCopy.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void reportCopy(final HttpServerRequest request) {
		writeCopy(request, CopyAction.REPORTCOPY);
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
				Arrays.asList("id", "subject_copy_id", "grain_copy_data"),
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
				Iterator<String> it = resource.getFieldNames().iterator();
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

	@Post("/grains-copy")
	@ApiDoc("Gets grain copy list.")
	@SecuredAction("exercizer.grain.copy.list")
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

	@Put("/subject-copy/simple/submit/:id")
	@ApiDoc("Submit a homework file to a subject copy.")
	@ResourceFilter(SubjectCopyAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void submitHomeworkFile(final HttpServerRequest request) {
		final String id = request.params().get("id");
		final ISubjectCopyService.FileType homeworkType = ISubjectCopyService.FileType.HOMEWORK;
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					addOrReplaceFile(request, id, homeworkType, user);
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}

		});
	}

	@Put("/subject-copy/simple/corrected/:id")
	@ApiDoc("Adding a corrected file to a subject copy.")
	@ResourceFilter(SubjectCopyAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void addCorrectedFile(final HttpServerRequest request) {
		final String id = request.params().get("id");
		final ISubjectCopyService.FileType correctedType = ISubjectCopyService.FileType.CORRECTED;
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					addOrReplaceFile(request, id, correctedType, user);
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}

		});
	}

	private void addOrReplaceFile(final HttpServerRequest request, final String id, final ISubjectCopyService.FileType fileType, final UserInfos user) {
		request.pause();
		subjectCopyService.getMetadataOfSubject(id, fileType, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                request.resume();
                if (event.isRight()) {
                    final JsonObject subjectCopy = event.right().getValue();
                    //replace corrected file
	                final String labelFileId = ISubjectCopyService.FileType.CORRECTED.equals(fileType) ? "corrected_file_id" : "homework_file_id";
	                if (subjectCopy.getString(labelFileId) != null) {
                        final String existingFileId = subjectCopy.getString(labelFileId);
                        request.pause();
                        storage.removeFile(existingFileId, new Handler<JsonObject>() {
                            @Override
                            public void handle(JsonObject event) {
                                request.resume();
                                if ("error".equals(event.getString("status"))) {
                                    Renders.badRequest(request, event.getString("message"));
                                } else {
                                    addFile(request, id, fileType, subjectCopy, user);
                                }
                            }
                        });
                    } else {
                        //adding a file
                        addFile(request, id, fileType, subjectCopy, user);
                    }
                } else {
                    Renders.badRequest(request, event.left().getValue());
                }
            }
        });
	}

	private void addFile(final HttpServerRequest request, final String id, final ISubjectCopyService.FileType fileType, final JsonObject subject, final UserInfos user) {
		storage.writeUploadFile(request, new Handler<JsonObject>() {
			@Override
			public void handle(JsonObject event) {
				if ("ok".equals(event.getString("status"))) {
					final String fileId = event.getString("_id");
					final JsonObject metadata = event.getObject("metadata");
					subjectCopyService.addFile(id, fileId, metadata, fileType, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							if (event.isRight()) {
								Renders.renderJson(request, new JsonObject().putString("fileId", fileId));
								JsonObject params = new JsonObject();

								String relativeUri = "";
								String notificationName = "";
								String recipient = "";
								switch (fileType) {
									case CORRECTED: notificationName="correcthomework"; recipient = subject.getString("copy_owner");
										relativeUri = "/subject/copy/perform/simple/"+ id;  break;
									case HOMEWORK: notificationName="submithomework"; recipient = subject.getString("subject_owner");
										relativeUri = "/dashboard/teacher/correction/"+ subject.getLong("subject_scheduled_id"); break;
								}

								final List<String> recipientSet = new ArrayList<String>();
								recipientSet.add(recipient);

								sendNotification(request, notificationName, user, recipientSet, relativeUri, subject.getString("title"), null, id);
							} else {
								Renders.badRequest(request, event.left().getValue());
							}
						}
					});

				} else {
					Renders.badRequest(request, event.getString("message"));
				}
			}

		});
	}

	@Put("/subject-copy/simple/remove/corrected/:id")
	@ApiDoc("Removing a corrected file to a subject copy.")
	@ResourceFilter(SubjectCopyAccess.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void removeCorrectedFile(final HttpServerRequest request) {
		final String id = request.params().get("id");
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					request.pause();
					subjectCopyService.getMetadataOfSubject(id, ISubjectCopyService.FileType.CORRECTED, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							request.resume();
							if (event.isRight()) {
								final JsonObject subjectCopy = event.right().getValue();
								//replace corrected file
								if (subjectCopy.getString("corrected_file_id") != null) {
									final String existingFileId = subjectCopy.getString("corrected_file_id");
									request.pause();
									storage.removeFile(existingFileId, new Handler<JsonObject>() {
										@Override
										public void handle(JsonObject event) {
											request.resume();
											if ("error".equals(event.getString("status"))) {
												log.error(event.getString("message"));
												Renders.badRequest(request, event.getString("message"));
											} else {
												subjectCopyService.removeIndividualCorrectedFile(id, defaultResponseHandler(request));
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

	@Get("/subject-copy/corrected/download/:id")
	@ApiDoc("Download a corrected.")
	@ResourceFilter(SubjectCopyAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void downloadCorrected(final HttpServerRequest request) {
		final String id = request.params().get("id");

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					subjectCopyService.getDownloadInformation(Arrays.asList(new String[]{id}), new Handler<Either<String, JsonArray>>() {
						@Override
						public void handle(Either<String, JsonArray> event) {
							if (event.isRight() && event.right().getValue() != null && event.right().getValue().size() == 1) {
								final JsonObject jo = event.right().getValue().get(0);

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
									final String correctedFileId = jo.getString("corrected_file_id");
									if (correctedFileId != null) {
										final JsonObject metadata = jo.getObject("corrected_metadata");
										storage.sendFile(correctedFileId, metadata.getString("filename"),  request, false, metadata);
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

	@Get("/subject-copy/simple/download/:id")
	@ApiDoc("Download a simple copy.")
	@ResourceFilter(SubjectCopyAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void downloadCopy(final HttpServerRequest request) {
		final String id = request.params().get("id");

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					final List<String> ids = Arrays.asList(new String[]{id});
					subjectCopyService.getDownloadInformation(ids, new Handler<Either<String, JsonArray>>() {
						@Override
						public void handle(Either<String, JsonArray> event) {
							if (event.isRight() && event.right().getValue() != null && event.right().getValue().size() == 1) {
								final JsonObject jo = event.right().getValue().get(0);

								final String fileName = makeDownloadFileName(jo);

								storage.sendFile(jo.getString("homework_file_id"), fileName, request, false, jo.getObject("homework_metadata"), new Handler<AsyncResult<Void>>() {
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

	@Get("/subject-copy/simple/downloads")
	@ApiDoc("Download simple copies.")
	@ResourceFilter(SubjectCopyAccess.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void downloadCopies(final HttpServerRequest request) {

		final List<String> ids =  request.params().getAll("id");

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {

					subjectCopyService.getDownloadInformation(ids, new Handler<Either<String, JsonArray>>() {
						@Override
						public void handle(Either<String, JsonArray> event) {
							if (event.isRight() && event.right().getValue() != null && event.right().getValue().size() > 0) {

								final JsonObject aliasFileName = new JsonObject();
								final List<String> fileIds = new ArrayList<String>();

								String subjectTitle = "";

								for (final Object o : event.right().getValue()) {
									if (!(o instanceof JsonObject)) continue;
									final JsonObject jo = (JsonObject) o;
									final String fileName = FileUtils.getNameWithExtension(makeDownloadFileName(jo), jo.getObject("homework_metadata"));
									aliasFileName.putString(jo.getString("homework_file_id"), fileName);
									fileIds.add(jo.getString("homework_file_id"));
									subjectTitle = jo.getString("title", "file");
								}

								final String zipDownloadName = makeZipFileName(subjectTitle);
								final String zipDirectory = exportPath + File.separator + UUID.randomUUID().toString();

								fs.mkdir(zipDirectory, true, new Handler<AsyncResult<Void>>() {
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
													fs.delete(zipDirectory, true, new Handler<AsyncResult<Void>>() {
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
													fs.delete(zipFile, true, new Handler<AsyncResult<Void>>() {
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

	private String makeDownloadFileName(JsonObject jo) {
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
	@ResourceFilter(SubjectCopyReminder.class)
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

							subjectCopyService.getOwners(param.getArray("ids"), new Handler<Either<String, JsonArray>>() {
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
										message.putString("subject", param.getString("subject"));
										message.putString("body", param.getString("body"));
										message.putArray("to", new JsonArray(to));

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
		jo.putString("action", "send");
		jo.putObject("message", message);
		jo.putString("userId", user.getUserId());
		jo.putString("username", user.getUsername());
		jo.putObject("request", new JsonObject()
						.putObject("headers", new JsonObject()
								.putString("Host", Renders.getHost(request))
								.putString("X-Forwarded-Proto", Renders.getScheme(request))
								.putString("Accept-Language", I18n.acceptLanguage(request))));

		SubjectCopyController.this.eb.send(CONVERSATION_ADDRESS, jo, new Handler<Message<JsonObject>>() {
			@Override
			public void handle(Message<JsonObject> response) {
				if ("ok".equals(response.body().getString("status"))) {
					Renders.created(request);
				} else {
					Renders.badRequest(request);
				}
			}
		});
	}

	@Post("/subject-copy/automatic/reminder/:subjectScheduledId")
	@ApiDoc("send a standard notify reminder.")
	@ResourceFilter(SubjectCopyReminder.class)
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

										subjectCopyService.getOwners(param.getArray("ids"), new Handler<Either<String, JsonArray>>() {
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
}
