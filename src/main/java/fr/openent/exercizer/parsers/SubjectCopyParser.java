package fr.openent.exercizer.parsers;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.json.JsonObject;

public class SubjectCopyParser {

    public static JsonObject beforePersist(final JsonObject subject, final UserInfos user) {
        if (subject.containsField("modified")) {
            subject.removeField("modified");
        }

        if (subject.containsField("created")) {
            subject.removeField("created");
        }
        
        return subject;
    }

    public static JsonObject beforeUpdate(final JsonObject subject) {
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
        subject.putBoolean("is_deleted", Boolean.TRUE);

        return subject;
    }

}
