package org.openent.exercizer;

import com.opendigitaleducation.explorer.tests.ExplorerTestHelper;
import fr.openent.exercizer.Exercizer;
import fr.openent.exercizer.explorer.ExercizerExplorerPlugin;
import fr.openent.exercizer.services.ISubjectService;
import fr.openent.exercizer.services.impl.SubjectServiceSqlImpl;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.explorer.IExplorerFolderTree;
import org.entcore.common.explorer.IExplorerPluginClient;
import org.entcore.common.explorer.IExplorerPluginCommunication;
import org.entcore.common.postgres.PostgresClient;
import org.entcore.common.user.UserInfos;
import org.entcore.test.TestHelper;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.*;

@RunWith(VertxUnitRunner.class)
public class ExercizerExplorerPluginClientTest {
    @ClassRule
    public static final ExplorerTestHelper explorerTest = new ExplorerTestHelper(ExercizerExplorerPlugin.APPLICATION);
    private static final TestHelper test = explorerTest.getTestHelper();

    @ClassRule
    public static PostgreSQLContainer pgContainer = test.database().createPostgreSQLContainer().withReuse(true);
    static final String application = ExercizerExplorerPlugin.APPLICATION;
    static final String resourceType = ExercizerExplorerPlugin.TYPE;
    static ISubjectService exercizerService;
    static ExercizerExplorerPlugin exercizerPlugin;
    static Map<String, Object> data = new HashMap<>();
    static final UserInfos admin = test.directory().generateUser("admin");
    static final UserInfos user = test.directory().generateUser("user1");
    static final UserInfos user2 = test.directory().generateUser("user2");
    static PostgresClient pgClient;
    static IExplorerPluginClient client;

    @BeforeClass
    public static void setUp(TestContext context) throws Exception {
        user.setLogin("user1");
        user2.setLogin("user2");
        explorerTest.start(context);
        final Map<String, SecuredAction> securedActions = test.share().getSecuredActions(context);
        final Async onInitPg = test.database().initPostgreSQL(context, pgContainer, "exercizer");
        final IExplorerPluginCommunication communication = explorerTest.getCommunication();
        pgClient = test.database().createPgClient(pgContainer);
        exercizerPlugin = new ExercizerExplorerPlugin(communication, pgClient, securedActions);
        exercizerService = new SubjectServiceSqlImpl(exercizerPlugin);
        exercizerPlugin.start();
        client = IExplorerPluginClient.withBus(test.vertx(), application, resourceType);
        final Async async = context.async();
        onInitPg.handler(onFInish -> {
            explorerTest.initFolderMapping().onComplete(context.asyncAssertSuccess(e -> {
                saveUser(user).onComplete(context.asyncAssertSuccess(ee->{
                    saveUser(user2).onComplete(context.asyncAssertSuccess(eee->{
                        async.complete();
                    }));
                }));
            }));
        });
    }

    @AfterClass
    public static void tearDown(TestContext context) {
        exercizerPlugin.stop();
    }

    static JsonObject createFolder(final String name, final UserInfos user, final Optional<Integer> parentId) {
        final JsonObject folder = new JsonObject().put("label", name);
        folder.put("owner", user.getUserId());
        if (parentId.isPresent()) {
            folder.put("parent_folder_id", parentId.get());
        }
        return folder;
    }

    static Future<JsonObject> saveFolder(final String name, final UserInfos user, final Optional<Integer> parentId, final Integer... ids) {
        final JsonObject json = createFolder(name, user, parentId);
        final Set<Integer> idSet = new HashSet<>(Arrays.asList(ids));
        return pgClient.getClientPool().insert(Exercizer.FOLDER_TABLE, json).compose(folder -> {
            final JsonObject update = new JsonObject().put("folder_id", folder.getValue("id"));
            return pgClient.getClientPool().update(Exercizer.SUBJECT_TABLE, update, idSet).map(result -> {
                return folder;
            });
        });
    }

    static Future<JsonObject> saveUser(final UserInfos user) {
        final JsonObject json = new JsonObject().put("id",user.getUserId()).put("username", user.getUsername());
        return pgClient.getClientPool().insert(Exercizer.USER_TABLE, json);
    }

