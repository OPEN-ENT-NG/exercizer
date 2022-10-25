package org.openent.exercizer;

import com.opendigitaleducation.explorer.tests.ExplorerTestHelper;
import fr.openent.exercizer.Exercizer;
import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.explorer.IExplorerPluginCommunication;
import org.entcore.common.postgres.PostgresClient;
import org.entcore.common.share.ShareService;
import org.entcore.common.user.UserInfos;
import org.entcore.test.TestHelper;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.testcontainers.containers.Neo4jContainer;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.*;

@RunWith(VertxUnitRunner.class)
public class ExercizerExplorerPluginTest {
    static final String RIGHT = "fr-openent-exercizer-controllers-SubjectController|persist";
    private static final TestHelper test = TestHelper.helper();
    @ClassRule
    public static Neo4jContainer<?> neo4jContainer = test.database().createNeo4jContainer();
    @ClassRule
    public static ExplorerTestHelper explorerTest = new ExplorerTestHelper(ExercizerExplorerPlugin.APPLICATION);
    @ClassRule
    public static PostgreSQLContainer pgContainer = test.database().createPostgreSQLContainer().withReuse(true);
    static ISubjectService exercizerService;
    static ExercizerExplorerPlugin exercizerPlugin;
    static ShareService shareService;
    static final String application = ExercizerExplorerPlugin.APPLICATION;
    static final String resourceType = ExercizerExplorerPlugin.TYPE;
    static Map<String, Object> data = new HashMap<>();
    static final UserInfos user = test.directory().generateUser("user1");
    static final UserInfos user2 = test.directory().generateUser("user2");
    static final UserInfos user3 = test.directory().generateUser("user3");

    @BeforeClass
    public static void setUp(TestContext context) throws Exception {
        test.database().initNeo4j(context, neo4jContainer);
        user.setLogin("user1");
        user2.setLogin("user2");
        user3.setLogin("user3");
        explorerTest.start(context);
        test.database().initPostgreSQL(context, pgContainer, "exercizer");
        final PostgresClient pgClient = test.database().createPgClient(pgContainer);
        final Map<String, SecuredAction> securedActions = test.share().getSecuredActions(context);
        final IExplorerPluginCommunication communication = explorerTest.getCommunication();
        exercizerPlugin = new ExercizerExplorerPlugin(communication, pgClient);
        exercizerService = new SubjectServiceSqlImpl(exercizerPlugin);
        shareService = exercizerPlugin.createPostgresShareService("exercizer", "subject_shares", test.vertx().eventBus(), securedActions, null);
    }

    static List<String> getGroupUserIds(final UserInfos user){
        final List<String> groupUserIds = new ArrayList<>();
        groupUserIds.add(user.getUserId());
        groupUserIds.addAll(user.getGroupsIds());
        return groupUserIds;
    }

    static JsonObject createSubject(final String name) {
        final JsonObject exercizer = new JsonObject().put("type", "simple");
        exercizer.put("description", "desc_" + name).put("title", "title_" + name);
        exercizer.put("owner_username", user.getUsername()).put("owner", user.getUserId());
        return new JsonObject().put("grains", new JsonArray()).put("subject", exercizer);
    }

