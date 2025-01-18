package fr.openent.exercizer.services.impl;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

import java.util.ArrayList;
import java.util.List;

import org.entcore.common.user.UserInfos;

import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.services.IGrainService;
import fr.openent.exercizer.services.ISubjectService;
import fr.wseduc.webutils.Server;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpClient;
import io.vertx.core.http.HttpClientOptions;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.RequestOptions;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.core.Promise;

public class DocToExercizer {

    private static final Logger log = LoggerFactory.getLogger(DocToExercizer.class);
    private final JsonObject config;
    private final String token;
    private final String host;
    private final String username;
    private String sessionBasic;
    private final ISubjectService subjectService;
    private final IGrainService grainService;
    protected EventBus eb;
    private HttpClient client;
    private HttpServerRequest request;

    public DocToExercizer(Vertx vertx, final ExercizerExplorerPlugin plugin, JsonObject conf) {
        if (vertx != null) {
            this.eb = Server.getEventBus(vertx);
            this.client = vertx.createHttpClient(new HttpClientOptions());
        }
        this.subjectService = new SubjectServiceSqlImpl(plugin);
        this.grainService = new GrainServiceSqlImpl();
        this.config = conf.getJsonObject("doc-to-exercizer");
        this.host = this.config.getString("docToExercizerHost", "");
        this.token = this.config.getString("docToExercizerPassword", "");
        this.username = this.config.getString("docToExercizerUsername", "");
        /* this.getAuthBasic(); */
    }

