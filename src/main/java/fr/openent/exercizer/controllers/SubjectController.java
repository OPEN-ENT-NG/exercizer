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
import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.exporter.ImagesToBase64;
import fr.openent.exercizer.exporter.SubjectExporter;
import fr.openent.exercizer.filters.MassOwnerOnly;
import fr.openent.exercizer.filters.MassShareAndOwner;
import fr.openent.exercizer.filters.SubjectDocumentOwner;
import fr.openent.exercizer.parsers.ResourceParser;
import fr.openent.exercizer.services.IGrainService;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.services.impl.GrainServiceSqlImpl;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.folders.impl.DocumentHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.sql.OwnerOnly;
import org.entcore.common.http.filter.sql.ShareAndOwner;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.entcore.common.utils.StringUtils;

import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.DecodeException;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.*;

public class SubjectController extends ControllerHelper {
	static final String INTERACTIVE_RESOURCE_NAME = "exercice_interactive";
	static final String SIMPLE_RESOURCE_NAME = "exercice_assignment";
	private final ISubjectService subjectService;
	private final IGrainService grainService;
	private static final I18n i18n = I18n.getInstance();
	private final Storage storage;
	private final EventHelper eventHelper;

	public SubjectController(final Storage storage, final ExercizerExplorerPlugin plugin) {
		this.subjectService = new SubjectServiceSqlImpl(plugin);
		this.grainService = new GrainServiceSqlImpl();
		this.storage = storage;
		final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Exercizer.class.getSimpleName());
		this.eventHelper = new EventHelper(eventStore);
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
							final Handler<Either<String, JsonObject>> handler = notEmptyResponseHandler(request);
							final String type = resource.getString("type");
							final String name = ("interactive".equals(type))? INTERACTIVE_RESOURCE_NAME : SIMPLE_RESOURCE_NAME;
							subjectService.persist(resource, user, eventHelper.onCreateResource(request, name, handler));
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