    static JsonObject createSubject(final String name, final UserInfos user) {
        final JsonObject exercizer = new JsonObject().put("type", "simple");
        exercizer.put("description", "desc_" + name).put("title", "title_" + name);
        exercizer.put("owner_username", user.getUsername()).put("owner", user.getUserId());
        return exercizer;
    }

    static Future<JsonObject> saveSubject(final String name, final UserInfos user) {
        final JsonObject json = createSubject(name, user);
        final Future<JsonObject> promise = pgClient.getClientPool().insert(Exercizer.SUBJECT_TABLE, json);
        return promise;
    }

    @Test
    public void shouldMigrateSubject(TestContext context) {
        final Async async = context.async();
        explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch0 -> {
            context.assertEquals(0, fetch0.size());
            explorerTest.fetch(user2, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch1 -> {
                context.assertEquals(0, fetch1.size());
                saveSubject("exercizer1", user).compose(exercizer1 -> {
                    final Integer exercizer1Id = exercizer1.getInteger("id");
                    return saveSubject("exercizer2", user2).compose(exercizer2 -> {
                        return saveSubject("exercizer3", user).compose(exercizer3 -> {
                            final Integer exercizer3Id = exercizer3.getInteger("id");
                            return saveFolder("folder1", user, Optional.empty()).compose(folder1 -> {
                                final Integer folder1Id = folder1.getInteger("id");
                                return saveFolder("folder2", user, Optional.ofNullable(folder1Id), exercizer3Id).compose(folder2 -> {
                                    return client.getForIndexation(admin, Optional.empty(), Optional.empty(), new HashSet<>(), true).onComplete(context.asyncAssertSuccess(indexation -> {
                                        context.assertEquals(3, indexation.nbBatch);
                                        context.assertEquals(3, indexation.nbMessage);
                                        explorerTest.getCommunication().waitPending().onComplete(context.asyncAssertSuccess(pending -> {
                                            explorerTest.ingestJobExecute(true).onComplete(context.asyncAssertSuccess(r4 -> {
                                                explorerTest.fetch(user, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch2 -> {
                                                    explorerTest.fetch(user2, application, explorerTest.createSearch()).onComplete(context.asyncAssertSuccess(fetch3 -> {
                                                        explorerTest.fetchFolders(user, application, Optional.empty()).onComplete(context.asyncAssertSuccess(folders -> {
                                                            System.out.println(folders);
                                                            context.assertEquals(1, folders.size());
                                                            final JsonObject fol1 = folders.getJsonObject(0);
                                                            final JsonArray childrenIds = fol1.getJsonArray("childrenIds");
                                                            //final String parentId = childrenIds.getValue(0).toString();
                                                            final String folder1IdInt = fol1.getValue("_id").toString();
                                                            explorerTest.fetchFolders(user, application, Optional.of(folder1IdInt)).onComplete(context.asyncAssertSuccess(subfolders -> {
                                                                System.out.println(subfolders);
                                                                final JsonObject fol2 = subfolders.getJsonObject(0);
                                                                final String folder2IdInt = fol2.getValue("_id").toString();
                                                                explorerTest.fetch(user, application, explorerTest.createSearch().setParentId(folder2IdInt)).onComplete(context.asyncAssertSuccess(fetch4 -> {
                                                                    System.out.println(fetch4);
                                                                    {
                                                                        //check folders
                                                                        context.assertEquals(folder1.getString("label"), fol1.getString("name"));
                                                                        context.assertEquals(user.getUserId(), fol1.getString("creatorId"));
                                                                        context.assertEquals(application, fol1.getString("application"));
                                                                        context.assertEquals(IExplorerFolderTree.FOLDER_TYPE, fol1.getString("resourceType"));
                                                                        //username is not saved
                                                                        context.assertEquals(user.getUsername(), fol1.getString("creatorName"));
                                                                        context.assertNotNull(fol1.getNumber("createdAt"));
                                                                        //check subfolder
                                                                        context.assertEquals(1, subfolders.size());
                                                                        final JsonObject sfol1 = subfolders.getJsonObject(0);
                                                                        context.assertEquals(folder2.getString("label"), sfol1.getString("name"));
                                                                        context.assertEquals(user.getUserId(), sfol1.getString("creatorId"));
                                                                        context.assertEquals(application, sfol1.getString("application"));
                                                                        context.assertEquals(IExplorerFolderTree.FOLDER_TYPE, sfol1.getString("resourceType"));
                                                                        context.assertEquals(user.getUsername(), sfol1.getString("creatorName"));
                                                                        context.assertNotNull(sfol1.getNumber("createdAt"));
                                                                        //check resources
                                                                        System.out.println(fetch2);
                                                                        context.assertEquals(1, fetch2.size());
                                                                        final JsonObject model = fetch2.getJsonObject(0);
                                                                        context.assertEquals(exercizer1.getString("title"), model.getString("name"));
                                                                        context.assertEquals(user.getUserId(), model.getString("creatorId"));
                                                                        context.assertEquals(user.getUserId(), model.getString("updaterId"));
                                                                        context.assertEquals(application, model.getString("application"));
                                                                        context.assertEquals(resourceType, model.getString("resourceType"));
                                                                        context.assertEquals(exercizer1.getString("description"), model.getString("contentHtml"));
                                                                        context.assertEquals(user.getUsername(), model.getString("creatorName"));
                                                                        context.assertEquals(user.getUsername(), model.getString("updaterName"));
                                                                        context.assertFalse(model.getBoolean("public"));
                                                                        context.assertFalse(model.getBoolean("trashed"));
                                                                        context.assertNotNull(model.getNumber("createdAt"));
                                                                        context.assertNotNull(model.getNumber("updatedAt"));
                                                                        context.assertNotNull(model.getString("assetId"));
                                                                    }
                                                                    {
                                                                        System.out.println(fetch3);
                                                                        context.assertEquals(1, fetch3.size());
                                                                        final JsonObject model = fetch3.getJsonObject(0);
                                                                        context.assertEquals(exercizer2.getString("title"), model.getString("name"));
                                                                        context.assertEquals(user2.getUserId(), model.getString("creatorId"));
                                                                        //context.assertEquals(user2.getUserId(), model.getString("updaterId"));
                                                                        context.assertEquals(application, model.getString("application"));
                                                                        context.assertEquals(resourceType, model.getString("resourceType"));
                                                                        context.assertEquals(exercizer2.getString("description"), model.getString("contentHtml"));
                                                                        context.assertEquals(user2.getUsername(), model.getString("creatorName"));
                                                                        context.assertEquals(user2.getUsername(), model.getString("updaterName"));
                                                                        context.assertFalse(model.getBoolean("public"));
                                                                        context.assertFalse(model.getBoolean("trashed"));
                                                                        context.assertNotNull(model.getNumber("createdAt"));
                                                                        context.assertNotNull(model.getNumber("updatedAt"));
                                                                        context.assertNotNull(model.getString("assetId"));
                                                                    }
                                                                    {
                                                                        context.assertEquals(1, fetch4.size());
                                                                        final JsonObject model = fetch4.getJsonObject(0);
                                                                        context.assertEquals(exercizer3.getString("title"), model.getString("name"));
                                                                        context.assertEquals(user.getUserId(), model.getString("creatorId"));
                                                                        //context.assertEquals(user2.getUserId(), model.getString("updaterId"));
                                                                        context.assertEquals(application, model.getString("application"));
                                                                        context.assertEquals(resourceType, model.getString("resourceType"));
                                                                        context.assertEquals(exercizer3.getString("description"), model.getString("contentHtml"));
                                                                        context.assertEquals(user.getUsername(), model.getString("creatorName"));
                                                                        context.assertEquals(user.getUsername(), model.getString("updaterName"));
                                                                        context.assertFalse(model.getBoolean("public"));
                                                                        context.assertFalse(model.getBoolean("trashed"));
                                                                        context.assertNotNull(model.getNumber("createdAt"));
                                                                        context.assertNotNull(model.getNumber("updatedAt"));
                                                                        context.assertNotNull(model.getString("assetId"));
                                                                    }
                                                                }));
                                                            }));
                                                        }));
                                                    }));
                                                }));
                                            }));
                                        }));
                                    }));
                                });
                            });
                        });
                    });
                }).onComplete(context.asyncAssertSuccess(e -> {
                    async.complete();
                }));
            }));
        }));
    }
}
