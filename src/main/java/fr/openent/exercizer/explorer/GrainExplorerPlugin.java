package fr.openent.exercizer.explorer;

import fr.openent.exercizer.Exercizer;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import org.entcore.common.explorer.ExplorerMessage;
import org.entcore.common.explorer.impl.ExplorerSubResourceSql;

import java.util.Collection;

public class GrainExplorerPlugin extends ExplorerSubResourceSql {

    public GrainExplorerPlugin(final ExercizerExplorerPlugin plugin) {
        super(plugin, plugin.getPgClient());
    }

    @Override
    protected String getTableName() {
        return Exercizer.GRAIN_TABLE;
    }

    @Override
    public String getEntityType() {
        return "grain";
    }

    @Override
    protected String getParentId(final JsonObject jsonObject) {
        return jsonObject.getValue("subject_id").toString();
    }

    @Override
    protected String getParentIdColumn() {
        return "subject_id";
    }

    @Override
    protected Future<ExplorerMessage> doToMessage(final ExplorerMessage message, final JsonObject source) {
        final String id = source.getValue("id").toString();
        message.withSubResourceHtml(id, source.getString("grain_data",""), source.getLong("version"));
        return Future.succeededFuture(message);
    }

    @Override
    public Future<Void> onDeleteParent(final Collection<String> collection) {
        //DELETE CASCADE
        return Future.succeededFuture();
    }

}
