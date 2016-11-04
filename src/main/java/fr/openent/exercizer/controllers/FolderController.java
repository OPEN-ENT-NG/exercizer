package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

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
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

public class FolderController extends ControllerHelper {

    private final IFolderService folderService;
    private static final I18n i18n = I18n.getInstance();

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

    @Post("/folders/delete")
    @ApiDoc("Delete folders.")
    @ResourceFilter(MassOwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
    public void remove(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "deleteFolders", new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject resource) {
                            folderService.remove(resource.getArray("sourceFoldersId"), user, new Handler<Either<String, JsonObject>>() {
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
                    RequestUtils.bodyToJson(request, pathPrefix + "duplicateFolders" ,new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject data) {
                            folderService.checkDuplicateFolders(data, new Handler<Boolean>() {
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
                                                    Renders.renderError(request, new JsonObject().putString("error", "exercizer.folder.duplicate.error"));
                                                }
                                            }
                                        });
                                    } else {
                                        Renders.badRequest(request, "exercizer.folder.duplicate.check");
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
