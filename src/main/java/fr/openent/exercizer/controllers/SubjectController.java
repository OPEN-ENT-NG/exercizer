package fr.openent.exercizer.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;
import static org.entcore.common.user.UserUtils.getUserInfos;

import fr.openent.exercizer.Exercizer;
import fr.openent.exercizer.services.SubjectService;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.request.RequestUtils;

public class SubjectController extends ControllerHelper {

    private static final String SUBJECT_ID_PARAMETER = "id";
    private static final String SCHEMA_SUBJECT_CREATE = "createSubject";
    private static final String SCHEMA_SUBJECT_UPDATE = "updateSubject";

    private static final String RESOURCE_NAME = "subject";


    private final SubjectService subjectService;

    public SubjectController(String collection) {
        this.subjectService = new SubjectServiceSqlImpl();
    }

    @Get("/subjects")
    @ApiDoc("Get subject by id.")
    @SecuredAction("exercizer.subject.list")
    public void listSubject(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                subjectService.list(user, arrayResponseHandler(request));
            }
        });
    }

    @Post("/subject")
    @ApiDoc("Create a new Ssubject.")
    @SecuredAction("exercizer.subject.create")
    public void createSubject(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                // ? pathPrefix ?
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_SUBJECT_CREATE, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        // ? crud ?
                        crudService.create(resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Get("/subject/:" + Exercizer.SUBJECT_RESOURCE_ID)
    @ApiDoc("Get Subject by id.")
    @SecuredAction("exercizer.subject.contrib")
    public void getSubject(final HttpServerRequest request) {
        final String subjectId = request.params().get(Exercizer.SUBJECT_RESOURCE_ID);
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                subjectService.retrieve(subjectId, user, notEmptyResponseHandler(request));
            }
        });
    }

    @Put("/subject/:" + Exercizer.SUBJECT_RESOURCE_ID)
    @ApiDoc("Update subject by id.")
    @SecuredAction("exercizer.subject.manager")
    public void updateSubject(final HttpServerRequest request) {
        final String subjectId = request.params().get(Exercizer.SUBJECT_RESOURCE_ID);
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_SUBJECT_UPDATE, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        crudService.update(subjectId, resource, user, notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Delete("/subject/:" + Exercizer.SUBJECT_RESOURCE_ID)
    @ApiDoc("Delete subject by id.")
    @SecuredAction("exercizer.subject.manager")
    public void deleteSubject(final HttpServerRequest request) {
        final String subjectId = request.params().get(Exercizer.SUBJECT_RESOURCE_ID);
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                crudService.delete(subjectId, user, notEmptyResponseHandler(request));
            }
        });
    }

    @Get("/subject/share/json/:" + SUBJECT_ID_PARAMETER)
    @ApiDoc("Share subject by id.")
    @SecuredAction("exercizer.subject.manager")
    public void shareSubject(final HttpServerRequest request) {
        final String id = request.params().get(SUBJECT_ID_PARAMETER);
        if (id == null || id.trim().isEmpty()) {
            badRequest(request);
            return;
        }
        getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    shareService.shareInfos(user.getUserId(), id, I18n.acceptLanguage(request), new Handler<Either<String, JsonObject>>() {
                        @Override
                        public void handle(Either<String, JsonObject> event) {
                            final Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);
                            if (event.isRight()) {
                                JsonObject result = event.right().getValue();
                                if (result.containsField("actions")) {
                                    JsonArray actions = result.getArray("actions");
                                    JsonArray newActions = new JsonArray();
                                    for (Object action : actions) {
                                        if (((JsonObject) action).containsField("displayName")) {
                                            String displayName = ((JsonObject) action).getString("displayName");
                                            if (displayName.contains(".")) {
                                                String resource = displayName.split("\\.")[0];
                                                if (resource.equals(RESOURCE_NAME)) {
                                                    newActions.add(action);
                                                }
                                            }
                                        }
                                    }
                                    result.putArray("actions", newActions);
                                }
                                handler.handle(new Either.Right<String, JsonObject>(result));
                            } else {
                                handler.handle(new Either.Left<String, JsonObject>("Error finding shared resource."));
                            }
                        }
                    });

                } else {
                    unauthorized(request);
                }
            }
        });
    }

    @Put("/subject/share/json/:" + SUBJECT_ID_PARAMETER)
    @ApiDoc("Share subject by id.")
    @SecuredAction("exercizer.subject.manager")
    public void shareSubjectSubmit(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    final String subjectId = request.params().get(SUBJECT_ID_PARAMETER);
                    if (subjectId == null || subjectId.trim().isEmpty()) {
                        badRequest(request);
                        return;
                    }
                    JsonObject params = new JsonObject()
                            .putString("profilUri", container.config().getString("host", "http://localhost:8090") +
                                    "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
                            .putString("username", user.getUsername())
                            .putString("resourceUri", container.config().getString("host", "http://localhost:8090") +
                                    pathPrefix + "#/default");

                    shareJsonSubmit(request, "news.subject-shared", false, params, "title");
                } else {
                    unauthorized(request);
                }
            }
        });
    }

    @Put("/subject/share/remove/:" + SUBJECT_ID_PARAMETER)
    @ApiDoc("Remove Share by id.")
    @SecuredAction("exercizer.subject.manager")
    public void shareSubjectRemove(final HttpServerRequest request) {
        removeShare(request, false);
    }
}
