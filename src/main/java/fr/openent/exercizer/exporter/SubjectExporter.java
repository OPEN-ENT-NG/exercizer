package fr.openent.exercizer.exporter;


import org.entcore.common.utils.StringUtils;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

public class SubjectExporter {

    private StringWriter stringWriter;
    private XMLStreamWriter xsw;
    private JsonArray grains;
    private static final Logger log = LoggerFactory.getLogger(SubjectExporter.class);

    public SubjectExporter(final JsonArray grains) {
        this.grains = grains == null ? new JsonArray() : grains;
        this.stringWriter = new StringWriter();
        try {
            this.xsw = XMLOutputFactory.newInstance().createXMLStreamWriter(stringWriter);
        } catch (XMLStreamException e) {
            log.error("Export", e);
        }
    }

    public String exportToMoodle(){
        try {
            this.xsw.writeStartDocument("UTF-8", "1.0");
            this.xsw.writeStartElement("quiz");
            for (final Object obj: grains) {
                if (!(obj instanceof JsonObject)) continue;
                this.exportGrainsFactory((JsonObject)obj);
            }
            this.xsw.writeEndElement();
        } catch (XMLStreamException e) {
            log.error("Export to moodle", e);
        }
        return this.stringWriter.toString();
    }

    private String toCDATA(final String html){
        return "<![CDATA["+html+"]]>";
    }

    private void exportGrainsFactory(final JsonObject grain) throws XMLStreamException {
        final JsonObject data = grain.getObject("grain_data");
        final String generalFeedback = data.getString("answer_explanation");
        this.xsw.writeStartElement("question");
        switch (grain.getString("name")){
            case "statement":
                this.writeStatement(data);
                break;
            case "simple_answer":
                this.writeShortAnswer(data);
                break;
            case "open_answer":
                this.writeEssay(data);
                break;
            case "multiple_answers":
                this.writeMultiAnswer(data);
                break;
            case "qcm":
                this.writeMultiChoice(data);
                break;
            case "association":
                this.writeMaching(data);
                break;
            case "order_by":
                this.writeOrdering(data);
                break;
        }
        if (!StringUtils.isEmpty(generalFeedback)) {
            this.xsw.writeStartElement("generalfeedback");
            this.writeText(generalFeedback);
            this.xsw.writeEndElement();
        }
        this.xsw.writeEndElement();

    }

    private void writeStatement(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "description");
        this.writeCommon(grainData.getString("title", ""),
                this.toCDATA(grainData.getObject("custom_data", new JsonObject()).getString("statement", "")), "html");
    }

    private void writeShortAnswer(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "shortanswer");
        this.writeCommon(grainData.getString("title", ""),
                this.toCDATA(grainData.getString("statement", "")), "html");
        if(grainData.getObject("custom_data") != null)
            this.writeAnswer(grainData.getObject("custom_data").getString("correct_answer", ""), "100");
    }

    private void writeEssay(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "essay");
        this.writeCommon(grainData.getString("title", ""),
                this.toCDATA(grainData.getString("statement", "")), "html");
        this.writeAnswer("","0");
    }

    private void writeMultiAnswer(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "multianswer");
        this.writeCommon(grainData.getString("title", ""),
                this.toCDATA(grainData.getString("statement", "")), "html");
        if(grainData.getObject("custom_data") != null) {
            final JsonArray answers = grainData.getObject("custom_data").getArray("correct_answer_list", new JsonArray());

            for (final Object o : answers) {
                if (!(o instanceof JsonObject)) continue;
                final JsonObject j = (JsonObject)o;
                this.writeAnswer(j.getString("text", ""), String.valueOf(100 / answers.size()));
            }
        }
    }

    private void writeMultiChoice(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "multichoice");
        this.writeCommon(grainData.getString("title", ""),
                this.toCDATA(grainData.getString("statement", "")), "html");
        if(grainData.getObject("custom_data") != null) {
            final JsonArray answers = grainData.getObject("custom_data").getArray("correct_answer_list", new JsonArray());
            final List<JsonObject> answersList = new ArrayList<>();
            int totalCorrectAswer = 0;
            for (Object o : answers) {
                if (!(o instanceof JsonObject)) continue;
                final JsonObject j = (JsonObject)o;
                if (j.getBoolean("isChecked", false))
                    totalCorrectAswer++;
                answersList.add(j);
            }
            for (JsonObject answer : answersList) {
                if (answer.getBoolean("isChecked", false))
                    this.writeAnswer(answer.getString("text", ""), String.valueOf(100 / totalCorrectAswer));
                else
                    this.writeAnswer(answer.getString("text", ""), "0");
            }
        }
    }

    private void writeMaching(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "matching");
        this.writeCommon(grainData.getString("title", ""),
                this.toCDATA(grainData.getString("statement", "")), "html");
        if (grainData.getObject("custom_data") != null){
            final JsonArray answers = grainData.getObject("custom_data").getArray("correct_answer_list", new JsonArray());
            for (Object o : answers) {
                if (!(o instanceof JsonObject)) continue;
                final JsonObject j = (JsonObject)o;
                this.xsw.writeStartElement("subquestion");
                this.writeText(j.getString("text_left", ""));
                this.writeAnswer(j.getString("text_right", ""), null);
                this.xsw.writeEndElement();
            }
        }
    }

    private void writeOrdering(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "ordering");
        this.writeCommon(grainData.getString("title", ""),
                this.toCDATA(grainData.getString("statement", "")), "html");
        if(grainData.getObject("custom_data") != null) {
            final JsonArray answers = grainData.getObject("custom_data").getArray("correct_answer_list", new JsonArray());

            for (Object o : answers) {
                if (!(o instanceof JsonObject)) continue;
                final JsonObject j = (JsonObject)o;
                this.xsw.writeStartElement("subquestion");
                this.xsw.writeAttribute("index", String.valueOf(j.getInteger("index", 0)));
                this.writeAnswer(j.getString("text", ""), null);
                this.xsw.writeEndElement();
            }
            this.writeShuffleAnswer(true);
        }
    }

    private void writeShuffleAnswer(final boolean shuffle) throws XMLStreamException {
        this.xsw.writeStartElement("shuffleanwers");
        this.xsw.writeCharacters(shuffle ? "1" : "0");
        this.xsw.writeEndElement();
    }
    private void writeCommon(final String name, final String text, final String format) throws XMLStreamException {
        this.xsw.writeStartElement("name");
        this.writeText(name);
        this.xsw.writeEndElement();
        this.xsw.writeStartElement("questiontext");
        this.xsw.writeAttribute("format", format);
        this.writeText(text);
        this.xsw.writeEndElement();
    }

    private void writeAnswer(final String text, final String fraction) throws XMLStreamException {
        this.xsw.writeStartElement("answer");
        if(!StringUtils.isEmpty(fraction))
            this.xsw.writeAttribute("fraction", fraction);
        this.writeText(text);
        this.xsw.writeEndElement();
    }


    private void writeText(final String text) throws XMLStreamException {
        this.xsw.writeStartElement("text");
        this.xsw.writeCharacters(text);
        this.xsw.writeEndElement();
    }
}
