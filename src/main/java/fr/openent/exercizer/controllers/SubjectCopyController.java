package fr.openent.exercizer.controllers;

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
import fr.openent.exercizer.services.impl.SubjectCopyServiceSqlImpl;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;

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
                            subjectCopyService.persist(resource, user, notEmptyResponseHandler(request));
                        }
                    });
                } else {
                    log.debug("User not found in session.");
                    unauthorized(request);
                }

            }
        });
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
