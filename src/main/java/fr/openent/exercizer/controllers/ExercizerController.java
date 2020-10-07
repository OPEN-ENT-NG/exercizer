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

import fr.openent.exercizer.Exercizer;
import fr.wseduc.security.ActionType;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import io.vertx.core.http.HttpServerRequest;

import fr.wseduc.rs.*;
import fr.wseduc.security.SecuredAction;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.vertx.java.core.http.RouteMatcher;

import java.util.Map;

public class ExercizerController extends ControllerHelper {
    private final EventHelper eventHelper;
    public ExercizerController(){
        final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Exercizer.class.getSimpleName());
        this.eventHelper = new EventHelper(eventStore);
    }
    @Get("")
    @SecuredAction("exercizer.view")
    public void view(final HttpServerRequest request) {
        renderView(request);
        eventHelper.onAccess(request);
    }

    @Get("/now")
    @ApiDoc("Get now UTC from server")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void now(final HttpServerRequest request) {
        Renders.renderJson(request, new JsonObject().put("date", DateTime.now(DateTimeZone.UTC).toString()));
    }

}
