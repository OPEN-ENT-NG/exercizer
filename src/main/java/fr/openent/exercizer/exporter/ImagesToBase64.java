package fr.openent.exercizer.exporter;

import org.entcore.common.bus.WorkspaceHelper;
import org.entcore.common.storage.Storage;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;

import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ImagesToBase64 {

    private Pattern pattern = Pattern.compile("(?=&lt;img src=\"/workspace/document/).*?(?=&gt;)");
    private Pattern filePattern = Pattern.compile("<file src=\"/workspace/document/.{36}\">");

    private WorkspaceHelper workspaceHelper;
    private Matcher m;
    private Matcher mFile;

    public ImagesToBase64(String text, EventBus eb, Storage storage) {
        this.workspaceHelper = new WorkspaceHelper(eb, storage);
        this.m = this.pattern.matcher(text);
        this.mFile = this.filePattern.matcher(text);
    }

    public void exportImagesToBase64(final String text, final Handler<String> handler){
        if(m.find()){
            final String sub = m.group();
            this.workspaceHelper.readDocument(sub.substring(33, 69), new Handler<WorkspaceHelper.Document>() {
                @Override
                public void handle(WorkspaceHelper.Document doc) {
                    if(doc != null) {
                        exportImagesToBase64(text.replace(sub, "&lt;img src=\"data:image/png;base64," +
                                Base64.getEncoder().encodeToString(doc.getData().getBytes()) + "\""), handler);
                    }else{
                        exportImagesToBase64(text.replace(sub, "&lt;img src=\"\""), handler);
                    }
                }
            });
        }else if (mFile.find()){
            final String sub = mFile.group();
            this.workspaceHelper.readDocument(sub.substring(31, 67), new Handler<WorkspaceHelper.Document>() {
                @Override
                public void handle(WorkspaceHelper.Document doc) {
                    if(doc != null) {
                        final String fileName = doc.getDocument().getJsonObject("metadata").getString("filename");
                        exportImagesToBase64(text.replace(sub, "<file name=\""+ fileName +"\" encoding=\"base64\">" +
                                Base64.getEncoder().encodeToString(doc.getData().getBytes())), handler);
                    }else{
                        exportImagesToBase64(text.replace(sub, "<file>"), handler);
                    }
                }
            });
        }else{
            handler.handle(text);
        }

    }
}
