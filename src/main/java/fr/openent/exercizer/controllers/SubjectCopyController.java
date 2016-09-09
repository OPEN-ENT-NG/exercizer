package fr.openent.exercizer.controllers;

import java.util.ArrayList;
import java.util.List;

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
	
	public SubjectCopyController() {
		this.subjectCopyService = new SubjectCopyServiceSqlImpl();
		this.subjectScheduledService = new SubjectScheduledServiceSqlImpl();
		this.subjectService = new SubjectServiceSqlImpl();
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
                                                            sendNotification(request, "assigncopy", user, recipientSet, relativeUri, subjectName, subjectScheduleDueDate_readable, subjectCopyId_string);
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
                            final String ressourceId = Long.toString(resource.getLong("id"));
                            final String ressourceSubmittedDate = resource.getString("submitted_date");
							subjectCopyService.getById(ressourceId, user, new Handler<Either<String,JsonObject>>() {
                                @Override
                                public void handle(Either<String, JsonObject> r) {
                                	JsonObject subjectCopy  = ResourceParser.beforeAny(r.right().getValue());
                                    final String subjectCopySubmittedDate = subjectCopy.getString("submitted_date");
                                	if((subjectCopySubmittedDate == null || subjectCopySubmittedDate.isEmpty()) && (ressourceSubmittedDate != null || !ressourceSubmittedDate.isEmpty())){
                                		/** start notification */
                                        final String subjectCopyId = Long.toString(subjectCopy.getLong("id"));
                                        final String subjectScheduleId = Long.toString(subjectCopy.getLong("subject_scheduled_id"));
                                    	subjectScheduledService.getById(subjectScheduleId, user, new Handler<Either<String,JsonObject>>() {
                                            @Override
                                            public void handle(Either<String, JsonObject> r) {
                                            	final JsonObject subjectSchedule  = ResourceParser.beforeAny(r.right().getValue());                                         	
                                            	subjectService.getById(Long.toString(subjectSchedule.getLong("subject_id")), user, new Handler<Either<String,JsonObject>>() {
                                                    @Override
                                                    public void handle(Either<String, JsonObject> r) {
                                                    	JsonObject subject  = ResourceParser.beforeAny(r.right().getValue());
                                                        final String subjectName = subject.getString("title");
                                                        final String subjectId = Long.toString(subject.getLong("id"));                                                           
                                                        final List<String> recipientSet = new ArrayList<String>();
                                                        recipientSet.add(subjectSchedule.getString("owner"));
                                                        String relativeUri = "/subject/copy/view/"+subjectId+"/"+subjectCopyId;
                                                        String message = "";
                                                        sendNotification(request, "submitcopy", user, recipientSet, relativeUri, subjectName, null, subjectCopyId);
                            							subjectCopyService.update(resource, user, notEmptyResponseHandler(request));                              	
                                                    
                                                    }
                                                });
                                            }
                                        });  
                                		
                                	} else {
            							subjectCopyService.update(resource, user, notEmptyResponseHandler(request));                              	

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
