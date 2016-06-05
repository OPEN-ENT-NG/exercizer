package fr.openent.exercizer.parsers;

import org.vertx.java.core.json.JsonObject;

public class GrainParser {
	
	public static JsonObject beforeUpdate(final JsonObject grain) {
        if (grain.containsField("modified")) {
        	grain.removeField("modified");
        }

        if (grain.containsField("created")) {
        	grain.removeField("created");
        }

        return grain;
    }
	
}
