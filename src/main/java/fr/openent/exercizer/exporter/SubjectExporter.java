package fr.openent.exercizer.exporter;


import fr.wseduc.webutils.Utils;
import org.entcore.common.utils.StringUtils;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import java.io.StringWriter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SubjectExporter {

    private StringWriter stringWriter;
    private XMLStreamWriter xsw;
    private JsonArray grains;
    private static final Logger log = LoggerFactory.getLogger(SubjectExporter.class);
    private static Pattern FILL_ZONE_P = Pattern.compile("(?<=<fill-zone).*?(?=</fill-zone>)");

    public SubjectExporter(final JsonArray grains) {
        this.grains = Utils.getOrElse(grains, new fr.wseduc.webutils.collections.JsonArray());
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

    private void exportGrainsFactory(final JsonObject grain) throws XMLStreamException {
        final JsonObject data = Utils.getOrElse(grain.getJsonObject("grain_data"), new JsonObject());
        final String generalFeedback = Utils.getOrElse(data.getString("answer_explanation"), "");
        final String questionType = Utils.getOrElse(grain.getString("name"), "");
        switch (questionType) {
            case "statement":
                this.writeStartQuestion();
                this.writeStatement(data);
                this.writeEndQuestion(generalFeedback);
                break;
            case "simple_answer":
                this.writeStartQuestion();
                this.writeShortAnswer(data);
                this.writeEndQuestion(generalFeedback);
                break;
            case "open_answer":
                this.writeStartQuestion();
                this.writeEssay(data);
                this.writeEndQuestion(generalFeedback);
                break;
            case "multiple_answers":
                this.writeStartQuestion();
                this.writeMultiAnswer(data);
                this.writeEndQuestion(generalFeedback);
                break;
            case "qcm":
                this.writeStartQuestion();
                this.writeMultiChoice(data);
                this.writeEndQuestion(generalFeedback);
                break;
            case "association":
                this.writeStartQuestion();
                this.writeMaching(data);
                this.writeEndQuestion(generalFeedback);
                break;
            case "text_to_fill":
                writeGapSelectOrDdwtos(data);
                break;
            case "order_by":
                /*unsupported by moodle
                /this.writeStartQuestion();
                this.writeOrdering(data);
                this.writeEndQuestion(generalFeedback);*/
                break;
            case "area_select_image":
                this.writeDragDropImageOrText(data, questionType);
                break;
            case "area_select":
                this.writeDragDropImageOrText(data, questionType);
                break;
        }
    }

    private void writeGapSelectOrDdwtos(final JsonObject grainData) throws XMLStreamException {
        final JsonObject customData = Utils.getOrElse(grainData.getJsonObject("custom_data"), new JsonObject());

        final String type = customData.getString("answersType");
        if ("text".equals(type)) {
            // TODO: Write implementation for Text to fill with free input answer type
            return;
        }
        if ("list".equals(type) || "drag".equals(type)) {
            final boolean isDrag = "drag".equals(type);
            this.writeStartQuestion();
            this.xsw.writeAttribute("type", isDrag ? "ddwtos" : "gapselect");

            final JsonArray zones = Utils.getOrElse(customData.getJsonArray("zones"), new fr.wseduc.webutils.collections.JsonArray());
            final Map<Integer, JsonObject> mapIdZone = new HashMap<>();

            for (final Object z : zones) {
                if (!(z instanceof JsonObject)) continue;
                final JsonObject zone = (JsonObject) z;

                if (zone.getInteger("id") != null) {
                    mapIdZone.put(zone.getInteger("id"), zone);
                }
            }

            final List<Integer> zoneList = new ArrayList<>();
            Integer number = 1;
            String htmlContent = Utils.getOrElse(customData.getString("htmlContent"), "");
            final Matcher m = FILL_ZONE_P.matcher(htmlContent);
            while (m.find()) {
                final String zone = StringUtils.trimToBlank(m.group());
                final int firstIndex = zone.indexOf("\"");
                final int lastIndex = zone.indexOf("\"", firstIndex + 1);
                if (firstIndex != -1 && lastIndex != -1 && (lastIndex - firstIndex > 0)) {
                    final String id = zone.substring(firstIndex + 1, lastIndex);
                    try {
                        zoneList.add(Integer.valueOf(id));
                        htmlContent = htmlContent.replace(zone, ">[[" + number + "]]");
                        number++;
                    } catch (NumberFormatException nfe) {
                        log.error("[EXPORT] id of fill_zone isn't an integer", nfe);
                    }
                }
            }

            this.writeCommon(grainData.getString("title"), htmlContent, "html");
            this.writeDefaultGrade(grainData);

            number = 1;

            //right answer in first
            for (final Integer id : zoneList) {
                final JsonObject zone = mapIdZone.get(id);
                this.writeDragOrSelectOption(zone.getString("answer"), number.toString(), isDrag);
                zone.put("group", number.toString());
                number++;
            }

            //bad answer for any groups after
            for (final Integer id : zoneList) {
                final JsonObject zone = mapIdZone.get(id);
                final String answer = Utils.getOrElse(zone.getString("answer"), "");
                final String group = zone.getString("group");
                final JsonArray options = ("drag".equals(type)) ? Utils.getOrElse(customData.getJsonArray("options"), new JsonArray()) : Utils.getOrElse(zone.getJsonArray("options"), new JsonArray());

                for (final Object o : options) {
                    if (!(o instanceof String)) continue;
                    if (!answer.equals(o)) {
                        this.writeDragOrSelectOption((String) o, group, isDrag);
                    }
                }
            }
        }

        this.writeEndQuestion(grainData.getString("answer_explanation"));
    }

    private void writeDragOrSelectOption(final String text, final String group, final boolean isDrag) throws XMLStreamException {
        this.xsw.writeStartElement(isDrag ? "dragbox" : "selectoption");
        this.writeText(text);
        this.writeTag("group", group);
        this.xsw.writeEndElement();
    }

    private void writeDragDropImageOrText(final JsonObject grainData, final String questionType) throws XMLStreamException {
        final boolean isImage = "area_select_image".equals(questionType);

        final JsonObject customData = Utils.getOrElse(grainData.getJsonObject("custom_data"), new JsonObject());
        //only drag is available for ddimageortext moodle type
        final String type = Utils.getOrElse(customData.getString("answersType"), "");

        if (isImage || "drag".equals(type)) {
            this.writeStartQuestion();
            this.xsw.writeAttribute("type", "ddimageortext");
            this.writeCommon(grainData.getString("title"), grainData.getString("statement"), "html");
            final JsonArray options = Utils.getOrElse(customData.getJsonArray("options"), new fr.wseduc.webutils.collections.JsonArray());
            final JsonArray zones = Utils.getOrElse(customData.getJsonArray("zones"), new fr.wseduc.webutils.collections.JsonArray());

            this.writeFile(customData.getString("_guideImage"));
            this.writeDefaultGrade(grainData);

            if (options.size() > 0) {

                final Map<String, String> mapNumberResponse = new HashMap<>();

                //check reusable option
                final Map<String, Boolean> finalOptions = new HashMap<>();
                for (final Object o : options) {
                    if (!(o instanceof String)) continue;
                    final String option = (String) o;
                    if (finalOptions.containsKey(option)) {
                        finalOptions.put(option, true);
                    } else {
                        finalOptions.put(option, false);
                    }
                }

                Integer number = 1;

                for (final String option : finalOptions.keySet()) {
                    mapNumberResponse.put(option, number.toString());
                    if (isImage) {
                        writeDrag(number.toString(), option, "", finalOptions.get(option));
                    } else {
                        writeDrag(number.toString(), "", option, finalOptions.get(option));
                    }

                    number++;
                }

                number = 1;
                for (final Object z : zones) {
                    if (!(z instanceof JsonObject)) continue;
                    final JsonObject zone = (JsonObject) z;
                    final String answer = Utils.getOrElse(zone.getString("answer"), "");
                    final JsonObject positions = Utils.getOrElse(zone.getJsonObject("position"), new JsonObject());
                    writeDrop(number.toString(), mapNumberResponse.get(answer), positions);
                    number++;
                }
            }
            this.writeEndQuestion(grainData.getString("answer_explanation"));
        }
    }

    private void writeStatement(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "description");
        this.writeCommon(grainData.getString("title"), Utils.getOrElse(grainData.getJsonObject("custom_data"), new JsonObject()).getString("statement"), "html");
    }

    private void writeShortAnswer(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "shortanswer");
        this.writeCommon(grainData.getString("title"), grainData.getString("statement"), "html");

        this.writeDefaultGrade(grainData);
        this.writeAnswer(Utils.getOrElse(grainData.getJsonObject("custom_data"), new JsonObject()).getString("correct_answer"), "100");
    }

    private void writeEssay(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "essay");
        this.writeCommon(grainData.getString("title"), grainData.getString("statement"), "html");
        this.writeDefaultGrade(grainData);
        this.writeAnswer("","0");
    }

    private void writeMultiAnswer(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "shortanswer");
        this.writeCommon(grainData.getString("title"), grainData.getString("statement"), "html");
        final JsonArray answers = Utils.getOrElse(Utils.getOrElse(grainData.getJsonObject("custom_data"),
                new JsonObject()).getJsonArray("correct_answer_list"), new fr.wseduc.webutils.collections.JsonArray());

        this.writeDefaultGrade(grainData);

        boolean first = true;

        //must one answer to 100%
        for (final Object o : answers) {
            if (!(o instanceof JsonObject)) continue;
            final JsonObject j = (JsonObject) o;

            if (first) {
                this.writeAnswer(j.getString("text"), "100");
                first = false;
            } else {
                this.writeAnswer(j.getString("text"), getFraction(answers.size()));
            }
        }
    }

    private void writeMultiChoice(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "multichoice");
        this.writeCommon(grainData.getString("title"), grainData.getString("statement"), "html");
        final JsonArray answers = Utils.getOrElse(Utils.getOrElse(grainData.getJsonObject("custom_data"),
                new JsonObject()).getJsonArray("correct_answer_list"), new fr.wseduc.webutils.collections.JsonArray());

        this.writeDefaultGrade(grainData);

        final List<JsonObject> answersList = new ArrayList<>();
        int totalCorrectAswer = 0;
        for (Object o : answers) {
            if (!(o instanceof JsonObject)) continue;
            final JsonObject j = (JsonObject) o;
            if (j.getBoolean("isChecked", false))
                totalCorrectAswer++;
            answersList.add(j);
        }
        for (JsonObject answer : answersList) {
            if (answer.getBoolean("isChecked", false))
                this.writeAnswer(answer.getString("text", ""), getFraction(totalCorrectAswer));
            else
                this.writeAnswer(answer.getString("text", ""), "0");
        }

        // deduction of the single field (only one answer possible)
        writeTag("single", String.valueOf(totalCorrectAswer == 1));

        // shuffle for all
        this.writeShuffleAnswer(true);

        // no prefix
        writeTag("answernumbering", "none");
    }

    private void writeMaching(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "matching");
        this.writeCommon(grainData.getString("title", ""), grainData.getString("statement"), "html");

        final JsonArray answers = Utils.getOrElse(Utils.getOrElse(grainData.getJsonObject("custom_data"),
                new JsonObject()).getJsonArray("correct_answer_list"), new fr.wseduc.webutils.collections.JsonArray());

        this.writeDefaultGrade(grainData);

        for (Object o : answers) {
            if (!(o instanceof JsonObject)) continue;
            final JsonObject j = (JsonObject) o;
            this.xsw.writeStartElement("subquestion");
            this.writeText(j.getString("text_left", ""));
            this.writeAnswer(j.getString("text_right", ""), null);
            this.xsw.writeEndElement();
        }
    }

    private void writeOrdering(final JsonObject grainData) throws XMLStreamException {
        this.xsw.writeAttribute("type", "ordering");
        this.writeCommon(grainData.getString("title"),
                grainData.getString("statement"), "html");
        final JsonArray answers = Utils.getOrElse(Utils.getOrElse(grainData.getJsonObject("custom_data"),
                new JsonObject()).getJsonArray("correct_answer_list"), new fr.wseduc.webutils.collections.JsonArray());

        this.writeDefaultGrade(grainData);

        for (Object o : answers) {
            if (!(o instanceof JsonObject)) continue;
            final JsonObject j = (JsonObject) o;
            this.xsw.writeStartElement("subquestion");
            this.xsw.writeAttribute("index", String.valueOf(j.getInteger("index", 0)));
            this.writeAnswer(j.getString("text", ""), null);
            this.xsw.writeEndElement();
        }
        this.writeShuffleAnswer(true);
    }

    private void writeShuffleAnswer(final boolean shuffle) throws XMLStreamException {
        writeTag("shuffleanswers", shuffle ? "1" : "0");
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

    private void writeDrag(final String number, final String url, final String text, final Boolean infinite) throws XMLStreamException {
        this.xsw.writeStartElement("drag");
        this.writeTag("no", number);

        if (!StringUtils.isEmpty(url)) {
            this.xsw.writeEmptyElement("text");
            this.writeFile(url);
        } else {
            this.writeText(text);
        }
        this.writeTag("draggroup", "1");

        if (infinite) {
            this.xsw.writeEmptyElement("infinite");
        }

        this.xsw.writeEndElement();
    }

    private void writeDrop(final String number, final String choice, final JsonObject positions) throws XMLStreamException {
        this.xsw.writeStartElement("drop");
        this.xsw.writeEmptyElement("text");
        this.writeTag("no", number);
        this.writeTag("choice", choice);
        this.writeTag("xleft", String.valueOf(Utils.getOrElse(positions.getDouble("x"), 0D).intValue()));
        this.writeTag("ytop", String.valueOf(Utils.getOrElse(positions.getDouble("y"), 0D).intValue()));
        this.xsw.writeEndElement();
    }

    private void writeText(final String text) throws XMLStreamException {
        writeTag("text", text);
    }

    private void writeFile(String srcAtt) throws XMLStreamException {
        this.xsw.writeStartElement("file");
        this.xsw.writeAttribute("src", Utils.getOrElse(srcAtt, ""));
        this.xsw.writeEndElement();
    }

    private void writeDefaultGrade(final JsonObject grainData) throws XMLStreamException {
        this.writeTag("defaultgrade", String.valueOf(Utils.getOrElse(grainData.getDouble("max_score"), 0D)));
    }

    private void writeTag(final String tag, String text) throws XMLStreamException {
        this.xsw.writeStartElement(tag);
        this.xsw.writeCharacters(Utils.getOrElse(text, ""));
        this.xsw.writeEndElement();
    }

    private void writeStartQuestion() throws XMLStreamException {
        this.xsw.writeStartElement("question");
    }

    private void writeEndQuestion(String generalFeedback) throws XMLStreamException {
        if (!StringUtils.isEmpty(generalFeedback)) {
            this.xsw.writeStartElement("generalfeedback");
            this.writeText(generalFeedback);
            this.xsw.writeEndElement();
        }
        this.xsw.writeEndElement();
    }

    private String getFraction(final int count) {
        if (count == 0) return "0";
        return String.valueOf((double)Math.round((100d/count) * 10000d) / 10000d);
    }
}
