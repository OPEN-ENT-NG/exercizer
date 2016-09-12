package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.ShareAndOwner;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.webutils.request.RequestUtils;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.openent.exercizer.parsers.ResourceParser;


import java.util.ArrayList;
import java.util.List;

public class SubjectController extends ControllerHelper {

	private final ISubjectService subjectService;

	public SubjectController() {
		this.subjectService = new SubjectServiceSqlImpl();
	}

    @Post("/canSchedule")
    @SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
    public void canSchedule(final HttpServerRequest request) {
    }

	@Post("/subject")
	@ApiDoc("Persists a subject.")
	@SecuredAction("exercizer.subject.persist")
	public void persist(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							subjectService.persist(resource, user, notEmptyResponseHandler(request));
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

	@Put("/subject/:id")
	@ApiDoc("Updates a subject.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.manager", type = ActionType.RESOURCE)
	public void update(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							subjectService.update(resource, user, notEmptyResponseHandler(request));
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

	@Delete("/subject/:id")
	@ApiDoc("Deletes (logically) a subject.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.manager", type = ActionType.RESOURCE)
	public void remove(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							subjectService.remove(resource, user, notEmptyResponseHandler(request));
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

	@Get("/subjects")
	@ApiDoc("Gets subject list which are not deleted.")
	@SecuredAction("exercizer.subject.list")
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

					subjectService.list(groupsAndUserIds, user, arrayResponseHandler(request));
				}
				else {
					log.debug("User not found in session.");
					unauthorized(request);
				}

			}
		});
	}
	
	@Get("/subjects-all")
	@ApiDoc("Gets all subject list.")
	@SecuredAction("exercizer.subject.list.all")
	public void listAll(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					final List<String> groupsAndUserIds = new ArrayList<>();
					groupsAndUserIds.add(user.getUserId());
					if (user.getGroupsIds() != null) {
						groupsAndUserIds.addAll(user.getGroupsIds());
					}

					subjectService.listAll(groupsAndUserIds, user, arrayResponseHandler(request));
				}
				else {
					log.debug("User not found in session.");
					unauthorized(request);
				}

			}
		});
	}
	
	@Post("/subjects-for-library")
	@ApiDoc("Gets subject list for library.")
	@SecuredAction("exercizer.subject.list.for.library")
	public void listLibrarySubject(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject searchData) {
							subjectService.listLibrarySubject(searchData, arrayResponseHandler(request));
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
	
	@Post("/count-subjects-for-library")
	@ApiDoc("Counts subject list for library.")
	@SecuredAction("exercizer.subject.count.for.library")
	public void countLibrarySubject(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject searchData) {
							subjectService.countLibrarySubject(searchData, notEmptyResponseHandler(request));
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

	@Get("/subject/share/json/:id")
	@ApiDoc("Lists rights for a given subject.")
	@SecuredAction(value = "", type = ActionType.AUTHENTICATED)
	public void share(final HttpServerRequest request) {
		super.shareJson(request, false);
	}

	@Put("/subject/share/json/:id")
	@ApiDoc("Adds rights for a given subject.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.manager", type = ActionType.RESOURCE)
	public void shareSubmit(final HttpServerRequest request) {

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					request.pause();
					final String subjectId = request.params().get("id");
                	subjectService.getById(subjectId, user, new Handler<Either<String,JsonObject>>() {
                        @Override
                        public void handle(Either<String, JsonObject> r) {
                        	request.resume();
                        	JsonObject subject  = ResourceParser.beforeAny(r.right().getValue());
                            final String subjectName = subject.getString("title");  

        			        JsonObject params = new JsonObject();
        			        params.putString("username", user.getUsername());
        			        params.putString("uri", container.config().getString("host", "http://localhost:8090") +
        			                "/exercizer#/subject/copy/preview/perform/"+subjectId);
        			        params.putString("subjectName", subjectName);
        			        SubjectController.super.shareJsonSubmit(request, "exercizer.share", false, params, null);
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

	@Put("/subject/share/remove/:id")
	@ApiDoc("Removes rights for a given subject.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.manager", type = ActionType.RESOURCE)
	public void shareRemove(final HttpServerRequest request) {
		super.removeShare(request, false);
	}
}
