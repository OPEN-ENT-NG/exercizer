package org.openent.exercizer;

import com.opendigitaleducation.explorer.tests.ExplorerTestHelper;
import fr.openent.exercizer.events.ExercizerRepositoryEvents;
import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.services.impl.ExercizerStorage;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.explorer.IExplorerPluginCommunication;
import org.entcore.common.explorer.impl.ExplorerRepositoryEvents;
import org.entcore.common.postgres.PostgresClient;
import org.entcore.common.share.ShareService;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import org.entcore.common.storage.impl.FileStorage;
import org.entcore.common.user.UserInfos;
import org.entcore.test.TestHelper;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.testcontainers.containers.Neo4jContainer;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.HashMap;
import java.util.Map;

@RunWith(VertxUnitRunner.class)
public class ExercizerRepositoryEventTest {
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
        exercizerPlugin = new ExercizerExplorerPlugin(communication, pgClient, securedActions);
        exercizerService = new SubjectServiceSqlImpl(exercizerPlugin);
        shareService = exercizerPlugin.createPostgresShareService("exercizer", "subject_shares", test.vertx().eventBus(), securedActions, null);
        final Storage storage = new StorageFactory(test.vertx(), new JsonObject(), new ExercizerStorage()).getStorage();
        repositoryEvents = new ExplorerRepositoryEvents(exercizerPlugin, new ExercizerRepositoryEvents(new HashMap<>(),"",test.vertx(), storage));
    }


    /**
     * <b>This test assert that a subject is upserted in OpenSearch when a resource is imported through RepositoryEvent</b>
     * <ul>
     *     <li>Import a subject for user</li>
     *     <li>Wait for pending index tasks</li>
     *     <li>Assert that the subject has been created</li>
     * </ul>
     *
     * @param context
     */
    @Test
    public void shouldUpsertOnImport(TestContext context) {
        final Async async = context.async();
        final String importPath = this.getClass().getClassLoader().getResource("import/").getPath();
        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch0 -> {
            context.assertEquals(0, fetch0.size());
            repositoryEvents.importResources("id", user.getUserId(), "user1", "user1", importPath, "fr", "host", false, onFinish -> {
                exercizerPlugin.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(r3 -> {
                    explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                            context.assertEquals(1, fetch1.size());
                            async.complete();
                        }));
                    }));
                }));
            });
        }));
    }

    /**
     * <b>This test assert that a subject is deleted in OpenSearch when the owner is deleted through RepositoryEvent</b>
     * <ul>
     *     <li>Create a subject1 for user1</li>
     *     <li>Wait for pending index tasks</li>
     *     <li>Delete owner</li>
     *     <li>Assert that subject is deleted</li>
     * </ul>
     *
     * @param context
     */
    @Test
    public void shouldDeleteOnDeleteOwner(TestContext context) {
    }

    /**
     * <b>This test assert that a subject is upsert in OpenSearch when a shared user is deleted through RepositoryEvent</b>
     * <ul>
     *     <li>Create a subject2 for user2</li>
     *     <li>Share a subject2 to user3</li>
     *     <li>Wait for pending index tasks</li>
     *     <li>Delete user3</li>
     *     <li>Assert that subject (shared) are upserted</li>
     * </ul>
     *
     * @param context
     */
    @Test
    public void shouldUpsertOnDeleteUser(TestContext context) {
    }

    /**
     * <b>This test assert that a subject is upsert in OpenSearch when a shared user is deleted through RepositoryEvent</b>
     * <ul>
     *     <li>Create a subject3 for user3</li>
     *     <li>Share a subject3 to group1</li>
     *     <li>Wait for pending index tasks</li>
     *     <li>Delete group1</li>
     *     <li>Assert that subject (shared) are upserted</li>
     * </ul>
     *
     * @param context
     */
    @Test
    public void shouldUpsertOnDeleteGroup(TestContext context) {
    }
}

