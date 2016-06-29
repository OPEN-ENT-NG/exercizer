package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.OwnerOnly;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.services.ISubjectLibraryMainInformationService;
import fr.openent.exercizer.services.impl.SubjectLibraryMainInformationServiceSqlImpl;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;

public class SubjectLibraryMainInformationController extends ControllerHelper {

	private final ISubjectLibraryMainInformationService subjectLibraryMainInformationService;

	public SubjectLibraryMainInformationController() {
		this.subjectLibraryMainInformationService = new SubjectLibraryMainInformationServiceSqlImpl();
	}

	@Post("/subject-library-main-information/:id")
	@ApiDoc("Persists the subject library main information.")
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
							subjectLibraryMainInformationService.persist(resource, user, notEmptyResponseHandler(request));
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
