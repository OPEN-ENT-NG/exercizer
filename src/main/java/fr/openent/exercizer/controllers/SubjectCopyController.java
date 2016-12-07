package fr.openent.exercizer.controllers;

import java.util.*;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;


import fr.openent.exercizer.services.IGrainCopyService;
import fr.openent.exercizer.services.impl.GrainCopyServiceSqlImpl;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.OwnerOnly;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.filters.*;
import fr.openent.exercizer.services.ISubjectCopyService;
import fr.openent.exercizer.services.ISubjectScheduledService;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.impl.SubjectCopyServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectScheduledServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import fr.wseduc.webutils.Either;

public class SubjectCopyController extends ControllerHelper {

	private final ISubjectCopyService subjectCopyService;
	private final ISubjectScheduledService subjectScheduledService;
	private final ISubjectService subjectService;
	private final IGrainCopyService grainCopyService;

	public SubjectCopyController() {
		this.subjectCopyService = new SubjectCopyServiceSqlImpl();
		this.subjectScheduledService = new SubjectScheduledServiceSqlImpl();
		this.subjectService = new SubjectServiceSqlImpl();
		this.grainCopyService = new GrainCopyServiceSqlImpl();
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
                                                            sendNotification(request, CopyAction.ASSIGNCOPY, user, recipientSet, relativeUri, subjectName, subjectScheduleDueDate_readable, subjectCopyId_string);
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
    *   @param copyAction : notification type
    *   @param user : user who send the notification
    *   @param recipientSet : list of student
    *   @param relativeUri: relative url exemple: /subject/copy/perform/9/
    *   @param idResource : id of the resource
    **/

	private void sendNotification(
		    final HttpServerRequest request,
		    final CopyAction copyAction,
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
	        this.notification.notifyTimeline(request,"exercizer." + copyAction.name().toLowerCase(), user, recipientSet, idResource, params);
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
								sendNotification(request, copyAction, user,
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
	@ResourceFilter(SubjectScheduledOwner.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void correctCopy(final HttpServerRequest request) {
		writeCopy(request, CopyAction.CORRECTCOPY);
	}

	@Put("/subject-copy/report")
	@ApiDoc("Report copy final_score and general comment")
	@ResourceFilter(SubjectScheduledOwner.class)
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
	@ResourceFilter(SubjectCopyOwner.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void updateGrain(final HttpServerRequest request) {
		writeGrain(request, grainCopyMode.PERFORM);
	}

	@Put("/grain-copy/correct")
	@ApiDoc("Correct a grain copy.")
	@ResourceFilter(SubjectScheduledOwner.class)
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

}
