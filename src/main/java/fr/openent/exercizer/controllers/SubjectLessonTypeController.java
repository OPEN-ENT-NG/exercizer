package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;

import fr.openent.exercizer.services.ISubjectLessonTypeService;
import fr.openent.exercizer.services.impl.SubjectLessonTypeServiceSqlImpl;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.SecuredAction;

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

}