    public static JsonArray convertToShort(JsonObject input) {
        try {
            JsonArray resultArray = new JsonArray();
            JsonObject data = input.getJsonObject("data");
            JsonArray bodyArray = data.getJsonArray("body");
            for (int i = 0; i < bodyArray.size(); i++) {
                JsonObject bodyObject = bodyArray.getJsonObject(i);
                String type = bodyObject.getString("type");

                if ("statement".equals(type)) {
                    JsonObject customData = new JsonObject()
                            .put("statement", "<div>" + bodyObject.getString("content", "") + "</div>");
                    JsonObject grainData = new JsonObject()
                            .put("title", bodyObject.getString("title", ""))
                            .put("max_score", 0)
                            .put("custom_data", customData);
                    JsonObject output = new JsonObject()
                            .put("grainTypeId", 3)
                            .put("orderBy", i + 1)
                            .put("grainData", grainData);
                    resultArray.add(output);
                } else {
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
                                    .put("text", answer.getString("content", ""))
                                    .put("isChecked", false);
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
                            .put("max_score", 1)
                            .put("custom_data", customData);
                    JsonObject output = new JsonObject()
                            .put("grainTypeId", 6)
                            .put("orderBy", i + 1)
                            .put("grainData", grainData);
                    resultArray.add(output);
                }
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
            JsonObject data = input.getJsonObject("data");
            JsonObject headerObject = data.getJsonObject("header");
            JsonArray bodyArray = data.getJsonArray("body");

            for (int i = 0; i < bodyArray.size(); i++) {
                JsonObject bodyObject = bodyArray.getJsonObject(i);
                String type = bodyObject.getString("type");

                if ("statement".equals(type)) {
                    JsonObject customData = new JsonObject()
                            .put("statement", "<div>" + bodyObject.getString("content", "") + "</div>");
                    JsonObject grainData = new JsonObject()
                            .put("title", bodyObject.getString("title", ""))
                            .put("max_score", 0)
                            .put("custom_data", customData);
                    JsonObject output = new JsonObject()
                            .put("grainTypeId", 3)
                            .put("orderBy", i + 1)
                            .put("grainData", grainData);
                    resultArray.add(output);
                } else {
                    JsonArray answers = bodyObject.getJsonArray("answers");
                    String hint = bodyObject.getString("hint", "");
                    String explanation = bodyObject.getString("explanation", "");
                    String title = bodyObject.getString("content", "Untitled");
                    JsonArray correctAnswerList = new JsonArray();

                    for (int j = 0; j < answers.size(); j++) {
                        JsonObject answer = answers.getJsonObject(j);
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
                            .put("max_score", 1)
                            .put("custom_data", customData);
                    JsonObject output = new JsonObject()
                            .put("grainTypeId", 7)
                            .put("orderBy", i + 1)
                            .put("grainData", grainData);
                    resultArray.add(output);
                }
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

    private void serverLLM(String file, Handler<JsonArray> handler) {
        JsonObject requestData = (new JsonObject()).put("image", file).put("parser_images", true);
        this.client.request((new RequestOptions()).setAbsoluteURI(this.host + "doc-to-exo/generate")
                .setMethod(HttpMethod.POST).addHeader("content-type", "application/json"))
                .flatMap((request) -> request.send(requestData.encode()))
                .onSuccess((response) -> {
                    if (response.statusCode() == 200) {
                        response.bodyHandler((body) -> {
                            JsonObject json = body.toJsonObject();
                            log.info("Conversion initiated: " + json);
                            handler.handle(new JsonArray().add(json));
                        });
                    } else {
                        this.handleError("Failed to initiate conversion: " + response.statusCode(), handler);
                    }

                }).onFailure((throwable) -> this.handleError("Failed to create POST request: " + throwable.getMessage(),
                        handler));
    }

    private void handleError(String message, Handler<JsonArray> handler) {
        log.error(message);
        JsonObject errorResponse = new JsonObject()
                .put("error_description", message);
        handler.handle(new JsonArray().add(errorResponse));
    }

    public void generate(HttpServerRequest request, UserInfos user, JsonObject resource) {
        this.request = request;
        Long subjectId = resource.getLong("id");
        String file = resource.getString("file");
        this.buildUrlFile(file, (response) -> {
            if (response != null && !response.getJsonObject(0).containsKey("error_description")) {
                for (Object o : response) {
                    this.grainService.persist((JsonObject) o, subjectId, (grainsResponse) -> {
                        if (grainsResponse.isRight()) {
                            this.subjectService.update((new JsonObject()).put("id", subjectId), user, (handler) -> {
                            });
                        }

                    });
                }

                this.grainService.list(resource, arrayResponseHandler(request));
            } else {
                Renders.renderJson(request, (new JsonObject()).put("error", response), 501);
            }

        });
    }

    public void buildUrlFile(String file, Handler<JsonArray> handler) {
        this.serverLLM(file, (res) -> {
            log.info("File sent for generation");
            if (res != null && !res.getJsonObject(0).containsKey("error_description")) {
                try {
                    JsonArray grains = (new JsonArray()).addAll(this.selectConverterMethod(res));
                    handler.handle(grains);
                } catch (Exception e) {
                    JsonObject errorResponse = (new JsonObject()).put("response_error", res).put("error_description",
                            "Failed to select convert method: " + e.getMessage());
                    log.error("Failed to parse JSON Array: " + e.getMessage());
                    handler.handle((new JsonArray()).add(errorResponse));
                }
            } else {
                handler.handle(res);
            }

        });
    }

    public void storeImagesInWorkspace(JsonArray images, Promise<JsonArray> promise) {
        JsonObject requestData = new JsonObject();
        this.client.request((new RequestOptions()).setAbsoluteURI(this.host)
            .setMethod(HttpMethod.POST)
            .addHeader("content-type", "application/json")
            .addHeader("Cookie", "sessionId=" + this.sessionBasic)) 
            .flatMap((request) -> request.send(requestData.encode()))
            .onSuccess((response) -> {
                if (response.statusCode() == 200) {
                    response.bodyHandler((body) -> {
                        JsonObject json = body.toJsonObject();
                        this.sessionBasic = json.getString("token");

                    });
                }
            }).onFailure((throwable) -> log.error("Failed to create POST request: " + throwable.getMessage()));
    }

    private void getAuthBasic() {
        JsonObject requestData = new JsonObject();
        this.client.request((new RequestOptions()).setAbsoluteURI(this.host + "doc-to-exo/login")
                .setMethod(HttpMethod.POST).addHeader("content-type", "application/json")
                .addHeader("Authorization", "Basic " + String.format("%s:%s", this.username, this.token)))
                .flatMap((request) -> request.send(requestData.encode()))
                .onSuccess((response) -> {
                    if (response.statusCode() == 200) {
                        response.bodyHandler((body) -> {
                            JsonObject json = body.toJsonObject();
                            this.sessionBasic = json.getString("token");
                        });
                    }

                }).onFailure((throwable) -> log.error("Failed to create POST request: " + throwable.getMessage()));
    }

}
