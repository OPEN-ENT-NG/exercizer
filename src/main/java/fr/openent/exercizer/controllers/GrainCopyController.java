package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.OwnerOnly;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.filters.TypeSubjectScheduledOwnerOrSubjectCopyOwner;
import fr.openent.exercizer.services.IGrainCopyService;
import fr.openent.exercizer.services.impl.GrainCopyServiceSqlImpl;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;

public class GrainCopyController extends ControllerHelper {
	
	private final IGrainCopyService grainCopyService;
	
	public GrainCopyController() {
		this.grainCopyService = new GrainCopyServiceSqlImpl();
	}
	
	@Post("/grain-copy/:id")
    @ApiDoc("Persists a grain copy.")
	@ResourceFilter(OwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
    public void persist(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject resource) {
                            grainCopyService.persist(resource, user, notEmptyResponseHandler(request));
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

    @Put("/grain-copy")
    @ApiDoc("Updates a grain copy.")
    @ResourceFilter(TypeSubjectScheduledOwnerOrSubjectCopyOwner.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
    public void update(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject resource) {
                            grainCopyService.update(resource, user, notEmptyResponseHandler(request));
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

    @Post("/grains-copy")
    @ApiDoc("Gets grain copy list.")
    @SecuredAction("exercizer.grain.copy.list")
    public void list(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject resource) {
                            grainCopyService.list(resource, arrayResponseHandler(request));
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
