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

    private final IGrainService grainService;

    public GrainController() {
        this.grainService = new GrainServiceSqlImpl();
    }

    @Post("/grain")
    @ApiDoc("Persist a new grain.")
    public void persist(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
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
    public void update(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        grainService.update(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Delete("/grain")
    @ApiDoc("Delete a grain.")
    public void remove(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
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
    //@SecuredAction("exercizer.grain.list")
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

                    RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
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
