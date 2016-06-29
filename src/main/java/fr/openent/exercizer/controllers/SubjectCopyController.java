package fr.openent.exercizer.controllers;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;


import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.OwnerOnly;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.filters.TypeSubjectScheduledOwnerOrSubjectCopyOwner;
import fr.openent.exercizer.services.ISubjectCopyService;
import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.impl.SubjectCopyServiceSqlImpl;
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
	
	public SubjectCopyController() {
		this.subjectCopyService = new SubjectCopyServiceSqlImpl();
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
                                            JsonObject subjectCopy = ResourceParser.beforeAny(r.right().getValue());
                                            Long subjectCopyId = subjectCopy.getLong("id");
                                            String subjectCopyId_string = Long.toString(subjectCopyId);
                                            final List<String> recipientSet = new ArrayList<String>();
                                            recipientSet.add(subjectCopy.getString("owner"));
                                            String relativeUri = "/subject/copy/perform/"+subjectCopyId_string;
                                            String message = "";
                                            sendNotification(request, "assigncopy", user, recipientSet, relativeUri, message, subjectCopyId_string);
                                            renderJson(request, r.right().getValue());
                                        } else {

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
        final String message,
        final String idResource
        ) {
        JsonObject params = new JsonObject();
        params.putString("uri", container.config().getString("host", "http://localhost:8090") +
                "/exercizer#" + relativeUri);
        params.putString("username", user.getUsername());
        params.putString("message", message);
        params.putString("resourceUri", params.getString("uri"));
        this.notification.notifyTimeline(request,"exercizer." + notificationName, user, recipientSet, idResource, params);
	}
	
	@Put("/subject-copy")
	@ApiDoc("Updates a subject copy.")
	@ResourceFilter(TypeSubjectScheduledOwnerOrSubjectCopyOwner.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void update(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							subjectCopyService.update(resource, user, notEmptyResponseHandler(request));
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
	
}
