/*
 * Copyright © Région Nord Pas de Calais-Picardie.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;
import fr.openent.exercizer.services.IFolderService;
import fr.openent.exercizer.services.impl.FolderServiceSqlImpl;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.OwnerOnly;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

public class FolderController extends ControllerHelper {

    private final IFolderService folderService;

    public FolderController() {
        this.folderService = new FolderServiceSqlImpl();
    }

    @Post("/folder")
    @ApiDoc("Persists a folder.")
    @SecuredAction("exercizer.folder.persist")
    public void persist(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject resource) {
                            folderService.persist(resource, user, notEmptyResponseHandler(request));
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

    @Put("/folder/:id")
    @ApiDoc("Updates a folder.")
    @ResourceFilter(OwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
    public void update(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject resource) {
                            folderService.update(resource, user, notEmptyResponseHandler(request));
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

    @Delete("/folder/:id")
    @ApiDoc("Deletes a folder.")
    @ResourceFilter(OwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
    public void remove(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject resource) {
                            folderService.remove(resource, user, notEmptyResponseHandler(request));
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

    @Get("/folders")
    @ApiDoc("Gets folder list.")
    @SecuredAction("exercizer.folder.list")
    public void list(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    folderService.list(user, arrayResponseHandler(request));
                }
                else {
                    log.debug("User not found in session.");
                    unauthorized(request);
                }
            }
        });
    }
}
