package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;
import fr.openent.exercizer.services.IFolderService;
import fr.openent.exercizer.services.impl.FolderServiceSqlImpl;
import fr.wseduc.rs.*;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.controller.ControllerHelper;
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
    @ApiDoc("Persist a new folder.")
    public void persist(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        folderService.persist(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Put("/folder")
    @ApiDoc("Update a folder.")
    public void update(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        folderService.update(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Delete("/folder")
    @ApiDoc("Delete a folder.")
    public void remove(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        folderService.remove(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Get("/folders")
    @ApiDoc("Get folder list.")
    //@SecuredAction("exercizer.folder.list")
    public void list(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                folderService.list(user, arrayResponseHandler(request));
            }
        });
    }
}