    @Test
    public void shouldCreateSubject(TestContext context) {
        final JsonObject payload1 = createSubject("exercizer1");
        final JsonObject sb1 = payload1.getJsonObject("subject");
        final Async async = context.async();
        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch0 -> {
            context.assertEquals(0, fetch0.size());
            exercizerService.persistSubjectGrains(payload1, user, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(r -> {
                exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3->{
                    explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            context.assertEquals(1, fetch1.size());
                            final JsonObject first = fetch1.getJsonObject(0);
                            context.assertEquals(sb1.getString("title"), first.getString("name"));
                            context.assertEquals(user.getUserId(), first.getString("creatorId"));
                            context.assertEquals(user.getUserId(), first.getString("updaterId"));
                            context.assertEquals(application, first.getString("application"));
                            context.assertEquals(resourceType, first.getString("resourceType"));
                            context.assertEquals(sb1.getString("description"), first.getString("contentHtml"));
                            context.assertEquals(user.getUsername(), first.getString("creatorName"));
                            context.assertEquals(user.getUsername(), first.getString("updaterName"));
                            context.assertFalse(first.getBoolean("public"));
                            context.assertFalse(first.getBoolean("trashed"));
                            context.assertNotNull(first.getNumber("createdAt"));
                            context.assertNotNull(first.getNumber("updatedAt"));
                            context.assertNotNull(first.getString("assetId"));
                            exercizerService.list(getGroupUserIds(user),user, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(list ->{
                                context.assertEquals(1, list.size());
                                final JsonObject firstDb = list.getJsonObject(0);
                                data.put("ID1", firstDb.getValue("id").toString());
                                context.assertEquals(sb1.getString("title"), firstDb.getString("title"));
                                context.assertEquals(sb1.getString("description"), firstDb.getString("description"));
                                context.assertEquals(sb1.getString("thumbnail"), firstDb.getString("thumbnail"));
                                context.assertEquals(sb1.getBoolean("trashed"), firstDb.getBoolean("trashed"));
                                context.assertEquals(first.getString("assetId"), firstDb.getValue("id").toString());
                                context.assertNotNull(firstDb.getString("created"));
                                context.assertNotNull(firstDb.getString("modified"));
                                context.assertEquals(user.getUserId(), firstDb.getString("owner"));
                                context.assertEquals(user.getUsername(), firstDb.getString("owner_username"));
                                async.complete();
                            })));
                        }));
                    }));
                }));
            })));
        }));
    }

    @Test
    public void shouldUpdateSubject(TestContext context) {
        final Async async = context.async();
        exercizerService.list(getGroupUserIds(user), user, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(list0 -> {
            context.assertEquals(1, list0.size());
            final JsonObject model = list0.getJsonObject(0);
            final String id = model.getValue("id").toString();
            context.assertNotNull(id);
            final JsonObject payload2 = createSubject("exercizer2");
            final JsonObject sb2 = payload2.getJsonObject("subject").put("id", Long.valueOf(id)).put("is_deleted", true);
            exercizerService.update(sb2, user2, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(update->{
                exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3-> {
                    explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            context.assertEquals(1, fetch1.size());
                            final JsonObject first = fetch1.getJsonObject(0);
                            context.assertEquals(sb2.getString("title"), first.getString("name"));
                            context.assertEquals(user.getUserId(), first.getString("creatorId"));
                            context.assertEquals(user2.getUserId(), first.getString("updaterId"));
                            context.assertEquals(application, first.getString("application"));
                            context.assertEquals(resourceType, first.getString("resourceType"));
                            context.assertEquals(sb2.getString("description"), first.getString("contentHtml"));
                            context.assertEquals(user.getUsername(), first.getString("creatorName"));
                            context.assertEquals(user2.getUsername(), first.getString("updaterName"));
                            context.assertNotNull(first.getNumber("createdAt"));
                            context.assertNotNull(first.getNumber("updatedAt"));
                            context.assertEquals(id, first.getString("assetId"));
                            context.assertTrue(first.getBoolean("trashed"));
                            exercizerService.listAll(getGroupUserIds(user),user, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(list ->{
                                context.assertEquals(1, list.size());
                                final JsonObject firstDb = list.getJsonObject(0);
                                context.assertEquals(sb2.getString("title"), firstDb.getString("title"));
                                context.assertEquals(sb2.getString("description"), firstDb.getString("description"));
                                context.assertEquals(first.getString("assetId"), firstDb.getValue("id").toString());
                                context.assertNotNull(firstDb.getString("created"));
                                context.assertNotNull(firstDb.getString("modified"));
                                context.assertTrue(firstDb.getBoolean("is_deleted"));
                                context.assertEquals(user.getUserId(), firstDb.getString("owner"));
                                context.assertEquals(user.getUsername(), firstDb.getString("owner_username"));
                                async.complete();
                            })));
                        }));
                    }));
                }));
            })));
        })));
    }

    @Test
    public void shouldExploreSubjectByUser(TestContext context) {
        final Async async = context.async(3);
        final UserInfos user1 = test.directory().generateUser("user_share1", "group_share1");
        user1.setLogin("user1");
        final String exercizerId = (String) data.get("ID1");
        test.directory().createActiveUser(user1).compose(e->{
            //load documents
            return explorerTest.fetch(user1, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                context.assertEquals(0, fetch1.size());
            }));
        }).compose(e->{
            final JsonObject shareUser = test.share().createShareForUser(user1.getUserId(), Arrays.asList(RIGHT));
            return shareService.share(user, exercizerId, shareUser, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(share->{
                context.assertTrue(share.containsKey("notify-timeline-array"));
                exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3-> {
                    explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                        explorerTest.fetch(user1, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            context.assertEquals(1, fetch1.size());
                            exercizerPlugin.getShareInfo(exercizerId).onComplete(context.asyncAssertSuccess(shareEvt->{
                                context.assertEquals(1, shareEvt.size());
                                context.assertTrue(shareEvt.getJsonObject(0).containsKey("userId"));
                                async.complete();
                            }));
                        }));
                    }));
                }));
            })));
        });
    }

    //@Test
    public void shouldExploreSubjectByGroup(TestContext context) {
        final Async async = context.async(3);
        final UserInfos user2 = test.directory().generateUser("user_share2", "group_share2");
        user2.setLogin("user2");
        final String exercizerId = (String) data.get("ID1");
        test.directory().createActiveUser(user2).compose(e->{
            //load documents
            return test.directory().createGroup("group_share2", "group_share2").compose(ee->{
                return test.directory().attachUserToGroup("user_share2", "group_share2");
            }).compose(ee->{
                return explorerTest.fetch(user2, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                    context.assertEquals(0, fetch1.size());
                }));
            });
        }).compose(e->{
            final JsonObject shareUser = test.share().createShareForGroup("group_share2", Arrays.asList(RIGHT));
            return shareService.share(user, exercizerId, shareUser, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(share->{
                context.assertTrue(share.containsKey("notify-timeline-array"));
                exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3-> {
                    explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                        explorerTest.fetch(user2, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            context.assertEquals(1, fetch1.size());
                            exercizerPlugin.getShareInfo(exercizerId).onComplete(context.asyncAssertSuccess(shareEvt->{
                                context.assertEquals(1, shareEvt.size());
                                context.assertTrue(shareEvt.getJsonObject(0).containsKey("groupId"));
                                async.complete();
                            }));
                        }));
                    }));
                }));
            })));
        });
    }

    @Test
    public void shouldDeleteSubject(TestContext context) {
        final Async async = context.async();
        exercizerService.listAll(getGroupUserIds(user), user, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(list -> {
            context.assertEquals(1, list.size());
            final JsonObject firstDb = list.getJsonObject(0);
            final String id = firstDb.getValue("id").toString();
            context.assertNotNull(id);
            exercizerService.remove(new JsonArray().add(id),user2, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(update->{
                exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3-> {
                    explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            context.assertEquals(0, fetch1.size());
                            async.complete();
                        }));
                    }));
                }));
            })));
        })));
    }

    @Test
    public void shouldCreateSubjectUsingPersist(TestContext context) {
        final JsonObject payload1 = createSubject("exercizer1");
        final JsonObject sb1 = payload1.getJsonObject("subject");
        final Async async = context.async();
        explorerTest.fetch(user3, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch0 -> {
            context.assertEquals(0, fetch0.size());
            exercizerService.persist(sb1, user3, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(r -> {
                exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3->{
                    explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                        explorerTest.fetch(user3, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            context.assertEquals(1, fetch1.size());
                            final JsonObject first = fetch1.getJsonObject(0);
                            context.assertEquals(sb1.getString("title"), first.getString("name"));
                            context.assertEquals(user3.getUserId(), first.getString("creatorId"));
                            context.assertEquals(user3.getUserId(), first.getString("updaterId"));
                            context.assertEquals(application, first.getString("application"));
                            context.assertEquals(resourceType, first.getString("resourceType"));
                            context.assertEquals(sb1.getString("description"), first.getString("contentHtml"));
                            context.assertEquals(user3.getUsername(), first.getString("creatorName"));
                            context.assertEquals(user3.getUsername(), first.getString("updaterName"));
                            context.assertFalse(first.getBoolean("public"));
                            context.assertFalse(first.getBoolean("trashed"));
                            context.assertNotNull(first.getNumber("createdAt"));
                            context.assertNotNull(first.getNumber("updatedAt"));
                            context.assertNotNull(first.getString("assetId"));
                            exercizerService.list(getGroupUserIds(user3),user3, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(list ->{
                                context.assertEquals(1, list.size());
                                final JsonObject firstDb = list.getJsonObject(0);
                                data.put("ID1", firstDb.getValue("id").toString());
                                context.assertEquals(sb1.getString("title"), firstDb.getString("title"));
                                context.assertEquals(sb1.getString("description"), firstDb.getString("description"));
                                context.assertEquals(sb1.getString("thumbnail"), firstDb.getString("thumbnail"));
                                context.assertEquals(sb1.getBoolean("trashed"), firstDb.getBoolean("trashed"));
                                context.assertEquals(first.getString("assetId"), firstDb.getValue("id").toString());
                                context.assertNotNull(firstDb.getString("created"));
                                context.assertNotNull(firstDb.getString("modified"));
                                context.assertEquals(user3.getUserId(), firstDb.getString("owner"));
                                context.assertEquals(user3.getUsername(), firstDb.getString("owner_username"));
                                async.complete();
                            })));
                        }));
                    }));
                }));
            })));
        }));
    }

/*
    @Test
    duplicate seems to not work historically
    public void shouldDuplicateSubject(TestContext context) {
        final Async async = context.async();
        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch0 -> {
            context.assertEquals(1, fetch0.size());
            final JsonObject first = fetch0.getJsonObject(0);
            final JsonArray ids = new JsonArray().add(Long.valueOf(first.getString("assetId")));
            exercizerService.duplicateSubjects(ids, null,"suffix",user, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(r -> {
                exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3->{
                    explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            context.assertEquals(2, fetch1.size());
                            async.complete();
                        }));
                    }));
                }));
            })));
        }));
    }
 */

}
