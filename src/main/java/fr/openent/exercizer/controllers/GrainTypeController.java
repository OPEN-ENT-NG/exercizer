package fr.openent.exercizer.controllers;


import fr.openent.exercizer.services.IGrainTypeService;
import fr.openent.exercizer.services.impl.GrainTypeServiceSqlImpl;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

public class GrainTypeController extends ControllerHelper {

    private final IGrainTypeService grainTypeService;

    public GrainTypeController() {
        this.grainTypeService = new GrainTypeServiceSqlImpl();
    }

    @Get("/grain-types")
    @ApiDoc("Gets grain type list.")
    //@SecuredAction("exercizer.grain.type.list")
    public void list(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    grainTypeService.list(arrayResponseHandler(request));
                }
                else {
                    log.debug("User not found in session.");
                    unauthorized(request);
                }
            }
        });
    }

}
