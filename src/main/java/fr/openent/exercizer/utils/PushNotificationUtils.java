package fr.openent.exercizer.utils;

import fr.wseduc.webutils.I18n;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;

public class PushNotificationUtils {
    public static JsonObject getNotification(HttpServerRequest request, String notificationName, JsonObject notification) {
        String acceptLanguage = I18n.acceptLanguage(request);
        String host = ControllerHelper.getHost(request);
        JsonObject pushNotif = new JsonObject()
                .put("title", "exercizer." + notificationName);

        String body = "";
        switch (notificationName) {
            case "submitcopy": {
                body = I18n.getInstance().translate(
                        "exercizer.push.notif.submitcopy.body",
                        host,
                        acceptLanguage,
                        notification.getString("username"),
                        notification.getString("subjectName")
                );
                break;
            }
            case "correctcopy": {
                body = I18n.getInstance().translate(
                        "exercizer.push.notif.correctcopy.body",
                        host,
                        acceptLanguage,
                        notification.getString("username"),
                        notification.getString("subjectName")
                );
                break;
            }
            case "assigncopy": {
                body = I18n.getInstance().translate(
                        "exercizer.push.notif.assigncopy.body",
                        host,
                        acceptLanguage,
                        notification.getString("username"),
                        notification.getString("subjectName"),
                        notification.getString("dueDate")
                );
                break;
            }
            case "correcthomework": {
                body = I18n.getInstance().translate(
                        "exercizer.push.notif.correcthomework.submit.body",
                        host,
                        acceptLanguage,
                        notification.getString("username"),
                        notification.getString("subjectName")
                );
                break;
            }
            case "submithomework": {
                body = I18n.getInstance().translate(
                        "exercizer.push.notif.submithomework.submit.body",
                        host,
                        acceptLanguage,
                        notification.getString("username"),
                        notification.getString("subjectName")
                );
                break;
            }
            case "homeworkreminder": {
                body = I18n.getInstance().translate(
                        "exercizer.push.notif.homeworkreminder.body",
                        host,
                        acceptLanguage,
                        notification.getString("subjectName"),
                        notification.getString("dueDate")
                );
                break;
            }
            case "unassigncopy": {
                body = I18n.getInstance().translate(
                        "exercizer.push.notif.unassigncopy.body",
                        host,
                        acceptLanguage,
                        notification.getString("username"),
                        notification.getString("subjectName"),
                        notification.getString("dueDate")
                );
                break;
            }
        }
        pushNotif.put("body", body);
        return pushNotif;
    }
}
