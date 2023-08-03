package org.openent.exercizer;

import com.opendigitaleducation.explorer.tests.ExplorerTestHelper;
import fr.openent.exercizer.Exercizer;
import fr.openent.exercizer.events.ExercizerRepositoryEvents;
import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.services.impl.ExercizerStorage;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import io.vertx.sqlclient.Tuple;
import org.entcore.common.explorer.IExplorerPluginClient;
import org.entcore.common.explorer.IExplorerPluginCommunication;
import org.entcore.common.explorer.impl.ExplorerRepositoryEvents;
import org.entcore.common.postgres.PostgresClient;
import org.entcore.common.share.ShareService;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import org.entcore.common.storage.impl.FileStorage;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.Config;
import org.entcore.test.TestHelper;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;
import org.testcontainers.containers.Neo4jContainer;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RunWith(VertxUnitRunner.class)
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ExercizerRepositoryEventTest {
    static Logger log = LoggerFactory.getLogger(ExercizerRepositoryEventTest.class);
    static final String RIGHT = "fr-openent-exercizer-controllers-SubjectController|grainList";
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
    static ExplorerRepositoryEvents repositoryEvents;
    static PostgresClient pgClient;
    @BeforeClass
    public static void setUp(TestContext context) throws Exception {
        test.database().initNeo4j(context, neo4jContainer);
        user.setLogin("user1");
        user2.setLogin("user2");
        user3.setLogin("user3");
        explorerTest.start(context);
        test.database().initPostgreSQL(context, pgContainer, "exercizer");
        pgClient = test.database().createPgClient(pgContainer);
        final Map<String, SecuredAction> securedActions = test.share().getSecuredActions(context);
        final IExplorerPluginCommunication communication = explorerTest.getCommunication();
        final Vertx vertx = communication.vertx();
        exercizerPlugin = new ExercizerExplorerPlugin(communication, pgClient, securedActions);
        exercizerService = new SubjectServiceSqlImpl(exercizerPlugin);
        shareService = exercizerPlugin.createPostgresShareService("exercizer", "subject_shares", vertx.eventBus(), securedActions, null);
        final Storage storage = new StorageFactory(vertx, new JsonObject(), new ExercizerStorage()).getStorage();
        final IExplorerPluginClient mainClient = IExplorerPluginClient.withBus(vertx, Exercizer.APPLICATION, Exercizer.SUBJECT_TYPE);
        final Map<String, IExplorerPluginClient> pluginClientPerCollection = new HashMap<>();
        pluginClientPerCollection.put(Exercizer.SUBJECT_TYPE, mainClient);
        // init conf before repositoryevent
        Config.getInstance().setConfig(new JsonObject().put("path-prefix", "exercizer"));
        repositoryEvents = new ExplorerRepositoryEvents(new ExercizerRepositoryEvents(securedActions, "exercizer.manager", vertx, storage), pluginClientPerCollection, mainClient);
        exercizerPlugin.start();
    }

    /**
     * <b>This test assert that a subject is upserted in OpenSearch when a resource is imported through RepositoryEvent</b>
     * <ul>
     *     <li>Import a subject for user1</li>
     *     <li>Wait for pending index tasks</li>
     *     <li>Assert that the subject has been created</li>
     * </ul>
     *
     * @param context
     */
    @Test
    public void step1ShouldUpsertOnImport(TestContext context) {
        final Async async = context.async();
        final String importPath = this.getClass().getClassLoader().getResource("import/Exercizer/").getPath();
        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch0 -> {
            context.assertEquals(0, fetch0.size());
            repositoryEvents.importResources("id", user.getUserId(), "user1", "user1", importPath, "fr", "host", false, onFinish -> {
            });
        }));
        repositoryEvents.setOnReindex(context.asyncAssertSuccess(e -> {
            exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3 -> {
                explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                    explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                        log.info("Number of subject visible after import:" + fetch1.size());
                        context.assertEquals(1, fetch1.size());
                        final String id = fetch1.getJsonObject(0).getString("assetId");
                        context.assertNotNull(id);
                        data.put("ID1", id);
                        async.complete();
                    }));
                }));
            }));
        }));
    }

    /**
     * <b>This test assert that a subject1 has been shared to group1</b>
     * <ul>
     *     <li>Create user2</li>
     *     <li>Create group1</li>
     *     <li>Add user2 to group1</li>
     *     <li>Share subject1 to group1</li>
     *     <li>Wait for pending index tasks</li>
     *     <li>Assert that the subject1 has been shared to group1</li>
     * </ul>
     *
     * @param context
     */
    @Test
    public void step2ShouldShareSubjectToGroup1(TestContext context) {
        final Async async = context.async(3);
        final UserInfos user2 = test.directory().generateUser("user2", "group1");
        user2.setLogin("user2");
        final String subjectId = (String) data.get("ID1");
        test.directory().createActiveUser(user2).compose(e -> {
            //load documents
            return test.directory().createGroup("group1", "group1").compose(ee -> {
                return test.directory().attachUserToGroup("user2", "group1");
            }).compose(ee -> {
                return explorerTest.fetch(user2, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                    context.assertEquals(0, fetch1.size());
                }));
            });
        }).compose(e -> {
            final JsonObject shareUser = test.share().createShareForGroup("group1", Arrays.asList(RIGHT));
            return shareService.share(user, subjectId, shareUser, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(share -> {
                context.assertTrue(share.containsKey("notify-timeline-array"));
                exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3 -> {
                    explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                        explorerTest.fetch(user2, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            log.info("Number of subject visible after sgare to group1:" + fetch1.size());
                            context.assertEquals(1, fetch1.size());
                            context.assertTrue(fetch1.getJsonObject(0).getJsonArray("rights").contains("group:group1:read"));
                            async.complete();
                        }));
                    }));
                }));
            })));
        });
    }

    /**
     * <b>This test assert that a subject is not change in OpenSearch when a group in shares is deleted through RepositoryEvent (only subject_scheduled and subject_copy are modified)</b>
     * <ul>
     *     <li>Assert that user2 see subject1 through group1</li>
     *     <li>Delete group1</li>
     *     <li>Wait for pending index tasks</li>
     *     <li>Assert that subject is still visible by user2</li>
     * </ul>
     *
     * @param context
     */
    @Test
    public void step3ShouldNotChangeOnDeleteGroup(TestContext context) {
        final Async async = context.async();
        final UserInfos user2 = test.directory().generateUser("user2", "group1");
        explorerTest.fetch(user2, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
            context.assertEquals(1, fetch1.size());
            context.assertTrue(fetch1.getJsonObject(0).getJsonArray("rights").contains("group:group1:read"));
            repositoryEvents.deleteGroups(new JsonArray().add(new JsonObject().put("group", "group1")));
        }));
        repositoryEvents.setOnReindex(context.asyncAssertSuccess(e -> {
            context.assertEquals(0, e.nbMessage);
            exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3 -> {
                explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                    explorerTest.fetch(user2, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                        log.info("Number of subject visible after delete group1:" + fetch1.size());
                        context.assertEquals(1, fetch1.size());
                        async.complete();
                    }));
                }));
            }));
        }));
    }

    /**
     * <b>This test assert that a subject1 has been shared to user3</b>
     * <ul>
     *     <li>Create user3</li>
     *     <li>Share subject1 to user3</li>
     *     <li>Wait for pending index tasks</li>
     *     <li>Assert that the subject1 has been shared to user3</li>
     * </ul>
     *
     * @param context
     */
    @Test
    public void step4ShouldShareSubjectToToUser3(TestContext context) {
        final Async async = context.async(3);
        final UserInfos user3 = test.directory().generateUser("user3", "group3");
        user3.setLogin("user3");
        final String subjectId = (String) data.get("ID1");
        test.directory().createActiveUser(user3).compose(e -> {
            //load documents
            return explorerTest.fetch(user3, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                context.assertEquals(0, fetch1.size());
            }));
        }).compose(e -> {
            final JsonObject shareUser = test.share().createShareForUser(user3.getUserId(), Arrays.asList(RIGHT));
            return shareService.share(user, subjectId, shareUser, test.asserts().asyncAssertSuccessEither(context.asyncAssertSuccess(share -> {
                context.assertTrue(share.containsKey("notify-timeline-array"));
                exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3 -> {
                    explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                        explorerTest.fetch(user3, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            log.info("Number of subject visible after share to user3:" + fetch1.size());
                            context.assertEquals(1, fetch1.size());
                            context.assertTrue(fetch1.getJsonObject(0).getJsonArray("rights").contains("user:user3:read"));
                            async.complete();
                        }));
                    }));
                }));
            })));
        });
    }

    /**
     * <b>This test assert that a subject is not change in OpenSearch when a user in shares is deleted through RepositoryEvent (only owner care)</b>
     * <ul>
     *     <li>Assert that user3 see subject1</li>
     *     <li>Delete user3</li>
     *     <li>Wait for pending index tasks</li>
     *     <li>Assert that subject is not visible anymore by user3</li>
     * </ul>
     *
     * @param context
     */
    @Test
    public void step5ShouldNotChangeOnDeleteUser(TestContext context) {
        final Async async = context.async();
        final UserInfos user3 = test.directory().generateUser("user3", "group3");
        explorerTest.fetch(user3, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
            context.assertEquals(1, fetch1.size());
            context.assertTrue(fetch1.getJsonObject(0).getJsonArray("rights").contains("user:user3:read"));
            repositoryEvents.deleteUsers(new JsonArray().add(new JsonObject().put("id", "user3")));
        }));
        repositoryEvents.setOnReindex(context.asyncAssertSuccess(e -> {
            context.assertEquals(0, e.nbMessage);
            exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3 -> {
                explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                    explorerTest.fetch(user3, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                        log.info("Number of subject visible after delete user3:" + fetch1.size());
                        context.assertEquals(1, fetch1.size());
                        async.complete();
                    }));
                }));
            }));
        }));
    }

    /**
     * <b>This test assert that a subject is upsert (trashed) in OpenSearch when the owner is deleted through RepositoryEvent</b>
     * <ul>
     *     <li>Assert that user1 see subject1</li>
     *     <li>Delete user</li>
     *     <li>Wait for pending index tasks</li>
     *     <li>Assert that subject is trashed</li>
     * </ul>
     *
     * @param context
     */
    @Test
    public void step6ShouldTrashOnDeleteOwner(TestContext context) {
        final Async async = context.async();
        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
            context.assertEquals(1, fetch1.size());
            context.assertFalse(fetch1.getJsonObject(0).getBoolean("trashed", false));
            repositoryEvents.deleteUsers(new JsonArray().add(new JsonObject().put("id", "user1")));
        }));
        repositoryEvents.setOnReindex(context.asyncAssertSuccess(e -> {
            exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3 -> {
                explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                    explorerTest.ingestJobWaitPending().onComplete(context.asyncAssertSuccess(r5 -> {
                        explorerTest.fetch(user, application, explorerTest.createSearch().setWaitFor(true)).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            log.info("Number of subject visible after delete owner:" + fetch1.size());
                            context.assertEquals(1, fetch1.size());
                            context.assertTrue(fetch1.getJsonObject(0).getBoolean("trashed", false));
                            async.complete();
                        }));
                    }));
                }));
            }));
        }));
    }
}
