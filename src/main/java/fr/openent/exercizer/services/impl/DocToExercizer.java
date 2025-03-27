package fr.openent.exercizer.services.impl;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

import org.entcore.common.user.UserInfos;

import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.services.IGrainService;
import fr.openent.exercizer.services.ISubjectService;
import fr.wseduc.webutils.Server;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.CookieHelper;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.MultiMap;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
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
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.entcore.common.user.UserInfos;

public class DocToExercizer {

    private static final Logger log = LoggerFactory.getLogger(DocToExercizer.class);
    private final JsonObject config;
    private final String token;
    private final String host;
    private final String username;
    private final ISubjectService subjectService;
    private final IGrainService grainService;
    protected EventBus eb;
    private HttpClient client;
    private HttpServerRequest req;
    private String userId;
    private final JsonArray base64Images = new JsonArray();
    private final String hostApp;

    public DocToExercizer(Vertx vertx, ExercizerExplorerPlugin plugin, JsonObject conf) {
        if (vertx != null) {
            this.eb = Server.getEventBus(vertx);
            this.client = vertx.createHttpClient(new HttpClientOptions());
        }
        this.hostApp = conf.getString("host", "");
        this.subjectService = new SubjectServiceSqlImpl(plugin);
        this.grainService = new GrainServiceSqlImpl();
        this.config = conf.getJsonObject("doc-to-exercizer");
        this.host = this.config.getString("docToExercizerHost", "");
        this.token = this.config.getString("docToExercizerPassword", "");
        this.username = this.config.getString("docToExercizerUsername", "");
    }

    public JsonArray convertToShort(JsonObject input) {
        return convertContent(input, 6);
    }

    public JsonArray convertToMqc(JsonObject input) {
        return convertContent(input, 7);
    }

    public JsonArray convertToCloze(JsonObject input){
        return convertContent(input, 10);
    }

