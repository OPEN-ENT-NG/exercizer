package fr.openent.exercizer.services.impl;

import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.services.IGrainService;
import fr.openent.exercizer.services.ISubjectService;
import fr.wseduc.webutils.Server;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpClient;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

public class DocToExercizer {

    private static final Logger log = LoggerFactory.getLogger(DocToExercizer.class);
    private final JsonObject config;
    private final String convertUrl;
    private final String hfToken;
    private final String url;
    private final ISubjectService subjectService;
    private final IGrainService grainService;
    protected EventBus eb;
    private HttpClient client;

    public DocToExercizer(Vertx vertx, final ExercizerExplorerPlugin plugin, JsonObject conf) {
        if (vertx != null) {
            this.eb = Server.getEventBus(vertx);
            this.client = vertx.createHttpClient();
        }
        this.subjectService = new SubjectServiceSqlImpl(plugin);
        this.grainService = new GrainServiceSqlImpl();
        this.config = conf.getJsonObject("doc-to-exercizer");
        this.convertUrl = config.getString("convertUrl", "");
        this.hfToken = config.getString("hftoken", "");
        this.url = conf.getString("host")+"/workspace/document/";

    }

    public static JsonObject jsonToGrainFormat(JsonObject input) {
        JsonObject grainData = new JsonObject();
        JsonArray correctAnswerList = new JsonArray();
        JsonObject bodyObject = input.getJsonObject("data")
                .getJsonArray("body")
                .getJsonObject(0);
        JsonArray answers = bodyObject.getJsonArray("answers");
        String title = bodyObject.getString("content", "Untitled");
        for (int i = 0; i < answers.size(); i++) {
            JsonObject answer = answers.getJsonObject(i);
            JsonObject answerObj = new JsonObject()
                    .put("isChecked", answer.getBoolean("is_correct", false))
                    .put("text", answer.getString("content", ""));
            correctAnswerList.add(answerObj);
        }
        JsonObject customData = new JsonObject()
                .put("correct_answer_list", correctAnswerList)
                .put("no_error_allowed", false);
        grainData.put("title", title)
                .put("max_score", 0)
                .put("custom_data", customData);
        return new JsonObject()
                .put("grainTypeId", 7)
                .put("orderBy", 1)
                .put("grainData", grainData);

    }

    private void callAI(String path, Handler<JsonArray> handler) {
        JsonObject requestData = new JsonObject()
                .put("data", new JsonArray()
                        .add(new JsonObject()
                                .put("path", path)));
        client.postAbs(convertUrl, response -> {
                    if (response.statusCode() == 200) {
                        response.bodyHandler(body -> {
                            JsonObject responseBody = body.toJsonObject();
                            String eventId = responseBody.getString("event_id");
                            log.info("Conversion started, Event ID: " + eventId);
                            String resultUrl = convertUrl + "/" + eventId;
                            client.getAbs(resultUrl, resultResponse -> {
                                        if (resultResponse.statusCode() == 200) {
                                            resultResponse.bodyHandler(resultBody -> {
                                                String rawResult = resultBody.toString();
                                                try {
                                                    int dataIndex = rawResult.indexOf("data:");
                                                    if (dataIndex != -1) {
                                                        String jsonData = rawResult.substring(dataIndex + 5).trim();
                                                        JsonArray jsonArray = new JsonArray(jsonData);
                                                        handler.handle(jsonArray);
                                                    } else {
                                                        handler.handle(null);
                                                        log.error("No data found in response");
                                                    }
                                                } catch (Exception e) {
                                                    handler.handle(null);
                                                    log.error("Failed to parse JSON Array: " + e.getMessage());
                                                }
                                            });
                                        } else {
                                            handler.handle(null);
                                            log.error("Failed to fetch result: " + resultResponse.statusCode());
                                        }
                                    }).putHeader("Authorization", "Bearer " + hfToken)
                                    .end();
                        });
                    } else {
                        handler.handle(null);
                        log.error("Failed to initiate conversion: " + response.statusCode());
                    }
                }).putHeader("Content-Type", "application/json")
                .putHeader("Authorization", "Bearer " + hfToken)
                .end(requestData.encode());
    }

    public void generate(final HttpServerRequest request, UserInfos user, JsonObject resource) {
        final Long subjectId = resource.getLong("id");
        final String docId = resource.getValue("docId").toString();
        List<String> ids = new ArrayList<>();
        ids.add(docId);
        JsonObject j = new JsonObject()
                .put("action", "changeVisibility")
                .put("visibility", "public")
                .put("documentIds", new JsonArray(ids));
        eb.request("org.entcore.workspace", j, r -> {
            if (r.succeeded()) {
                buildUrlFile(docId, response -> {
                    if (response != null) {
                        for (Object o : response) {
                            grainService.persist((JsonObject) o, subjectId, grainsResponse -> {
                                if (grainsResponse.isRight()) {
                                    subjectService.update(new JsonObject().put("id", subjectId), user, handler -> {
                                    });
                                }
                            });
                        }
                        grainService.list(resource, arrayResponseHandler(request));
                    } else {
                        Renders.renderJson(request, new JsonObject().put("error", response) , 501);
                    }
                });
            }
        });
    }

    public void buildUrlFile(String docId, Handler<JsonArray> handler) {
        callAI(this.url + docId, res -> {
            log.info("File url : " + this.url + docId);
            if (res != null) {
                log.info(res);
                JsonArray responseFormated = new JsonArray();
                for (Object object : res) {
                    JsonObject grain = jsonToGrainFormat((JsonObject) object);
                    responseFormated.add(grain);
                }
                handler.handle(responseFormated);
            } else {
                handler.handle(res);
            }
        });
    }


}
