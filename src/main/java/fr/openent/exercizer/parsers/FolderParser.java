package fr.openent.exercizer.parsers;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.json.JsonObject;

public class FolderParser {

    public static JsonObject beforePersist(final JsonObject folder, final UserInfos user) {
        folder.putString("owner", user.getUserId());

        return folder;
    }

    public static JsonObject beforeUpdate(final JsonObject folder) {
        if (folder.containsField("selected")) {
            folder.removeField("selected");
        }

        if (folder.containsField("modified")) {
            folder.removeField("modified");
        }

        if (folder.containsField("created")) {
            folder.removeField("created");
        }

        return folder;
    }

}