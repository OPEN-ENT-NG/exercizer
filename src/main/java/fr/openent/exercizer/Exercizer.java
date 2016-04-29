package fr.openent.exercizer;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.BaseServer;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.share.impl.SqlShareService;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import fr.openent.exercizer.controllers.ExercizerController;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.json.JsonArray;


public class Exercizer extends BaseServer {

	private final String TABLE = "subject";
	private final String SHARE_TABLE = "subject_shares";

	@Override
	public void start() {
		super.start();
		final EventBus eb = getEventBus(vertx);

		SqlConf confExercizer = SqlConfs.createConf(ExercizerController.class.getName());
		confExercizer.setTable(TABLE);
		confExercizer.setShareTable(SHARE_TABLE);
		confExercizer.setSchema(getSchema());

		SqlCrudService exercizerCrudService = new SqlCrudService(getSchema(), TABLE, SHARE_TABLE, new JsonArray().addString("*"), new JsonArray().add("*"), true);
		SqlShareService exercizerShareService = new SqlShareService(getSchema(), SHARE_TABLE, eb, securedActions, null);

		ControllerHelper exercizerController = new ExercizerController();
		exercizerController.setCrudService(exercizerCrudService);
		exercizerController.setShareService(exercizerShareService);

		addController(exercizerController);
	}

}
