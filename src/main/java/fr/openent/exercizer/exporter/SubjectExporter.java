package fr.openent.exercizer.exporter;


import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

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

    public SubjectExporter(JsonArray grains) {
        this.grains = grains;
        this.stringWriter = new StringWriter();
        try {
            this.xsw = XMLOutputFactory.newInstance().createXMLStreamWriter(stringWriter);
        } catch (XMLStreamException e) {
            e.printStackTrace();
        }
    }

    public String exportToMoodle(){
        try {
            this.xsw.writeStartDocument("UTF-8", "1.0");
            this.xsw.writeStartElement("quiz");
            for (Object obj: grains) {
                this.exportGrainsFactory((JsonObject)obj);
            }
            this.xsw.writeEndElement();
        } catch (XMLStreamException e) {
            e.printStackTrace();
        }
        return this.stringWriter.toString();
    }

    private String toCDATA(String html){
        return "<![CDATA["+html+"]]>";
    }

    private void exportGrainsFactory(JsonObject grain) throws XMLStreamException {
        JsonObject data = grain.getObject("grain_data");
        String generalFeedback = data.getString("answer_explanation");
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
        if(generalFeedback != null){
            this.xsw.writeStartElement("generalfeedback");
            this.writeText(generalFeedback);
            this.xsw.writeEndElement();
        }
        this.xsw.writeEndElement();

    }

    private void writeStatement(JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "description");
        this.writeCommon(grainData.getString("title"),
                this.toCDATA(grainData.getObject("custom_data").getString("statement")), "html");
    }

    private void writeShortAnswer(JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "shortanswer");
        this.writeCommon(grainData.getString("title"),
                this.toCDATA(grainData.getString("statement")), "html");
        if(grainData.getObject("custom_data") != null)
            this.writeAnswer(grainData.getObject("custom_data").getString("correct_answer"), "100");
    }

    private void writeEssay(JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "essay");
        this.writeCommon(grainData.getString("title"),
                this.toCDATA(grainData.getString("statement")), "html");
        this.writeAnswer("","0");
    }

    private void writeMultiAnswer(JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "multianswer");
        this.writeCommon(grainData.getString("title"),
                this.toCDATA(grainData.getString("statement")), "html");
        if(grainData.getObject("custom_data") != null) {
            JsonArray answers = grainData.getObject("custom_data").getArray("correct_answer_list");
            JsonObject j;
            for (Object o : answers) {
                j = (JsonObject) o;
                this.writeAnswer(j.getString("text"), String.valueOf(100 / answers.size()));
            }
        }
    }

    private void writeMultiChoice(JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "multichoice");
        this.writeCommon(grainData.getString("title"),
                this.toCDATA(grainData.getString("statement")), "html");
        if(grainData.getObject("custom_data") != null) {
            JsonArray answers = grainData.getObject("custom_data").getArray("correct_answer_list");
            List<JsonObject> answersList = new ArrayList<>();
            JsonObject j;
            int totalCorrectAswer = 0;
            for (Object o : answers) {
                j = (JsonObject) o;
                if (j.getBoolean("isChecked"))
                    totalCorrectAswer++;
                answersList.add(j);
            }
            for (JsonObject answer : answersList) {
                if (answer.getBoolean("isChecked"))
                    this.writeAnswer(answer.getString("text"), String.valueOf(100 / totalCorrectAswer));
                else
                    this.writeAnswer(answer.getString("text"), "0");
            }
        }
    }

    private void writeMaching(JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "matching");
        this.writeCommon(grainData.getString("title"),
                this.toCDATA(grainData.getString("statement")), "html");
        if (grainData.getObject("custom_data") != null){
            JsonArray answers = grainData.getObject("custom_data").getArray("correct_answer_list");
            JsonObject j;
            for (Object o : answers) {
                j = (JsonObject) o;
                this.xsw.writeStartElement("subquestion");
                this.writeText(j.getString("text_left"));
                this.writeAnswer(j.getString("text_right"), null);
                this.xsw.writeEndElement();
            }
        }
    }

    private void writeOrdering(JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "ordering");
        this.writeCommon(grainData.getString("title"),
                this.toCDATA(grainData.getString("statement")), "html");
        if(grainData.getObject("custom_data") != null) {
            JsonArray answers = grainData.getObject("custom_data").getArray("correct_answer_list");
            JsonObject j;
            for (Object o : answers) {
                j = (JsonObject) o;
                this.xsw.writeStartElement("subquestion");
                this.xsw.writeAttribute("index", String.valueOf(j.getInteger("index")));
                this.writeAnswer(j.getString("text"), null);
                this.xsw.writeEndElement();
            }
            this.writeShuffleAnswer(true);
        }
    }

    private void writeShuffleAnswer(boolean shuffle) throws XMLStreamException {
        this.xsw.writeStartElement("shuffleanwers");
        this.xsw.writeCharacters(shuffle ? "1" : "0");
        this.xsw.writeEndElement();
    }
    private void writeCommon(String name, String text, String format) throws XMLStreamException {
        this.xsw.writeStartElement("name");
        this.writeText(name);;
        this.xsw.writeEndElement();
        this.xsw.writeStartElement("questiontext");
        this.xsw.writeAttribute("format", format);
        this.writeText(text);
        this.xsw.writeEndElement();
    }

    private void writeAnswer(String text, String fraction) throws XMLStreamException {
        this.xsw.writeStartElement("answer");
        if(fraction != null)
            this.xsw.writeAttribute("fraction", fraction);
        this.writeText(text);
        this.xsw.writeEndElement();
    }


    private void writeText(String text) throws XMLStreamException {
        this.xsw.writeStartElement("text");
        this.xsw.writeCharacters(text);
        this.xsw.writeEndElement();
    }
}
