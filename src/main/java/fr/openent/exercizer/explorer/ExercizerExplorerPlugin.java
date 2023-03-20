package fr.openent.exercizer.explorer;

import fr.openent.exercizer.Exercizer;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.explorer.ExplorerMessage;
import org.entcore.common.explorer.ExplorerPluginFactory;
import org.entcore.common.explorer.IExplorerPlugin;
import org.entcore.common.explorer.IExplorerPluginCommunication;
import org.entcore.common.explorer.impl.ExplorerPluginResourceSql;
import org.entcore.common.explorer.impl.ExplorerSubResource;
import org.entcore.common.postgres.IPostgresClient;
import org.entcore.common.share.ShareModel;
import org.entcore.common.share.ShareService;
import org.entcore.common.user.UserInfos;

import java.util.*;

public class ExercizerExplorerPlugin extends ExplorerPluginResourceSql {
    public static final String APPLICATION = Exercizer.APPLICATION;
    public static final String TYPE = Exercizer.SUBJECT_TYPE;
    public static final String TABLE = Exercizer.SUBJECT_TABLE;
    private final IPostgresClient pgClient;
    private final FoldersExplorerPlugin folderPlugin;
    private ShareService shareService;
    private final Map<String, SecuredAction> securedActions;
    //private final GrainExplorerPlugin grainPlugin;

    public ExercizerExplorerPlugin(final IExplorerPluginCommunication communication, final IPostgresClient pgClient, final Map<String, SecuredAction> securedActions) {
        super(communication, pgClient);
        this.pgClient = pgClient;
        this.securedActions = securedActions;
        //init folder plugin
        this.folderPlugin = new FoldersExplorerPlugin(this);
        //init grain plugin => dont need to index grain
        //this.grainPlugin =  new GrainExplorerPlugin(this);
    }

    public static ExercizerExplorerPlugin create(final Map<String, SecuredAction> securedActions) throws Exception {
        final IExplorerPlugin plugin = ExplorerPluginFactory.createPostgresPlugin((params)->{
            return new ExercizerExplorerPlugin(params.getCommunication(), params.getDb(), securedActions);
        });
        return (ExercizerExplorerPlugin) plugin;
    }

    public IPostgresClient getPgClient() { return pgClient; }

    public FoldersExplorerPlugin folderPlugin(){ return folderPlugin; }

    public ShareService createShareService(final EventBus eb){
        shareService = createPostgresShareService("exercizer", "subject_shares", eb, securedActions, null);
        return shareService;
    }
    //public GrainExplorerPlugin grainPlugin(){ return grainPlugin; }


    @Override
    protected Map<String, SecuredAction> getSecuredActions() {
        return securedActions;
    }

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
    protected Future<ExplorerMessage> doToMessage(final ExplorerMessage message, final JsonObject source) {
        final Optional<String> creatorId = getCreatorForModel(source).map(e -> e.getUserId());
        final ShareModel shareModel = new ShareModel(source.getJsonArray("shared", new JsonArray()), securedActions, creatorId);
        message.withName(source.getString("title", ""));
        message.withContent(source.getString("description", ""), ExplorerMessage.ExplorerContentType.Html);
        message.withPublic("PUBLIC".equals(source.getString("visibility")));
        message.withTrashed(source.getBoolean("is_deleted", false));
        message.withShared(shareModel);
        return Future.succeededFuture(message);
    }

    @Override
    protected List<ExplorerSubResource> getSubResourcesPlugin() {
        return Collections.emptyList();
    }

    @Override
    public Optional<UserInfos> getCreatorForModel(final JsonObject json) {
        if(!json.containsKey("owner")){
            return Optional.empty();
        }
        final UserInfos user = new UserInfos();
        user.setUserId(json.getString("owner"));
        user.setUsername(json.getString("owner_username"));
        user.setLogin(json.getString("owner_username"));
        return Optional.ofNullable(user);
    }
}
