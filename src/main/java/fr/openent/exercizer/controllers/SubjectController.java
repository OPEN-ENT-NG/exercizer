package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;

import java.util.ArrayList;
import java.util.List;

public class SubjectController extends ControllerHelper {

    private static final String SCHEMA_PERSIST_SUBJECT = "createSubject";
    private static final String SCHEMA_UPDATE_SUBJECT = "updateSubject";
    private static final String SCHEMA_REMOVE_SUBJECT = "removeSubject";

    private final ISubjectService subjectService;

    public SubjectController() {
        this.subjectService = new SubjectServiceSqlImpl();
    }

    @Post("/subject")
    @ApiDoc("Persist a new subject.")
    @SecuredAction("exercizer.subject.persist")
    public void persist(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_PERSIST_SUBJECT, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                       subjectService.persist(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Put("/subject")
    @ApiDoc("Update a subject.")
    @SecuredAction("exercizer.subject.update")
    public void update(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_UPDATE_SUBJECT, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        subjectService.update(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Delete("/subject")
    @ApiDoc("Delete (logically) a subject.")
    @SecuredAction("exercizer.subject.remove")
    public void remove(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_REMOVE_SUBJECT, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        subjectService.remove(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Get("/subjects")
    @ApiDoc("Get subject list.")
    @SecuredAction("exercizer.subject.list")
    public void list(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    List<String> groupsAndUserIds = new ArrayList<>();
                    groupsAndUserIds.add(user.getUserId());
                    if (user.getGroupsIds() != null) {
                        groupsAndUserIds.addAll(user.getGroupsIds());
                    }

                    subjectService.list(groupsAndUserIds, user, arrayResponseHandler(request));
                }
                else {
                    log.debug("User not found in session.");
                    unauthorized(request);
                }
            }
        });
    }
}
