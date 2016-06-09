package fr.openent.exercizer.filters;

import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;

import fr.wseduc.webutils.http.Binding;

public class TypeSubjectScheduledOwnerOrSubjectCopyOwner implements ResourcesProvider {

	@Override
	public void authorize(HttpServerRequest resourceRequest, Binding binding, UserInfos user,
			Handler<Boolean> handler) {
		// TODO Auto-generated method stub
		
	}
	
}
