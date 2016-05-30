package fr.openent.exercizer.controllers;

import fr.openent.exercizer.services.IGrainService;
import fr.openent.exercizer.services.impl.GrainServiceSqlImpl;
import fr.wseduc.rs.*;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

public class GrainController extends ControllerHelper {

    private static final String SCHEMA_PERSIST_GRAIN = "createGrain";
    private static final String SCHEMA_UPDATE_GRAIN = "updateGrain";
    private static final String SCHEMA_REMOVE_GRAIN = "removeGrain";
    private static final String SCHEMA_GRAIN_LIST_BY_SUBJECT = "grainListBySubject";

    private final IGrainService grainService;

    public GrainController() {
        this.grainService = new GrainServiceSqlImpl();
    }

    @Post("/grain")
    @ApiDoc("Persist a new grain.")
    @SecuredAction("exercizer.grain.persist")
    public void persist(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_PERSIST_GRAIN, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        grainService.persist(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Put("/grain")
    @ApiDoc("Update a grain.")
    @SecuredAction("exercizer.grain.update")
    public void update(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_UPDATE_GRAIN, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        grainService.update(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Delete("/grain")
    @ApiDoc("Delete (logically) a grain.")
    @SecuredAction("exercizer.grain.remove")
    public void remove(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_REMOVE_GRAIN, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        grainService.remove(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Get("/grains")
    @ApiDoc("Get grain list.")
    @SecuredAction("exercizer.grain.list")
    public void list(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    final List<String> groupsAndUserIds = new ArrayList<>();
                    groupsAndUserIds.add(user.getUserId());
                    if (user.getGroupsIds() != null) {
                        groupsAndUserIds.addAll(user.getGroupsIds());
                    }

                    RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_GRAIN_LIST_BY_SUBJECT, new Handler<JsonObject>() {
                        @Override
                        public void handle(JsonObject resource) {
                            grainService.listBySubject(resource, groupsAndUserIds, user, arrayResponseHandler(request));
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
