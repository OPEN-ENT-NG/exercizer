/*
 * Copyright © Conseil Régional Nord Pas de Calais - Picardie, 2016.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package fr.openent.exercizer.cron;

import fr.openent.exercizer.services.ISubjectScheduledService;
import fr.openent.exercizer.services.impl.SubjectScheduledServiceSqlImpl;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import org.entcore.common.http.request.JsonHttpServerRequest;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.DateUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;


public class ScheduledNotification implements Handler<Long> {

    private final Sql sql = Sql.getInstance();
    private final TimelineHelper timelineHelper;
    private final String pathPrefix;
    private final ISubjectScheduledService subjectScheduledService;
    private static final I18n i18n = I18n.getInstance();
    private static final Logger log = LoggerFactory.getLogger(ScheduledNotification.class);

    public ScheduledNotification(final TimelineHelper timelineHelper, final String pathPrefix) {
        this.timelineHelper = timelineHelper;
        this.pathPrefix = pathPrefix;
        this.subjectScheduledService = new SubjectScheduledServiceSqlImpl();
    }

    @Override
    public void handle(Long event) {
        this.distributionNotification();
        this.correctionNotification();
    }

    public void distributionNotification() {
        // find subject scheduled doesn't notified
        final String query = "SELECT ss.id, ss.owner, ss.owner_username, ss.title, ss.begin_date, ss.due_date, array_to_json(array_agg(sc.owner)) AS owners, ss.locale " +
                " FROM exercizer.subject_scheduled AS ss INNER JOIN exercizer.subject_copy as sc ON ss.id=sc.subject_scheduled_id" +
                " WHERE ss.is_notify = false GROUP BY ss.id";

        sql.prepared(query, new JsonArray(), SqlResult.validResultHandler(new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                if (event.isRight()) {
                    final JsonArray result = event.right().getValue();

                    if (result != null && result.size() > 0) {
                        final Date nowUTC = new DateTime(DateTimeZone.UTC).toLocalDateTime().toDate();
                        for (Object r : result) {
                            if (!(r instanceof JsonObject)) continue;
                            final JsonObject scheduledSubject = (JsonObject) r;

                            // check begin_date for ,otify
                            Date beginDate = null;
                            Date dueDate = null;
                            try {
                                beginDate = DateUtils.parseTimestampWithoutTimezone(scheduledSubject.getString("begin_date"));
                                dueDate = DateUtils.parseTimestampWithoutTimezone(scheduledSubject.getString("due_date"));
                            } catch (ParseException e) {
                                log.error("[CRON Exerciser] Can't parse begin date or due date of scheduled subject", e);

                            }

                            if (beginDate != null && dueDate != null) {
                                final Boolean isNotify = DateUtils.lessOrEqualsWithoutTime(beginDate, nowUTC);

                                if (isNotify) {
                                    final String dueDateFormat = DateUtils.format(dueDate);
                                    final String dueTimeFormat = DateUtils.format(dueDate, "HH:mm");
                                    final String beginDateFormat = DateUtils.format(dueDate);
                                    final String beginTimeFormat = DateUtils.format(dueDate, "HH:mm");

                                    final String query =
                                            "UPDATE exercizer.subject_scheduled " +
                                                    " SET is_notify=TRUE, modified = NOW() " +
                                                    "WHERE id = ? ";

                                    final JsonArray values = new JsonArray();
                                    values.add(scheduledSubject.getLong("id"));

                                    sql.prepared(query, values, SqlResult.validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
                                        @Override
                                        public void handle(Either<String, JsonObject> event) {
                                            if (event.isRight()) {

                                                final String subjectName = scheduledSubject.getString("title");

                                                final List<String> recipientSet = scheduledSubject.getJsonArray("owners").getList();

                                                final UserInfos user = new UserInfos();
                                                user.setUserId(scheduledSubject.getString("owner"));
                                                user.setUsername(scheduledSubject.getString("owner_username"));

                                                JsonObject params = new JsonObject();
                                                params.put("uri", pathPrefix + "#/dashboard/student");
                                                params.put("userUri", "/userbook/annuaire#" + user.getUserId());
                                                params.put("username", user.getUsername());
                                                params.put("subjectName", subjectName);
                                                params.put("dueDate", dueDateFormat);
                                                params.put("dueTime", dueTimeFormat);
                                                params.put("beginDate", beginDateFormat);
                                                params.put("beginTime", beginTimeFormat);
                                                params.put("resourceUri", params.getString("uri"));

                                                JsonObject pushNotif = new JsonObject()
                                                        .put("title", "exercizer.assigncopy")
                                                        .put("body", I18n.getInstance()
                                                                .translate(
                                                                        "exercizer.push.notif.assigncopy",
                                                                        I18n.DEFAULT_DOMAIN,
                                                                        scheduledSubject.getString("locale", Locale.FRANCE.getLanguage()),
                                                                        user.getUsername(),
                                                                        subjectName,
                                                                        dueDateFormat
                                                                )
                                                        );
                                                params.put("pushNotif", pushNotif);

                                                timelineHelper.notifyTimeline(new JsonHttpServerRequest(new JsonObject()
                                                        .put("headers", new JsonObject().put("Accept-Language", scheduledSubject.getString("locale", Locale.FRANCE.getLanguage())))), "exercizer.assigncopy", user, recipientSet, null, params);
                                            } else {
                                                log.error("[CRON Exerciser] Can't update scheduled subject : " + event.left().getValue());
                                            }
                                        }
                                    }));
                                }
                            }
                        }
                    }
                } else {
                    log.error(event.left().getValue());
                }
            }
        }, "owners"));
    }

    public void correctionNotification() {
        final String query = "SELECT id, owner, owner_username, title, locale " +
                " FROM exercizer.subject_scheduled " +
                " WHERE corrected_date < NOW() AND NOT correction_notify GROUP BY id";

        sql.prepared(query, new JsonArray(), SqlResult.validResultHandler(new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                if (event.isRight()) {
                    final JsonArray result = event.right().getValue();
                    for (Object r : result) {
                        if (!(r instanceof JsonObject)) continue;
                        final JsonObject scheduledSubject = (JsonObject) r;
                        final Long id = scheduledSubject.getLong("id");
                        final String subjectName = scheduledSubject.getString("title");
                        final String locale = scheduledSubject.getString("locale", Locale.FRANCE.getLanguage());

                        subjectScheduledService.getMember(id.toString(), new Handler<Either<String, JsonArray>>() {
                            @Override
                            public void handle(Either<String, JsonArray> event) {
                                if (event.isRight()) {

                                    final JsonArray members = event.right().getValue();
                                    final List<String> recipientSet = new ArrayList<String>();

                                    for (Object member : members) {
                                        if (!(member instanceof JsonObject)) continue;
                                        recipientSet.add(((JsonObject) member).getString("owner"));
                                    }

                                    SqlStatementsBuilder ssb = new SqlStatementsBuilder();

                                    String query1 = "UPDATE exercizer.subject_copy " +
                                            "SET is_corrected = TRUE, modified = NOW() " +
                                            "WHERE subject_scheduled_id = ?";
                                    ssb.prepared(query1, new JsonArray().add(id));

                                    String query2 = "UPDATE exercizer.subject_scheduled " +
                                            "SET correction_notify = TRUE, modified = NOW() " +
                                            "WHERE id = ?";
                                    ssb.prepared(query2, new JsonArray().add(id));

                                    sql.transaction(ssb.build(), SqlResult.validRowsResultHandler(either -> {
                                        if (either.isRight()) {

                                            final UserInfos user = new UserInfos();
                                            user.setUserId(scheduledSubject.getString("owner"));
                                            user.setUsername(scheduledSubject.getString("owner_username"));

                                            JsonObject params = new JsonObject();
                                            params.put("uri", pathPrefix + "#/dashboard/student");
                                            params.put("userUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
                                            params.put("username", user.getUsername());
                                            params.put("subjectName", subjectName);
                                            params.put("resourceUri", params.getString("uri"));

                                            JsonObject pushNotif = new JsonObject()
                                                    .put("title", "exercizer.correcthomework")
                                                    .put("body", I18n.getInstance().translate(
                                                            "exercizer.push.notif.correcthomework.submit.body",
                                                            I18n.DEFAULT_DOMAIN,
                                                            locale,
                                                            user.getUsername(),
                                                            subjectName
                                                    ));
                                            params.put("pushNotif", pushNotif);

                                            timelineHelper.notifyTimeline(new JsonHttpServerRequest(new JsonObject()
                                                    .put("headers", new JsonObject().put("Accept-Language", locale))),
                                                    "exercizer.correcthomework", user, recipientSet, null, params);

                                        } else {
                                            log.error("[CRON Exercizer] Can't set is_corrected to scheduled subject : " + either.left().getValue());
                                        }
                                    }));

                                } else {
                                    log.error("[CRON Exercizer] Can't get scheduled subject members : " + event.left().getValue());
                                }
                            }
                        });
                    }
                }
            }
        }));
    }
}