    private JsonArray convertContent(JsonObject input, int nonStatementGrainTypeId) {
        try {
            JsonArray resultArray = new JsonArray();
            JsonObject data = input.getJsonObject("data");
            JsonArray bodyArray = data.getJsonArray("body");

            List<String> imagePaths = processImages();

            for (int i = 0; i < bodyArray.size(); ++i) {
                JsonObject bodyObject = bodyArray.getJsonObject(i);
                String type = bodyObject.getString("type");

                if ("statement".equals(type)) {
                    resultArray.add(createStatementGrain(bodyObject, i));
                } else {
                    resultArray.add(createAnswerGrain(bodyObject, i, nonStatementGrainTypeId));
                }
            }

            return resultArray;
        } catch (Exception e) {
            log.error("Conversion JSON failure: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private List<String> processImages() {
        List<String> paths = new ArrayList<>();
        if (base64Images.size() > 0) {
            for (int c = 0; c < this.base64Images.size(); ++c) {
                Promise<JsonArray> promise = Promise.promise();
                this.storeImagesInWorkspace(this.base64Images.getString(c), promise);
                promise.future().onComplete((ar) -> {
                    if (ar.succeeded()) {
                        JsonObject imageResponse = ((JsonArray) ar.result()).getJsonObject(0);
                        String imageId = imageResponse.getString("file");
                        paths.add(String.format("/workspace/document/%s", imageId));
                        log.info("Image stored in workspace: " + imageId);
                    } else {
                        log.error("Failed to store image in workspace: " + ar.cause().getMessage());
                    }
                });
            }
            base64Images.clear();
        }
        return paths;
    }

    private JsonObject createStatementGrain(JsonObject bodyObject, int index) {
        JsonObject customData = new JsonObject()
                .put("statement", "<div>" + bodyObject.getString("content", "") + "</div>");
        JsonObject grainData = new JsonObject()
                .put("title", bodyObject.getString("title", ""))
                .put("max_score", 0)
                .put("custom_data", customData);
        return new JsonObject()
                .put("grainTypeId", 3)
                .put("orderBy", index + 1)
                .put("grainData", grainData);
    }

    private JsonObject createAnswerGrain(JsonObject bodyObject, int index, int grainTypeId) {
        JsonArray answers = bodyObject.getJsonArray("answers");
        String title = bodyObject.getString("content", "Untitled");
        String hint = bodyObject.getString("hint", "");
        String explanation = bodyObject.getString("explanation", "");
        String statement = bodyObject.getString("title", "");
        
        JsonObject customData = new JsonObject();
        
        if (grainTypeId == 10) {
            JsonArray zones = new JsonArray();
            title = bodyObject.getString("title", "Untitled");
            statement = bodyObject.getString("content", "Untitled");
        
            
            
            String clozeText = bodyObject.getString("cloze_text", "");
            JsonArray placeholders = bodyObject.getJsonArray("placeholders", new JsonArray());
            
            for (int j = 0; j < placeholders.size(); j++) {
                JsonObject placeholder = placeholders.getJsonObject(j);
                String answerId = placeholder.getString("id", "");
                JsonArray placeholderAnswers = placeholder.getJsonArray("answers", new JsonArray());
                
                String answer = "";
                if (placeholderAnswers.size() > 0) {
                    JsonObject firstAnswer = placeholderAnswers.getJsonObject(0);
                    if (firstAnswer.containsKey("content")) {
                        answer = firstAnswer.getString("content", "");
                    }
                }
                
                JsonObject zone = new JsonObject()
                    .put("answer", answer)
                    .put("options", new JsonArray())
                    .put("id", j);
                zones.add(zone);
            }
            
            StringBuilder htmlBuilder = new StringBuilder();
            if (!clozeText.isEmpty()) {
                String htmlContent = clozeText;
                for (int i = 0; i < zones.size(); i++) {
                    String placeholder = "%%%" + (i+1) + "%%%";
                    String replacement = "<span contenteditable=\"false\" class=\"ng-scope\"><fill-zone zone-id=\"" 
                                      + i + "\" class=\"ng-isolate-scope\"><text-zone style=\"max-width:unset;box-shadow:none;\"></text-zone></fill-zone>&nbsp;</span>";
                    htmlContent = htmlContent.replace(placeholder, replacement);
                }
                htmlBuilder.append(htmlContent);
            } else if (answers != null) {
                htmlBuilder.append("<div>");
                for (int j = 0; j < answers.size(); j++) {
                    JsonObject answer = answers.getJsonObject(j);
                    String content = answer.getString("content", "");
                    htmlBuilder.append(content);
                    if (j < answers.size() - 1) {
                        htmlBuilder.append("<span contenteditable=\"false\" class=\"ng-scope\"><fill-zone zone-id=\"")
                                   .append(j)
                                   .append("\" class=\"ng-isolate-scope\"><text-zone style=\"max-width:unset;box-shadow:none;\"></text-zone></fill-zone>&nbsp;</span>");
                    }
                }
                htmlBuilder.append("</div>");
            } else {
                htmlBuilder.append("<div>Complete the text with appropriate words.</div>");
            }
            
            customData.put("zones", zones)
                     .put("options", new JsonArray())
                     .put("htmlContent", bodyObject.getString("htmlContent", htmlBuilder.toString()))
                     .put("answersType", "text");
        } else {
            JsonArray correctAnswerList = new JsonArray();
            if (answers != null) {
                for (int j = 0; j < answers.size(); ++j) {
                    JsonObject answer = answers.getJsonObject(j);
                    boolean isCorrect = false;
                    if (answer.containsKey("is_correct") && answer.getValue("is_correct") instanceof Boolean) {
                        isCorrect = answer.getBoolean("is_correct", false);
                    }
                    JsonObject answerObj = new JsonObject()
                            .put("text", answer.getString("content", ""))
                            .put("isChecked", isCorrect);
                    correctAnswerList.add(answerObj);
                }
            }
            
            customData.put("correct_answer_list", correctAnswerList)
                     .put("no_error_allowed", false);
        }
        
        JsonObject grainData = new JsonObject()
                .put("title", title)
                .put("statement", grainTypeId == 6 || grainTypeId == 10 ? "<div class=\"ng-scope\">" + statement + "</div>" : null)
                .put("answer_hint", hint)
                .put("answer_explanation", explanation)
                .put("max_score", 1)
                .put("custom_data", customData);
        
        if (grainData.getValue("statement") == null) {
            grainData.remove("statement");
        }
        
        return new JsonObject()
                .put("grainTypeId", grainTypeId)
                .put("orderBy", index + 1)
                .put("grainData", grainData);
    }

    public JsonArray selectConverterMethod(JsonArray outputLlm) {
        if (outputLlm != null && !outputLlm.isEmpty()) {
            try {
                JsonObject firstObject = outputLlm.getJsonObject(0);
                if (firstObject.containsKey("image") && firstObject.getValue("image") != null  && firstObject.getJsonObject("image").containsKey("content")) {
                    JsonArray imageContent = firstObject.getJsonObject("image").getJsonArray("content");

                    for (int i = 0; i < imageContent.size(); ++i) {
                        JsonObject imageObj = imageContent.getJsonObject(i);
                        if (imageObj.containsKey("image")) {
                            this.base64Images.add(imageObj.getString("image"));
                        }
                    }
                }else{
                    log.info("Image empty: missing 'image' field");
                }

                if (!firstObject.containsKey("data")) {
                    log.error("Invalid input format: missing 'data' field");
                    throw new IllegalArgumentException("Invalid input format");
                } else {
                    JsonObject data = firstObject.getJsonObject("data");
                    JsonArray bodyArray = data.getJsonArray("body");
                    if (bodyArray != null && !bodyArray.isEmpty()) {
                        String type = null;

                        for (int i = 0; i < bodyArray.size(); ++i) {
                            JsonObject bodyObject = bodyArray.getJsonObject(i);
                            if (bodyObject.containsKey("type")) {
                                type = bodyObject.getString("type");
                                if (!"statement".equals(type)) {
                                    break;
                                }
                            }
                        }

                        JsonArray result;
                        switch (type) {
                            case "short":
                                result = this.convertToShort(firstObject);
                                break;
                            case "mcq":
                                result = this.convertToMqc(firstObject);
                                break;
                            case "cloze":
                                result = this.convertToCloze(firstObject);
                                break;
                            default:
                                log.error("Unsupported converter type: {}", new Object[] { type });
                                throw new IllegalArgumentException("Unsupported converter type: " + type);
                        }

                        return result;
                    } else {
                        log.error("Body array is null or empty");
                        throw new IllegalArgumentException("Body array cannot be null or empty");
                    }
                }
            } catch (Exception e) {
                log.error("Error during conversion selection: " +  e.getMessage() );
                throw new RuntimeException("Error during conversion selection", e);
            }
        } else {
            log.error("Input array is null or empty");
            throw new IllegalArgumentException("Input array cannot be null or empty");
        }
    }

    private void serverLLM(String file, Handler<JsonArray> handler) {
        final String session = CookieHelper.getInstance().getSigned("oneSessionId", this.req);
        final String ua = this.req.headers().get("User-Agent");
        JsonObject requestData = (new JsonObject())
            .put("image", file)
            .put("user_id", this.userId)
            .put("user_session", session)
            .put("user_browser", ua);
        String auth = String.format("%s:%s", this.username, this.token);
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        this.client.request((new RequestOptions()).setAbsoluteURI(this.host + "doc-to-exo/generate")
                .setMethod(HttpMethod.POST).addHeader("content-type", "application/json")
                .addHeader("Authorization", "Basic " + encodedAuth))
                .flatMap((request) -> request.send(requestData.encode())).onSuccess((response) -> {
                    if (response.statusCode() == 200) {
                        response.bodyHandler((body) -> {
                            JsonObject json = body.toJsonObject();
                            log.info("Conversion initiated: " + json);
                            handler.handle(new JsonArray().add(json));
                        });
                    } else {
                        this.handleError("Failed to initiate conversion: " + response.statusMessage() + " " +  response.statusCode() , response.statusCode(), handler);
                    }

                }).onFailure((throwable) -> this.handleError("Failed to create POST request: " + throwable.getMessage(), 500, handler));
    }

    private void handleError(String message, int code,  Handler<JsonArray> handler) {
        log.error(message);
        JsonObject errorResponse = new JsonObject().put("error_description", message).put("status_code", code);
        handler.handle(new JsonArray().add(errorResponse));
    }

    public void generate(HttpServerRequest request, UserInfos user, JsonObject resource) {
        Long subjectId = resource.getLong("id");
        String fileId = resource.getString("fileId");
        this.req = request;
        log.info("Generating exercise for subject ID: " + subjectId + " and user ID: " + user.getUserId());
        this.userId = user.getUserId();
        this.buildUrlFile(fileId, (response) -> {
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
                int code = 500;
                if(response != null && response.getJsonObject(0).containsKey("error_description")) {
                    code = response.getJsonObject(0).getInteger("status_code", 500);
                }
                Renders.renderJson(request, (new JsonObject()).put("error", response), code);
            }
        });
    }

/**
 * Version de getFileFromWorkspace qui renvoie une Future<Buffer>
 * pour être compatible avec la méthode buildUrlFile
 * 
 * @param id L'identifiant du fichier à récupérer
 * @return Future contenant le buffer du fichier ou une erreur
 */
public Future<Buffer> getFileFromWorkspace(String id) {
    Promise<Buffer> promise = Promise.promise();
    getFileFromWorkspace(id, promise);
    return promise.future();
}

public void buildUrlFile(String fileId, Handler<JsonArray> handler) {
    if (fileId == null || fileId.isEmpty()) {
        log.error("Invalid file ID provided");
        handler.handle(new JsonArray().add(new JsonObject()
            .put("error_description", "Invalid file ID")
            .put("status_code", 400)));
        return;
    }
    
    this.getFileFromWorkspace(fileId).onComplete((ar) -> {
        if (ar.succeeded()) {
            Buffer fileBuffer = ar.result();
            if (fileBuffer == null || fileBuffer.length() == 0) {
                log.error("Retrieved empty file buffer for ID: " + fileId);
                handler.handle(new JsonArray().add(new JsonObject()
                    .put("error_description", "Empty file content")
                    .put("status_code", 400)));
                return;
            }
            
            try {
                String mimeType = detectMimeType(fileBuffer);
                String fileBase64 = "data:" + mimeType + ";base64," + 
                    Base64.getEncoder().encodeToString(fileBuffer.getBytes());
                
                log.debug("File converted to base64, length: " + fileBase64.length());
                
                this.serverLLM(fileBase64, (res) -> {
                    if (res != null && !res.isEmpty() && !res.getJsonObject(0).containsKey("error_description")) {
                        try {
                            JsonArray grains = new JsonArray().addAll(this.selectConverterMethod(res));
                            handler.handle(grains);
                        } catch (Exception e) {
                            log.error("Failed to convert LLM response: " + e.getMessage(), e);
                            JsonObject errorResponse = new JsonObject()
                                .put("error_description", "Failed to process LLM response: " + e.getMessage())
                                .put("status_code", 501);
                            handler.handle(new JsonArray().add(errorResponse));
                        }
                    } else {
                        log.error("LLM processing failed for file: " + fileId);
                        handler.handle(res != null && !res.isEmpty() ? res : 
                            new JsonArray().add(new JsonObject()
                                .put("error_description", "LLM processing failed")
                                .put("status_code", 500)));
                    }
                });
            } catch (Exception e) {
                log.error("Error processing file: " + e.getMessage(), e);
                handler.handle(new JsonArray().add(new JsonObject()
                    .put("error_description", "Error processing file: " + e.getMessage())
                    .put("status_code", 500)));
            }
        } else {
            log.error("Failed to retrieve file from workspace: " + ar.cause().getMessage());
            handler.handle(new JsonArray().add(new JsonObject()
                .put("error_description", "Failed to retrieve file from workspace: " + ar.cause().getMessage())
                .put("status_code", 500)));
        }
    });
}


private String detectMimeType(Buffer buffer) {
    byte[] bytes = buffer.getBytes(0, Math.min(buffer.length(), 8));
    if (bytes.length >= 3 && bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) {
        return "image/jpeg";
    }
    if (bytes.length >= 8 && bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47
            && bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A) {
        return "image/png";
    }
    if (bytes.length >= 6 && bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F' 
            && bytes[3] == '8' && (bytes[4] == '7' || bytes[4] == '9') && bytes[5] == 'a') {
        return "image/gif";
    }
    return "image/png";
}

    public void storeImagesInWorkspace(String base64, Promise<JsonArray> promise) {
        try {
            final String sessionToken = CookieHelper.getInstance().get("next-auth.session-token", this.req);
            String session = CookieHelper.getInstance().get("oneSessionId", this.req);
            String xsrfToken = Optional.ofNullable(this.req.headers().get("X-XSRF-TOKEN")).orElse(this.req.headers().get("x-xsrf-token"));
            String webviewignored = CookieHelper.getInstance().get("webviewignored", this.req);

            String[] base64Parts = base64.split(",");
            String mimeType = base64Parts[0].split(":")[1].split(";")[0];
            String fileExtension = mimeType.split("/")[1];
            String imageString = base64Parts[1];
            byte[] imageBytes = Base64.getDecoder().decode(imageString);
            String boundary = "----WebKitFormBoundary" + UUID.randomUUID().toString();
            String filename = "docToExo_" + System.currentTimeMillis() + "." + fileExtension;

            Buffer multipartBuffer = Buffer.buffer();
            multipartBuffer.appendString("--" + boundary + "\r\n");
            multipartBuffer.appendString("Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\n");
            multipartBuffer.appendString("Content-Type: " + mimeType + "\r\n\r\n");
            multipartBuffer.appendBytes(imageBytes);
            multipartBuffer.appendString("\r\n--" + boundary + "--\r\n");

            MultiMap headers = MultiMap.caseInsensitiveMultiMap();
            headers.add("Content-Type", "multipart/form-data; boundary=" + boundary);
            headers.add("Accept", "*/*");
            headers.add("Origin", this.hostApp);
            headers.add("Referer", this.hostApp + "/workspace/workspace");
            headers.add("Cookie", "next-auth.session-token=" + sessionToken + "; webviewignored=" + webviewignored + "; oneSessionId=" + session + "; authenticated=true" + "; XSRF-TOKEN=" + xsrfToken);
            headers.add("X-XSRF-TOKEN", xsrfToken);


            RequestOptions options = new RequestOptions()
                    .setAbsoluteURI(this.hostApp + "/workspace/document?quality=1")
                .setMethod(HttpMethod.POST)
                    .setHeaders(headers);

            this.client.request(options)
                    .compose(req -> req.send(multipartBuffer))
                    .onSuccess(response -> {
                        int statusCode = response.statusCode();
                        if (statusCode == 200 || statusCode == 201) {
                            response.bodyHandler(body -> {
                                try {
                                    JsonObject json = body.toJsonObject();
                                    promise.complete(new JsonArray().add(json));
                                } catch (Exception e) {
                                    promise.fail("Failed to parse response: " + e.getMessage());
                                }
                            });
                        } else {
                            response.bodyHandler(body -> {
                                String responseBody = body.toString();
                                log.error("Upload failed. Status: " + statusCode + ", Message: " + response.statusMessage() + ", Body: " + responseBody);
                                log.error("Upload failed body : " + response.toString());
                                promise.fail("Upload failed with status " + statusCode + ": " + response.statusMessage());
                            });
                        }
                    })
                    .onFailure(throwable -> {
                        log.error("Network error during image upload", throwable);
                        promise.fail(throwable);
                    });
        } catch (Exception e) {
            log.error("Error processing image upload", e);
            promise.fail(e);
        }
    }

/**
 * Récupère un fichier du workspace par son ID
 * 
 * @param id L'identifiant du fichier à récupérer
 * @param promise La promise qui sera complétée avec le buffer du fichier
 */
public void getFileFromWorkspace(String id, Promise<Buffer> promise) {
    if (id == null || id.isEmpty()) {
        promise.fail("Invalid file ID");
        return;
    }
    
    if (this.req == null) {
        promise.fail("No request context available");
        return;
    }

    try {
        final String sessionToken = CookieHelper.getInstance().get("next-auth.session-token", this.req);
        String session = CookieHelper.getInstance().get("oneSessionId", this.req);
        String xsrfToken = Optional.ofNullable(this.req.headers().get("X-XSRF-TOKEN"))
                .orElse(this.req.headers().get("x-xsrf-token"));
        String webviewignored = CookieHelper.getInstance().get("webviewignored", this.req);
        MultiMap headers = MultiMap.caseInsensitiveMultiMap();
        headers.add("Accept", "*/*");
        headers.add("Origin", this.hostApp);
        headers.add("Referer", this.hostApp + "/workspace/workspace");
        StringBuilder cookieBuilder = new StringBuilder();
        if (sessionToken != null) cookieBuilder.append("next-auth.session-token=").append(sessionToken).append("; ");
        if (webviewignored != null) cookieBuilder.append("webviewignored=").append(webviewignored).append("; ");
        if (session != null) cookieBuilder.append("oneSessionId=").append(session).append("; ");
        cookieBuilder.append("authenticated=true");
        if (xsrfToken != null) cookieBuilder.append("; XSRF-TOKEN=").append(xsrfToken);
        
        headers.add("Cookie", cookieBuilder.toString());
        if (xsrfToken != null) {
            headers.add("X-XSRF-TOKEN", xsrfToken);
        }
        
        RequestOptions options = new RequestOptions()
            .setAbsoluteURI(this.hostApp + "/workspace/document/" + id)
            .setMethod(HttpMethod.GET)
            .setHeaders(headers)
            .setTimeout(30000);
        
        log.debug("Retrieving file from workspace: " + id);
        
        this.client.request(options)
            .compose(request -> request.send())
            .onSuccess(response -> {
                int statusCode = response.statusCode();
                if (statusCode == 200) {
                    response.bodyHandler(buffer -> {
                        if (buffer != null && buffer.length() > 0) {
                            log.debug("File successfully retrieved, size: " + buffer.length() + " bytes");
                            promise.complete(buffer);
                        } else {
                            log.error("Retrieved empty file from workspace for ID: " + id);
                            promise.fail("Empty file content");
                        }
                    });
                } else {
                    String errorMessage = "Failed to retrieve file from workspace. Status: " + statusCode;
                    if (response.statusMessage() != null) {
                        errorMessage += " - " + response.statusMessage();
                    }
                    log.error(errorMessage);
                    promise.fail(errorMessage);
                }
            })
            .onFailure(throwable -> {
                log.error("Network error retrieving file from workspace: " + throwable.getMessage(), throwable);
                promise.fail("Network error: " + throwable.getMessage());
            });
    } catch (Exception e) {
        log.error("Unexpected error in getFileFromWorkspace: " + e.getMessage(), e);
        promise.fail("Internal error: " + e.getMessage());
    }
}
}
