package fr.openent.exercizer.controllers;

import fr.openent.exercizer.cron.ScheduledNotification;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.BaseController;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;

public class TaskController extends BaseController {
	protected static final Logger log = LoggerFactory.getLogger(TaskController.class);

	final ScheduledNotification scheduledNotification;

	public TaskController(ScheduledNotification scheduledNotification) {
		this.scheduledNotification = scheduledNotification;
	}

	@Post("api/internal/scheduled-notifications")
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void sendScheduledNotifications(HttpServerRequest request) {
		log.info("Triggered scheduled notification task");
		scheduledNotification.handle(0L);
		render(request, null, 202);
	}
}
