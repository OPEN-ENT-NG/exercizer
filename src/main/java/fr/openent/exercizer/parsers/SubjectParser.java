package fr.openent.exercizer.parsers;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.json.JsonObject;

public class SubjectParser {

    public static JsonObject beforePersist(final JsonObject subject, final UserInfos user) {
        subject.putString("owner", user.getUserId());

        return subject;
    }

    public static JsonObject beforeUpdate(final JsonObject subject) {
        if (subject.containsField("shared")) {
            subject.removeField("shared");
        }

        if (subject.containsField("selected")) {
            subject.removeField("selected");
        }

        if (subject.containsField("modified")) {
            subject.removeField("modified");
        }

        if (subject.containsField("created")) {
            subject.removeField("created");
        }

        return subject;
    }

    public static JsonObject beforeRemove(final JsonObject subject) {
        subject.putValue("folder_id", null);
        subject.putBoolean("is_deleted", Boolean.TRUE);

        return subject;
    }

}
