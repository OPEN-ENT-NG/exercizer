package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;

import fr.openent.exercizer.services.ISubjectLessonLevelService;
import fr.openent.exercizer.services.impl.SubjectLessonLevelServiceSqlImpl;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.SecuredAction;

public class SubjectLessonLevelController extends ControllerHelper {
	
	private final ISubjectLessonLevelService subjectLessonLevelService;

    public SubjectLessonLevelController() {
        this.subjectLessonLevelService = new SubjectLessonLevelServiceSqlImpl();
    }

    @Get("/subject-lesson-levels")
    @ApiDoc("Gets subject lesson level list.")
    @SecuredAction("exercizer.subject.lesson.level.list")
    public void list(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                	subjectLessonLevelService.list(arrayResponseHandler(request));
                }
                else {
                    log.debug("User not found in session.");
                    unauthorized(request);
                }
            }
        });
    }

}
