package fr.openent.exercizer.explorer;

import fr.openent.exercizer.Exercizer;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import org.entcore.common.explorer.ExplorerMessage;
import org.entcore.common.explorer.ExplorerPluginFactory;
import org.entcore.common.explorer.IExplorerPlugin;
import org.entcore.common.explorer.IExplorerPluginCommunication;
import org.entcore.common.explorer.impl.ExplorerPluginResourceSql;
import org.entcore.common.postgres.PostgresClient;
import org.entcore.common.share.ShareService;
import org.entcore.common.user.UserInfos;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class ExercizerExplorerPlugin extends ExplorerPluginResourceSql {
    public static final String APPLICATION = Exercizer.APPLICATION;
    public static final String TYPE = Exercizer.SUBJECT_TYPE;
    public static final String TABLE = Exercizer.SUBJECT_TABLE;
    private final PostgresClient pgClient;
    private final FoldersExplorerPlugin folderPlugin;
    private ShareService shareService;
    //private final GrainExplorerPlugin grainPlugin;

    public ExercizerExplorerPlugin(final IExplorerPluginCommunication communication, final PostgresClient pgClient) {
        super(communication, pgClient.getClientPool());
        this.pgClient = pgClient;
        //init folder plugin
        this.folderPlugin = new FoldersExplorerPlugin(this);
        //init grain plugin => dont need to index grain
        //this.grainPlugin =  new GrainExplorerPlugin(this);
    }

    public static ExercizerExplorerPlugin create() throws Exception {
        final IExplorerPlugin plugin = ExplorerPluginFactory.createPostgresPlugin((params)->{
            return new ExercizerExplorerPlugin(params.getCommunication(), params.getDb());
        });
        return (ExercizerExplorerPlugin) plugin;
    }

    public PostgresClient getPgClient() { return pgClient; }

    public FoldersExplorerPlugin folderPlugin(){ return folderPlugin; }

    public ShareService createShareService(final EventBus eb, final Map<String, SecuredAction> securedActions){
        shareService = createPostgresShareService("exercizer", "subject_shares", eb, securedActions, null);
        return shareService;
    }
    //public GrainExplorerPlugin grainPlugin(){ return grainPlugin; }

    @Override
    protected Optional<ShareService> getShareService() {
        return Optional.ofNullable(shareService);
    }

    @Override
    protected String getTableName() {
        return TABLE;
    }

    @Override
    protected List<String> getColumns() {
        return Arrays.asList("owner", "owner_username", "title", "description");
    }

    @Override
    protected String getApplication() { return APPLICATION; }

    @Override
    protected String getResourceType() { return TYPE; }

    @Override
    protected String getCreatedAtColumn() {
        return "created";
    }

    @Override
    protected String getCreatorIdColumn() {
        return "owner";
    }

    @Override
    protected String getCreatorNameColumn() {
        return "owner_username";
    }

    @Override
    protected Future<ExplorerMessage> toMessage(final ExplorerMessage message, final JsonObject source) {
        message.withName(source.getString("title", ""));
        message.withContent(source.getString("description", ""), ExplorerMessage.ExplorerContentType.Html);
        message.withPublic("PUBLIC".equals(source.getString("visibility")));
        message.withTrashed(source.getBoolean("is_deleted", false));
        message.withShared(source.getJsonArray("shared"));
        return Future.succeededFuture(message);
    }

    @Override
    public UserInfos getCreatorForModel(final JsonObject json) {
        final UserInfos user = new UserInfos();
        user.setUserId(json.getString("owner"));
        user.setUsername(json.getString("owner_username"));
        user.setLogin(json.getString("owner_username"));
        return user;
    }
}
