package fr.openent.exercizer.controllers;

import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainService;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.services.impl.GrainServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.ShareAndOwner;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.*;

public class SubjectController extends ControllerHelper {

	private final ISubjectService subjectService;
	private final IGrainService grainService;

	public SubjectController() {
		this.subjectService = new SubjectServiceSqlImpl();
		this.grainService = new GrainServiceSqlImpl();
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
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
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
                            params.putString("userUri", container.config().getString("host", "http://localhost:8090") +
                                    "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
        			        params.putString("subjectName", subjectName);
                            params.putString("resourceUri", params.getString("uri"));
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

	@Post("/subject/:id/grain")
	@ApiDoc("Persists a grain.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
	public void grainPersist(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							grainService.persist(resource, user, notEmptyResponseHandler(request));
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

	@Put("/subject/:id/grain")
	@ApiDoc("Updates a grain.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
	public void grainUpdate(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							grainService.update(resource, user, defaultResponseHandler(request));
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

	@Delete("/subject/:id/grain/:gId")
	@ApiDoc("Deletes a grain.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
	public void grainremove(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							grainService.remove(resource, user, notEmptyResponseHandler(request));
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

	@Post("/grains/:id")
	@ApiDoc("Gets grain list.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.read", type = ActionType.RESOURCE)
	public void grainList(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							grainService.list(resource, arrayResponseHandler(request));
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

	@Post("/subject-library-grains")
	@ApiDoc("Gets subject library grain list.")
	@SecuredAction("exercizer.subject.library.grain.list")
	public void listBySubjectForLibrary(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							grainService.listBySubjectForLibrary(resource, arrayResponseHandler(request));
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