	@Post("/subject/import")
	@ApiDoc("Import a subject with grains.")
	@SecuredAction("exercizer.subject.import")
	public void importSubjectGrains(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "import", new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							subjectService.persistSubjectGrains(resource, user, notEmptyResponseHandler(request));
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

	@Put("/subject/mark/delete")
	@ApiDoc("Delete (logically) subjects and real grains.")
	@ResourceFilter(MassShareAndOwner.class)
	@SecuredAction(value = "exercizer.manager", type = ActionType.RESOURCE)
	public void remove(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "delete", new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							subjectService.remove(resource.getJsonArray("ids"), user, new Handler<Either<String, JsonObject>>() {
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
					subjectService.setLastLibraryVisit(user.getUserId(), user.getUsername(), new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> either) {
							if (either.isLeft()) {
								log.error("Exercizer : could not save last visit in library for " + user.getUserId());
							}
						}
					});
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


	@Post("/count-new-library-subject")
	@ApiDoc("Counts subject list for library since last visit.")
	@SecuredAction(value = "", type = ActionType.AUTHENTICATED)
	public void countNewLibrarySubject(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					subjectService.countNewSubjectInLibrary(user.getUserId(), notEmptyResponseHandler(request));
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

        			        JsonObject params = new fr.wseduc.webutils.collections.JsonObject();
        			        params.put("username", user.getUsername());
        			        params.put("uri", pathPrefix + "#/subject/copy/preview/perform/"+subjectId);
                            params.put("userUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
        			        params.put("subjectName", subjectName);
                            params.put("resourceUri", params.getString("uri"));
                            JsonObject pushNotif = new JsonObject()
                                    .put("title", "exercizer.share")
                                    .put("body", I18n.getInstance().translate(
                                            "exercizer.push.notif.share.body",
                                            getHost(request),
                                            I18n.acceptLanguage(request),
                                            user.getUsername(),
                                            subjectName
                                    ));

                            params.put("pushNotif", pushNotif);
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

	@Get("/subject/publish")
	@SecuredAction("exercizer.subject.publish")
	public void publish(final HttpServerRequest request) {
		// This route is used to create publish Workflow right, nothing to do
		return;
	}

	@Put("/subject/share/resource/:id")
	@ApiDoc("Adds rights for a given subject.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.manager", type = ActionType.RESOURCE)
	public void shareResource(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					request.pause();
					final String subjectId = request.params().get("id");
					subjectService.getById(subjectId, user, r -> {
						request.resume();
						JsonObject subject  = ResourceParser.beforeAny(r.right().getValue());
						final String subjectName = subject.getString("title");

						JsonObject params = new fr.wseduc.webutils.collections.JsonObject();
						params.put("username", user.getUsername());
						params.put("uri", pathPrefix + "#/subject/copy/preview/perform/"+subjectId);
						params.put("userUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
						params.put("subjectName", subjectName);
						params.put("resourceUri", params.getString("uri"));

                        JsonObject pushNotif = new JsonObject()
                                .put("title", "exercizer.share")
                                .put("body", I18n.getInstance().translate(
                                        "exercizer.push.notif.share.body",
                                        getHost(request),
                                        I18n.acceptLanguage(request),
                                        user.getUsername(),
                                        subjectName
                                ));

                        params.put("pushNotif", pushNotif);
						SubjectController.super.shareResource(request, "exercizer.share", false, params, null);
					});
				}
				else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}

	@Post("/subject/:id/grain")
	@ApiDoc("Persists a grain.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
	public void grainPersist(final HttpServerRequest request) {
		final Long subjectId;
		try {
			subjectId = Long.parseLong(request.params().get("id"));
		}catch (NumberFormatException e) {
			badRequest(request, e.getMessage());
			return;
		}
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "grain", new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							grainService.persist(resource, subjectId, new Handler<Either<String, JsonObject>>()
							{
								@Override
								public void handle(Either<String, JsonObject> res)
								{
									Handler<Either<String, JsonObject>> hnd = notEmptyResponseHandler(request);
									if (res.isRight()) {
										subjectService.update(new JsonObject().put("id", subjectId), user, handler -> {});
									}
									hnd.handle(res);
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

	@Put("/subject/:id/grain/:gId")
	@ApiDoc("Updates a grain.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
	public void grainUpdate(final HttpServerRequest request) {
		final Long grainId;
		final Long subjectId;
		try {
			subjectId = Long.parseLong(request.params().get("id"));
			grainId = Long.parseLong(request.params().get("gId"));
		}catch (NumberFormatException e) {
			badRequest(request, e.getMessage());
			return;
		}
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "grain", new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject resource) {
							grainService.update(resource, grainId, subjectId, new Handler<Either<String, JsonObject>>()
							{
								@Override
								public void handle(Either<String, JsonObject> res)
								{
									Handler<Either<String, JsonObject>> hnd = defaultResponseHandler(request);
									if (res.isRight()) {
										subjectService.update(new JsonObject().put("id", subjectId), user, handler -> {});
									}
									hnd.handle(res);
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

	@Delete("/subject/:id/grains")
	@ApiDoc("Delete grains of the subject.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
	public void grainRemoves(final HttpServerRequest request) {
		final List<String> ids = request.params().getAll("idGrain");

		if (ids == null || ids.size() == 0) {
			badRequest(request);
			return;
		}

		final List<Long> grainIds = new ArrayList<>();
		final Long subjectId;
		try {
			subjectId = Long.parseLong(request.params().get("id"));
			for (final String id : ids) {
				grainIds.add(Long.parseLong(id));
			}

		} catch (NumberFormatException e) {
			badRequest(request, e.getMessage());
			return;
		}

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					grainService.remove(grainIds, subjectId, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							if (event.isRight()) {
								Renders.noContent(request);
							} else {
								Renders.renderError(request);
							}
						}
					});
				} else {
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

	@Post("/subject/:id/publish/library")
	@ApiDoc("Publish subject in library.")
	@ResourceFilter(OwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void publishSubject(final HttpServerRequest request) {
		final Long subjectId;
		try {
			subjectId = Long.parseLong(request.params().get("id"));
		}catch (NumberFormatException e) {
			badRequest(request, e.getMessage());
			return;
		}
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "publish", new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject data) {
							publish(data, subjectId, user, request);
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

	@Post("/subject/simple/:id/publish/library")
	@ApiDoc("Publish subject in library.")
	@ResourceFilter(OwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	@Deprecated
	public void publishSimpleSubject(final HttpServerRequest request) {
		final Long subjectId;
		try {
			subjectId = Long.parseLong(request.params().get("id"));
		}catch (NumberFormatException e) {
			badRequest(request, e.getMessage());
			return;
		}
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					storage.writeUploadFile(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject event) {
							if ("ok".equals(event.getString("status"))) {
								final String fileId = event.getString("_id");
								final JsonObject metadata = event.getJsonObject("metadata");
								JsonObject data = null;
								try {
									data = new fr.wseduc.webutils.collections.JsonObject(request.formAttributes().get("param"));
								} catch (DecodeException de) {
									Renders.badRequest(request, de.getMessage());
								}

								if (data != null) {
									/*TODO WB-582 : this code is deprecated but seems never used. */
									data.put("correctedFileId", fileId);
									data.put("correctedMetadata", metadata);

									publish(data, subjectId, user, request);
								}
							} else {
								Renders.badRequest(request, event.getString("message"));
							}
						}
					});
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}

	private void publish(JsonObject data, Long subjectId, UserInfos user, final HttpServerRequest request) {
		subjectService.publishLibrary(subjectId, data.getString("authorsContributors"), data.getLong("subjectLessonTypeId"),
				data.getLong("subjectLessonLevelId"), data.getJsonArray("subjectTagList", new fr.wseduc.webutils.collections.JsonArray()), user,
				new Handler<Either<String, JsonObject>>() {
					@Override
					public void handle(Either<String, JsonObject> event) {
						if (event.isRight()) {
							Renders.created(request);
						} else {
							Renders.renderError(request, new fr.wseduc.webutils.collections.JsonObject().put("error", "exercizer.error"));
						}
					}
				});
	}

	@Delete("/subject/:id/unpublish/library")
	@ApiDoc("Unpublish subject in library.")
	@ResourceFilter(OwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void unpublish(final HttpServerRequest request) {
		final String id = request.params().get("id");
		final Long subjectId;
		try {
			subjectId = Long.parseLong(id);
		}catch (NumberFormatException e) {
			badRequest(request, e.getMessage());
			return;
		}

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					subjectService.getCorrectedDownloadInformation(id, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							if (event.isRight()) {
								final String correctedFileId = event.right().getValue().getString("corrected_file_id");
								subjectService.unpublishLibrary(subjectId, new Handler<Either<String, JsonObject>>() {
									@Override
									public void handle(Either<String, JsonObject> event) {
										if (event.isRight()) {
											Renders.noContent(request);

											if (correctedFileId != null) {
												storage.removeFile(correctedFileId, new Handler<JsonObject>() {
													@Override
													public void handle(JsonObject event) {
														if ("error".equals(event.getString("status"))) {
															log.error("Can't remove file ID : " + correctedFileId + ", message : " + event.getString("message"));
														}
													}
												});
											}
										} else {
											Renders.renderError(request);
										}
									}
								});
							} else {
								Renders.renderError(request);
							}
						}
					});
				} else {
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}

	@Get("/subject/:id/library/file/:fileId")
	@ApiDoc("Download a corrected of a library subject.")
	@SecuredAction("exercizer.subject.simple.download.library")
	public void downloadCorrected(final HttpServerRequest request) {
		checkAuth(request).onSuccess( user -> {
			try {
				final Long subjectId = Long.parseLong( request.params().get("id") );
				final String fileId = request.params().get("fileId");
		
				subjectService.getCorrectedDocument(subjectId, fileId, event -> {
					if (event.isRight()) {
						final JsonObject subject = event.right().getValue();
						final String docType = subject.getString("doc_type");
						final JsonObject metadata = subject.getJsonObject("metadata");
						if (docType != null && metadata != null) {
							if( ISubjectService.DocType.STORAGE.getKey().equals(docType) ) {
								storage.sendFile(fileId, metadata.getString("filename"), request, false, metadata);
							// } else {
							// 	sendFileFromWorkspace(request, user, fileId);
							}
						} else {
							Renders.badRequest(request);
						}
					} else {
						Renders.badRequest(request);
					}
				});
			} catch( Exception e ) {
				Renders.badRequest(request);
			}
		});
	}

	Future<JsonObject> retrieveDocument(final String docId) {
		final Promise<JsonObject> promise = Promise.promise();
		JsonObject m = new JsonObject()
				.put("action", "getDocument")
				.put("id", docId);
		eb.request("org.entcore.workspace", m, msg -> {
			if( msg.succeeded() ) {
				final JsonObject result = (JsonObject) msg.result().body();
				if( "ok".equals(result.getString("status")) ) {
					promise.complete( result.getJsonObject("result") );
				} else {
					promise.fail( result.getString("error") );
				}
			} else {
				promise.fail( msg.cause() );
			}
		});
		return promise.future();
	}

	/*
	@Deprecated
	private void sendFileFromWorkspace(final HttpServerRequest request, final UserInfos user, final String docId) {
		retrieveDocument(docId).onSuccess( doc -> {
			try {
				final String fileId = DocumentHelper.getFileId(doc);
				final JsonObject metadata = DocumentHelper.getMetadata(doc);
				storage.sendFile(fileId, metadata.getString("filename"), request, false, metadata);
			} catch ( Exception e ) {
				Renders.noContent(request);
			}
		}).onFailure(err-> {
			Renders.badRequest(request);
		});
	}
	*/

	@Post("/subject/duplicate")
	@ApiDoc("Duplicate subjects.")
	@ResourceFilter(MassShareAndOwner.class)
	@SecuredAction(value = "exercizer.read", type = ActionType.RESOURCE)
	public void duplicateSubjects(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "subjects",new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject data) {
							final String titleSuffix = i18n.translate("exercizer.subject.title.copySuffix", Renders.getHost(request), I18n.acceptLanguage(request));
							subjectService.duplicateSubjects(data.getJsonArray("ids"), data.getLong("folderId"), titleSuffix, user,
									new Handler<Either<String, JsonObject>>() {
										@Override
										public void handle(Either<String, JsonObject> event) {
											if (event.isRight()) {
												Renders.created(request);
											} else {
												Renders.renderError(request, new fr.wseduc.webutils.collections.JsonObject().put("error", "exercizer.error"));
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

	@Post("/subjects/duplicate/library")
	@ApiDoc("Duplicate subjects from library.")
	@SecuredAction(value = "exercizer.subject.duplicate.library")
	public void duplicateSubjectsFromLibrary(final HttpServerRequest request) {
		duplicateSubjects(request);
	}

	@Post("/subject/:id/duplicate/grains")
	@ApiDoc("Duplicate grains into the subject.")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.contrib", type = ActionType.RESOURCE)
	public void duplicateGrainsIntoSubject(final HttpServerRequest request) {
	    final Long subjectId;
		try {
			subjectId = Long.parseLong(request.params().get("id"));
		}catch (NumberFormatException e) {
			badRequest(request, e.getMessage());
			return;
		}

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "grainIds",new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject data) {
							grainService.duplicateGrainIntoSubject(subjectId, data.getJsonArray("grainIds"), Renders.getHost(request), I18n.acceptLanguage(request), new Handler<Either<String, JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> event) {
									if (event.isRight()) {
										Renders.created(request);
									} else {
										Renders.renderError(request, new fr.wseduc.webutils.collections.JsonObject().put("error", "exercizer.error"));
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

	@Put("/subjects/move")
	@ApiDoc("Move subjects into folder.")
	@ResourceFilter(MassOwnerOnly.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void moveSubjects(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "subjects", new Handler<JsonObject>() {
						@Override
						public void handle(final JsonObject data) {
							subjectService.move(data.getJsonArray("ids"), data.getLong("folderId"), new Handler<Either<String, JsonObject>>() {
										@Override
										public void handle(Either<String, JsonObject> event) {
											if (event.isRight()) {
												Renders.noContent(request);
											} else {
												Renders.renderError(request, new fr.wseduc.webutils.collections.JsonObject().put("error", "exercizer.error"));
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

	@Get("/subject/export-moodle/:id/:filename")
	@ResourceFilter(ShareAndOwner.class)
	@SecuredAction(value = "exercizer.read", type = ActionType.RESOURCE)
	public void getMoodle(final HttpServerRequest request){
		final String id = request.params().get("id");
		final String fileName = request.params().get("filename");

		if (StringUtils.isEmpty(id) || StringUtils.isEmpty(fileName)) {
			badRequest(request);
			return;
		}

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(UserInfos user) {
				if(user != null){
					grainService.getGrainsForExport(id, new Handler<Either<String, JsonArray>>() {
						@Override
						public void handle(Either<String, JsonArray> event) {
							if (event.isLeft()) {
								renderError(request, new fr.wseduc.webutils.collections.JsonObject().put("error", event.left().getValue()));
								return;
							}

							final JsonArray grains = event.right().getValue();

							final SubjectExporter sb = new SubjectExporter(grains);
							final String xml = sb.exportToMoodle();
							final ImagesToBase64 base64 = new ImagesToBase64(xml, eb, storage);
							base64.exportImagesToBase64(xml, new Handler<String>() {
								@Override
								public void handle(String event) {
									request.response().putHeader("content-type", "application/xml");
									request.response().putHeader("Content-Disposition",
											"attachment; filename=" + fileName + ".xml");
									request.response().end(event);
								}
							});
						}
					});
				}else{
					log.debug("User not found in session.");
					unauthorized(request);
				}
			}
		});
	}

	/**
	 * Helper function to retrieve the current UserInfo, if authorized. 
	 * Otherwise, responds to request with HTTP 401 Unauthorized.
	 */
	protected Future<UserInfos> checkAuth(final HttpServerRequest request){
		final Promise<UserInfos> promise = Promise.promise();
		UserUtils.getUserInfos(eb, request, user -> {
            if( user != null ) {
				promise.complete( user );
            } else {
				final String unauthorized = "User not found in session.";
                log.debug( unauthorized );
                unauthorized( request );
				promise.fail( unauthorized );
            }
		});
		return promise.future();
	}

	@Get("/subject/:id/files")
	@ResourceFilter(SubjectDocumentOwner.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void listCorrectedDocuments(final HttpServerRequest request){
		checkAuth(request).onSuccess( user -> {
			try {
				final Long subjectId = Long.parseLong( request.params().get("id") );
				subjectService.listCorrectedDocuments(subjectId, arrayResponseHandler(request));
			} catch( Exception e ) {
				badRequest(request);
			}
		});
	}

	@Put("/subject/:id/doc")
	@ResourceFilter(SubjectDocumentOwner.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void addCorrectedDocument(final HttpServerRequest request){
		checkAuth(request).onSuccess( user -> {
			try {
				final Long subjectId = Long.parseLong( request.params().get("id") );
				RequestUtils.bodyToJson(request, docInfo -> {
					final String docId = docInfo.getString("doc_id");
					retrieveDocument(docId)
					.onSuccess( doc -> {
						final JsonObject metadata = DocumentHelper.getMetadata(doc);
						storage.copyFile(DocumentHelper.getFileId(doc), event -> {
							if ("ok".equals(event.getString("status"))) {
								final String fileId = event.getString("_id");
								subjectService.addCorrectedFile(subjectId, fileId, metadata, result -> {
									if( result.isRight() ) {
										defaultResponseHandler(request).handle(result);
									} else {
										Renders.renderError(request, new fr.wseduc.webutils.collections.JsonObject().put("error", "exercizer.file.limit5"));
										storage.removeFile(fileId, event2 -> {
											if ("error".equals(event2.getString("status"))) {
												log.warn("Fail to delete file due to : " + event2.getString("message"));
											}
										});
									}
								});
							} else {
								Renders.noContent(request);
							}
						});
					})
					.onFailure(err-> {
						Renders.badRequest(request);
					});
				});
			} catch( Exception e ) {
				badRequest(request);
			}
		});
	}

	@Put("/subject/:id/file")
	@ApiDoc("Adding a corrected file to a subject.")
	@ResourceFilter(SubjectDocumentOwner.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void uploadCorrectedFile(final HttpServerRequest request){
		checkAuth(request).onSuccess( user -> {
			try {
				final Long subjectId = Long.parseLong( request.params().get("id") );
				storage.writeUploadFile(request, event-> {
					if ("ok".equals(event.getString("status"))) {
						final String fileId = event.getString("_id");
						final JsonObject metadata = event.getJsonObject("metadata");
						subjectService.addCorrectedFile(subjectId, fileId, metadata, result -> {
							if( result.isRight() ) {
								defaultResponseHandler(request).handle(result);
							} else {
								Renders.renderError(request, new fr.wseduc.webutils.collections.JsonObject().put("error", "exercizer.file.limit5"));
								storage.removeFile(fileId, event2 -> {
									if ("error".equals(event2.getString("status"))) {
										log.warn("Fail to delete file due to : " + event2.getString("message"));
									}
								});
							}
						});
					} else {
						Renders.badRequest(request, event.getString("message"));
					}
				});
			} catch( Exception e ) {
				badRequest(request);
			}
		});
	}

	@Delete("/subject/:id/file/:fileId")
	@ResourceFilter(SubjectDocumentOwner.class)
	@SecuredAction(value="", type = ActionType.RESOURCE)
	public void deleteCorrectedDocument(final HttpServerRequest request){
		checkAuth(request).onSuccess( user -> {
			try {
				final Long subjectId = Long.parseLong( request.params().get("id") );
				final String fileId = request.params().get("fileId");
				subjectService.deleteCorrectedDocument(subjectId, fileId, defaultResponseHandler(request));
			} catch( Exception e ) {
				badRequest(request);
			}
		});
	}
}
