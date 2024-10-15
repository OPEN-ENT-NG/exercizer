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
        this.url = conf.getString("host") + "/workspace/pub/document/";

    }

    public static JsonArray convertToShort(JsonObject input) {
        try {
            JsonArray resultArray = new JsonArray();
            JsonObject data = input.getJsonObject("data");
            JsonArray bodyArray = data.getJsonArray("body");
            for (int i = 0; i < bodyArray.size(); i++) {
                JsonObject bodyObject = bodyArray.getJsonObject(i);
                if ("statement".equals(bodyObject.getString("type"))) {
                    continue;
                }
                JsonArray answers = bodyObject.getJsonArray("answers");
                String title = bodyObject.getString("content", "");
                String statement = bodyObject.getString("title", "");
                String hint = bodyObject.getString("hint", "");
                String explanation = bodyObject.getString("explanation", "");
                JsonArray correctAnswerList = new JsonArray();
                if (answers != null) {
                    for (int j = 0; j < answers.size(); j++) {
                        JsonObject answer = answers.getJsonObject(j);
                        JsonObject answerObj = new JsonObject()
                                .put("text", answer.getString("content", ""));
                        correctAnswerList.add(answerObj);
                    }
                }
                JsonObject customData = new JsonObject()
                        .put("correct_answer_list", correctAnswerList)
                        .put("no_error_allowed", false);
                JsonObject grainData = new JsonObject()
                        .put("title", title)
                        .put("statement", "<div class=\"ng-scope\">" + statement + "</div>")
                        .put("answer_hint", hint)
                        .put("answer_explanation", explanation)
                        .put("max_score", 0)
                        .put("custom_data", customData);
                JsonObject output = new JsonObject()
                        .put("grainTypeId", 6)
                        .put("orderBy", i + 1)
                        .put("grainData", grainData);
                resultArray.add(output);
            }
            return resultArray;
        } catch (Exception e) {
            log.error("Échec de la conversion JSON : " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public static JsonArray convertToMqc(JsonObject input) {
        try {
            JsonArray resultArray = new JsonArray();
            JsonObject headerObject = input.getJsonObject("data").getJsonObject("header");
            JsonArray bodyArray = input.getJsonObject("data").getJsonArray("body");
            for (int i = 0; i < bodyArray.size(); i++) {
                JsonObject bodyObject = bodyArray.getJsonObject(i);
                JsonArray answers = bodyObject.getJsonArray("answers");
                String hint = bodyObject.getString("hint", "");
                String explanation = bodyObject.getString("explanation", "");
                String title = bodyObject.getString("content", "Untitled");
                JsonArray correctAnswerList = new JsonArray();
                for (int j = 0; j < answers.size(); j++) {
                    JsonObject answer = (JsonObject) answers.getValue(j);
                    boolean isCorrect = false;
                    if (answer.containsKey("is_correct") && answer.getValue("is_correct") instanceof Boolean) {
                        isCorrect = answer.getBoolean("is_correct", false);
                    }
                    JsonObject answerObj = new JsonObject()
                            .put("isChecked", isCorrect)
                            .put("text", answer.getString("content", ""));
                    correctAnswerList.add(answerObj);
                }
                JsonObject customData = new JsonObject()
                        .put("correct_answer_list", correctAnswerList)
                        .put("no_error_allowed", false);
                JsonObject grainData = new JsonObject()
                        .put("title", title)
                        .put("answer_hint", hint)
                        .put("answer_explanation", explanation)
                        .put("max_score", 0)
                        .put("custom_data", customData);
                JsonObject output = new JsonObject()
                        .put("grainTypeId", 7)
                        .put("orderBy", i + 1)
                        .put("grainData", grainData);

                resultArray.add(output);
            }

            return resultArray;
        } catch (Exception e) {
            log.error("Échec de l'analyse du tableau JSON : " + e);
            throw new RuntimeException(e);
        }
    }

    public JsonArray selectConverterMethod(JsonArray outputLlm) {
        if (outputLlm == null || outputLlm.isEmpty()) {
            log.error("Input array is null or empty");
            throw new IllegalArgumentException("Input array cannot be null or empty");
        }
        try {
            JsonObject firstObject = outputLlm.getJsonObject(0);

            if (!firstObject.containsKey("data")) {
                log.error("Invalid input format: missing 'data' field");
                throw new IllegalArgumentException("Invalid input format");
            }
            JsonObject data = firstObject.getJsonObject("data");
            JsonArray bodyArray = data.getJsonArray("body");
            if (bodyArray == null || bodyArray.isEmpty()) {
                log.error("Body array is null or empty");
                throw new IllegalArgumentException("Body array cannot be null or empty");
            }
            String type = null;
            for (int i = 0; i < bodyArray.size(); i++) {
                JsonObject bodyObject = bodyArray.getJsonObject(i);
                if (bodyObject.containsKey("type")) {
                    type = bodyObject.getString("type");
                    if (!"statement".equals(type)) {
                        break;
                    }
                }
            }
            switch (type) {
                case "short":
                    return convertToShort(firstObject);
                case "mcq":
                    return convertToMqc(firstObject);
                default:
                    log.error("Unsupported converter type: {}", type);
                    throw new IllegalArgumentException("Unsupported converter type: " + type);
            }
        } catch (Exception e) {
            log.error("Error during conversion selection: {}", e.getMessage());
            throw new RuntimeException("Error during conversion selection", e);
        }
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
                    if (eventId != null) {
                        log.info("Conversion started, Event ID: " + eventId);
                        String resultUrl = convertUrl + "/" + eventId;

                        client.getAbs(resultUrl, resultResponse -> {
                            if (resultResponse.statusCode() == 200) {
                                resultResponse.bodyHandler(resultBody -> {
                                    String rawResult = resultBody.toString();
                                    try {
                                        // Parse SSE format
                                        String[] lines = rawResult.split("\n");
                                        String jsonData = null;
                                        for (String line : lines) {
                                            if (line.startsWith("data:")) {
                                                jsonData = line.substring(5).trim();
                                                if (!jsonData.equals("null")) {
                                                    break;
                                                }
                                            }
                                        }

                                        if (jsonData != null && !jsonData.equals("null")) {
                                            try {
                                                JsonArray jsonArray = new JsonArray(jsonData);
                                                log.info(
                                                        "\n================== Hugging Face response ==================\n"
                                                                +
                                                                jsonArray +
                                                                "\n========================================================\n");
                                                handler.handle(jsonArray);
                                            } catch (Exception e) {
                                                JsonObject errorResponse = new JsonObject()
                                                        .put("response_error", new JsonObject(resultBody))
                                                        .put("error_description",
                                                                "Failed to parse JSON Array: " + e.getMessage());
                                                log.error("Failed to parse JSON Array: " + e.getMessage());
                                                handler.handle(new JsonArray().add(errorResponse));
                                            }
                                        } else {
                                            JsonObject errorResponse = new JsonObject()
                                                    .put("response_error", new JsonObject(resultBody))
                                                    .put("error_description", "No data field found in the response");
                                            log.error("No data found in response");
                                            handler.handle(new JsonArray().add(errorResponse));
                                        }
                                    } catch (Exception e) {
                                        JsonObject errorResponse = new JsonObject()
                                                .put("response_error", new JsonObject(resultBody))
                                                .put("error_description", "Failed to parse JSON: " + e.getMessage());
                                        log.error("Failed to parse JSON : " + e.getMessage());
                                        handler.handle(new JsonArray().add(errorResponse));
                                    }
                                });
                            } else {
                                JsonObject errorResponse = new JsonObject()
                                        .put("status_code", resultResponse.statusCode())
                                        .put("error_description", "Failed to fetch conversion result");
                                log.error("Failed to fetch result: " + resultResponse.statusCode());
                                handler.handle(new JsonArray().add(errorResponse));
                            }
                        }).putHeader("Authorization", "Bearer " + hfToken)
                                .end();
                    } else {
                        JsonObject errorResponse = new JsonObject()
                                .put("error_description", "No event ID found in the response");
                        log.error("No event ID found in response");
                        handler.handle(new JsonArray().add(errorResponse));
                    }
                        });
                    } else {
                JsonObject errorResponse = new JsonObject()
                        .put("status_code", response.statusCode())
                        .put("error_description", "Failed to initiate conversion");
                handler.handle(new JsonArray().add(errorResponse));
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
                    if (response != null && !(response.getJsonObject(0).containsKey("error_description"))) {
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
            if (res != null && !(res.getJsonObject(0).containsKey("error_description"))) {
                try {
                    JsonArray grains = new JsonArray().addAll(selectConverterMethod(res));
                    handler.handle(grains);
                } catch (Exception e) {
                    JsonObject errorResponse = new JsonObject()
                            .put("response_error", res)
                            .put("error_description",
                                    "Failed to select convert method: " + e.getMessage());
                    log.error("Failed to parse JSON Array: " + e.getMessage());
                    handler.handle(new JsonArray().add(errorResponse));
                }
            } else {
                handler.handle(res);
            }
        });
    }


}
