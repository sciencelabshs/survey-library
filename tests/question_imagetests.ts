import { QuestionImageModel } from "../src/question_image";
import { SurveyModel } from "../src/survey";

QUnit.test("Check image rendered mode", function (assert) {
  const question = new QuestionImageModel("q1");
  assert.equal(question.contentMode, "auto");
  assert.equal(question.renderedMode, "image");
  question.contentMode = "video";
  assert.equal(question.renderedMode, "video");
  question.contentMode = "youtube";
  assert.equal(question.renderedMode, "youtube");
  question.contentMode = "image";
  assert.equal(question.renderedMode, "image");
  question.contentMode = "video";
  assert.equal(question.renderedMode, "video");
  question.contentMode = "auto";
  assert.equal(question.renderedMode, "image");
});
QUnit.test("Check video rendered mode onSurveyLoading", function (assert) {
  const survey = new SurveyModel({
    elements: [
      {
        type: "image",
        name: "q",
        contentMode: "video"
      }
    ]
  });
  const question = <QuestionImageModel>survey.getAllQuestions()[0];
  assert.equal(question.renderedMode, "video");
});
QUnit.test("Check youtube video rendered mode", function (assert) {
  const question = new QuestionImageModel("q1");
  question.imageLink = "https://www.youtube.com/embed/tgbNymZ7vqY";
  assert.equal(question.renderedMode, "youtube");
  question.imageLink = "abcd";
  assert.equal(question.renderedMode, "image");
  question.imageLink = "https://youtu.be/tgbNymZ7vqY";
  assert.equal(question.renderedMode, "youtube");
});
QUnit.test("Check NOT youtube video rendered mode", function (assert) {
  const question = new QuestionImageModel("q1");
  question.imageLink = "videoUrl.mov";
  assert.equal(question.renderedMode, "video");
  question.imageLink = "abcd";
  assert.equal(question.renderedMode, "image");
  question.imageLink = "videoUrl.avi";
  assert.equal(question.renderedMode, "video");
});

QUnit.test("Image adaptive mode", function (assert) {
  const json = {
    questions: [
      {
        type: "image",
        name: "q1"
      },
    ],
  };
  const survey = new SurveyModel(json);
  const question: QuestionImageModel = <any>survey.getQuestionByName("q1");

  question.cssClasses.image = "css_image";
  question.cssClasses.adaptive = "css_adaptive";
  assert.equal(question.getImageCss(), "css_image css_adaptive");

  question.imageWidth = "201";
  question.imageHeight = "150";
  assert.equal(question.getImageCss(), "css_image");

  question.imageWidth = "200";
  question.imageHeight = "151";
  assert.equal(question.getImageCss(), "css_image");

  question.imageWidth = "201";
  question.imageHeight = "151";
  assert.equal(question.getImageCss(), "css_image");

  question.imageWidth = "200";
  question.imageHeight = "150";
  assert.equal(question.getImageCss(), "css_image css_adaptive");
});
QUnit.test("Image question correct youtube url", function (assert) {
  let question = new QuestionImageModel("q1");
  question.imageLink = "https://youtu.be/-5CdAup0o-I";
  assert.equal(question.locImageLink.renderedHtml, "https://www.youtube.com/embed/-5CdAup0o-I");
  question.imageLink = "https://www.youtube.com/watch?v=-5CdAup0o-I2";
  assert.equal(question.locImageLink.renderedHtml, "https://www.youtube.com/embed/-5CdAup0o-I2");
  const json = {
    questions: [
      {
        type: "image",
        name: "q1",
        imageLink: "https://www.youtube.com/watch?v=-5CdAup0o-I3"
      },
    ],
  };
  const survey = new SurveyModel(json);
  question = <any>survey.getQuestionByName("q1");
  assert.equal(question.locImageLink.renderedHtml, "https://www.youtube.com/embed/-5CdAup0o-I3");
});