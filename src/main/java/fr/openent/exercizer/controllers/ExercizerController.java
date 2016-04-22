package fr.openent.exercizer.controllers;

import org.entcore.common.controller.ControllerHelper;
import org.vertx.java.core.http.HttpServerRequest;

import fr.wseduc.rs.*;
import fr.wseduc.security.SecuredAction;

public class ExercizerController extends ControllerHelper {

	@Get("")
	@SecuredAction("exercizer.view")
	public void view(final HttpServerRequest request) {
		renderView(request);
	}

}
