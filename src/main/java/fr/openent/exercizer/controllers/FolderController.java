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

import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.filters.MassOwnerOnly;
import fr.openent.exercizer.services.IFolderService;
import fr.openent.exercizer.services.impl.FolderServiceSqlImpl;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.OwnerOnly;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;

public class FolderController extends ControllerHelper {

    private final IFolderService folderService;
    private static final I18n i18n = I18n.getInstance();

    public FolderController(final ExercizerExplorerPlugin plugin) {
        this.folderService = new FolderServiceSqlImpl(plugin);
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

    @Post("/folders/delete")
    @ApiDoc("Delete folders.")
    @ResourceFilter(MassOwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
    public void remove(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "delete", new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject resource) {
                            folderService.remove(resource.getJsonArray("ids"), user, new Handler<Either<String, JsonObject>>() {
                                @Override
                                public void handle(Either<String, JsonObject> event) {
                                    if (event.isRight()) {
                                        Renders.noContent(request);
                                    } else {
                                        Renders.renderError(request);
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

    @Post("/folders/duplicate")
    @ApiDoc("Duplicate folders.")
    @ResourceFilter(MassOwnerOnly.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void duplicate(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "folders" ,new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject data) {
                            folderService.checkFolders(data, new Handler<Boolean>() {
                                @Override
                                public void handle(Boolean happened) {
                                    if (happened) {
                                        final String folderTitleSuffix = i18n.translate("exercizer.folder.title.copySuffix",
                                                Renders.getHost(request), I18n.acceptLanguage(request));
                                        final String subjectTitleSuffix = i18n.translate("exercizer.subject.title.copySuffix",
                                                Renders.getHost(request), I18n.acceptLanguage(request));

                                        folderService.duplicateFolders(data, folderTitleSuffix, subjectTitleSuffix, user,
                                                new Handler<Either<String, JsonObject>>() {
                                            @Override
                                            public void handle(Either<String, JsonObject> event) {
                                                if (event.isRight()) {
                                                    Renders.created(request);
                                                } else {
                                                    Renders.renderError(request, new JsonObject().put("error", "exercizer.error"));
                                                }
                                            }
                                        });
                                    } else {
                                        Renders.badRequest(request, "exercizer.folder.check");
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

    @Put("/folders/move")
    @ApiDoc("move folders.")
    @ResourceFilter(MassOwnerOnly.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void move(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "folders" ,new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject data) {
                            folderService.checkFolders(data, new Handler<Boolean>() {
                                @Override
                                public void handle(Boolean happened) {
                                    if (happened) {
                                        folderService.move(data,
                                                new Handler<Either<String, JsonObject>>() {
                                                    @Override
                                                    public void handle(Either<String, JsonObject> event) {
                                                        if (event.isRight()) {
                                                            Renders.noContent(request);
                                                        } else {
                                                            Renders.renderError(request, new JsonObject().put("error", "exercizer.error"));
                                                        }
                                                    }
                                                });
                                    } else {
                                        Renders.badRequest(request, "exercizer.folder.check");
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

}
