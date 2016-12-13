package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.services.ISubjectLessonTypeService;
import fr.openent.exercizer.services.impl.SubjectLessonTypeServiceSqlImpl;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;

public class SubjectLessonTypeController extends ControllerHelper {
	
	private final ISubjectLessonTypeService subjectLessonTypeService;

    public SubjectLessonTypeController() {
        this.subjectLessonTypeService = new SubjectLessonTypeServiceSqlImpl();
    }

    @Get("/subject-lesson-types")
    @ApiDoc("Gets subject lesson type list.")
    @SecuredAction("exercizer.subject.lesson.type.list")
    public void list(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    subjectLessonTypeService.list(arrayResponseHandler(request));
                }
                else {
                    log.debug("User not found in session.");
                    unauthorized(request);
                }
            }
        });
    }
    
    @Post("/subject-lesson-types-by-subject-ids")
    @ApiDoc("Gets subject lesson type list by subject id list.")
    @SecuredAction("exercizer.subject.lesson.type.list.by.subject.id.list")
    public void listBySubjectId(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                	RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject resources) {
                        	subjectLessonTypeService.listBySubjectIdList(resources, arrayResponseHandler(request));
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
