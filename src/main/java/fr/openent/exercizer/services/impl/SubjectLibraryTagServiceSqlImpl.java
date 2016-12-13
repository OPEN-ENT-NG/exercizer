package fr.openent.exercizer.services.impl;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonObject;

import fr.openent.exercizer.services.ISubjectLibraryTagService;
import fr.wseduc.webutils.Either;

public class SubjectLibraryTagServiceSqlImpl extends AbstractExercizerServiceSqlImpl implements ISubjectLibraryTagService {

	public SubjectLibraryTagServiceSqlImpl() {
		super("exercizer", "subject_library_tag");
	}

	/**
	 * @see fr.openent.exercizer.services.impl.AbstractExercizerServiceSqlImpl
	 */
	@Override
	public void persist(final JsonObject resource, final UserInfos user, final Handler<Either<String, JsonObject>> handler) {
		super.persist(resource, handler);
	}

}
