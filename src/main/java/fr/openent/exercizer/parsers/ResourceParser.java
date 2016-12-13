package fr.openent.exercizer.parsers;

import java.util.ArrayList;

import org.vertx.java.core.json.JsonObject;

public class ResourceParser {
	
	public static JsonObject beforeAny(final JsonObject resource) {
		ArrayList<String> fields = new ArrayList<>();
		fields.add("index");
		fields.add("selected");
		fields.add("shared");
		fields.add("myRights");
		fields.add("created");
		fields.add("modified");
		
		for (String field : fields) {
			if (resource.containsField(field)) {
				resource.removeField(field);
			}
		}

		return resource;
	}

}
