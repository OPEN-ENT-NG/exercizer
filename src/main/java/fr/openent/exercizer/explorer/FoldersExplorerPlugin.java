package fr.openent.exercizer.explorer;

import fr.openent.exercizer.Exercizer;
import io.vertx.core.json.JsonObject;
import org.entcore.common.explorer.IExplorerFolderTree;
import org.entcore.common.explorer.impl.ExplorerFolderTreeSql;

import java.util.Optional;

public class FoldersExplorerPlugin extends ExplorerFolderTreeSql {
    public static final String TYPE = IExplorerFolderTree.FOLDER_TYPE;
    private final ExercizerExplorerPlugin explorerPlugin;

    public FoldersExplorerPlugin(final ExercizerExplorerPlugin explorerPlugin) {
        super(explorerPlugin, explorerPlugin.getPgClient());
        this.explorerPlugin = explorerPlugin;
    }
    @Override
    protected String getFolderId(final JsonObject jsonObject) {
        return jsonObject.getValue("id").toString();
    }

    @Override
    protected String getName(final JsonObject jsonObject) {
        return jsonObject.getString("label");
    }

    @Override
    protected Optional<String> getParentId(JsonObject jsonObject) {
        return Optional.ofNullable(jsonObject.getValue("parent_folder_id")).map(e->e.toString());
    }

    @Override
    protected boolean isTrashed(JsonObject jsonObject) {
        //dont have any trash field => deleted folder are deleted from db
        return false;
    }
    @Override
    protected String getTableName() {
        return Exercizer.FOLDER_TABLE;
    }

    @Override
    protected Optional<String> getUserTableName() {
        return Optional.ofNullable(Exercizer.USER_TABLE);
    }

    @Override
    protected Optional<String> getResourceTableName() {
        return Optional.ofNullable(Exercizer.SUBJECT_TABLE);
    }
}
