import * as React from "react";
import { ReactSurveyElement, SurveyElementBase, SurveyQuestionElementBase } from "./reactquestion_element";
import { QuestionImagePickerModel, ImageItemValue, SurveyModel } from "survey-core";
import { ReactQuestionFactory } from "./reactquestion_factory";
import { ReactSurveyElementsWrapper } from "./reactsurveymodel";
import { SvgIcon } from "./components/svg-icon/svg-icon";

export class SurveyQuestionImagePicker extends SurveyQuestionElementBase {
  constructor(props: any) {
    super(props);
  }
  protected get question(): QuestionImagePickerModel {
    return this.questionBase as QuestionImagePickerModel;
  }
  protected renderElement(): JSX.Element {
    var cssClasses = this.question.cssClasses;
    return (
      <fieldset className={this.question.getSelectBaseRootCss()}>
        <legend
          role="radio"
          aria-label={this.question.locTitle.renderedHtml} />
        {this.question.hasColumns ? this.getColumns(cssClasses) : this.getItems(cssClasses)}
      </fieldset>
    );
  }

  protected getColumns(cssClasses: any) {
    return this.question.columns.map((column: any, ci: number) => {
      var items = column.map((item: any, ii: number) =>
        this.renderItem(
          "item" + ii,
          item,
          cssClasses
        )
      );
      return (
        <div key={"column" + ci} className={this.question.getColumnClass()} role="presentation">
          {items}
        </div>
      );
    });
  }

  protected getItems(cssClasses: any): Array<any> {
    var items:Array<JSX.Element> = [];
    for (var i = 0; i < this.question.visibleChoices.length; i++) {
      var item = this.question.visibleChoices[i];
      var key = "item" + i;
      items.push(this.renderItem(key, item as ImageItemValue, cssClasses));
    }
    return items;
  }
  protected get textStyle(): any {
    return { marginLeft: "3px", display: "inline", position: "static" };
  }
  protected renderItem(
    key: string,
    item: ImageItemValue,
    cssClasses: any
  ): JSX.Element {
    const renderedItem = <SurveyQuestionImagePickerItem key={key} question={this.question} item={item} cssClasses={cssClasses}></SurveyQuestionImagePickerItem>;
    const survey = this.question.survey as SurveyModel;
    let wrappedItem: JSX.Element | null = null;
    if(!!survey) {
      wrappedItem = ReactSurveyElementsWrapper.wrapItemValue(survey, renderedItem, this.question, item);
    }
    return wrappedItem ?? renderedItem;
  }
}
export class SurveyQuestionImagePickerItem extends ReactSurveyElement {
  constructor(props: any) {
    super(props);
    this.handleOnChange = this.handleOnChange.bind(this);
  }
  protected getStateElement() {
    return this.item;
  }
  componentDidMount() {
    super.componentDidMount();
    this.reactOnStrChanged();
  }
  componentWillUnmount() {
    super.componentWillUnmount();
    this.item.locImageLink.onChanged = function () {};
  }
  componentDidUpdate(prevProps: any, prevState: any) {
    super.componentDidUpdate(prevProps, prevState);
    this.reactOnStrChanged();
  }
  private reactOnStrChanged() {
    this.item.locImageLink.onChanged = () => {
      this.setState({ locImageLinkchanged: !!this.state && this.state.locImageLink ? this.state.locImageLink + 1 : 1 });
    };
  }
  protected get cssClasses() {
    return this.props.cssClasses;
  }

  protected get item() {
    return this.props.item;
  }

  protected get question() {
    return this.props.question;
  }

  handleOnChange(event: any) {
    if (this.question.multiSelect) {
      if (event.target.checked) {
        this.question.value = this.question.value.concat(event.target.value);
      } else {
        var currValue = this.question.value;
        currValue.splice(this.question.value.indexOf(event.target.value), 1);
        this.question.value = currValue;
      }
    } else {
      this.question.value = event.target.value;
    }
    this.setState({ value: this.question.value });
  }

  protected renderElement(): JSX.Element {
    const item = this.item;
    const question = this.question;
    const cssClasses = this.cssClasses;
    var isChecked = question.isItemSelected(item);
    var itemClass = question.getItemClass(item);
    var text: JSX.Element | null = null;
    if (question.showLabel) {
      text = (
        <span
          className={question.cssClasses.itemText}
        >
          {item.text ? SurveyElementBase.renderLocString(item.locText) : item.value}
        </span>
      );
    }

    var style: any = { objectFit: this.question.imageFit };

    var control: JSX.Element | null = null;
    if (item.locImageLink.renderedHtml && this.question.contentMode === "image") {
      control = (
        <img
          className={cssClasses.image}
          src={item.locImageLink.renderedHtml}
          width={ this.question.renderedImageWidth }
          height={ this.question.renderedImageHeight }
          alt={item.locText.renderedHtml}
          style={style}
          onLoad={(event: any) => { this.question["onContentLoaded"](item, event.nativeEvent); }}
        />
      );
    }
    if (item.locImageLink.renderedHtml && this.question.contentMode === "video") {
      control = (
        <video controls
          className={cssClasses.image}
          src={item.locImageLink.renderedHtml}
          width={ this.question.renderedImageWidth }
          height={ this.question.renderedImageHeight }
          style={style}
          onLoadedMetadata={(event: any) => { this.question["onContentLoaded"](item, event.nativeEvent); }}
        ></video>
      );
    }
    if (!item.locImageLink.renderedHtml) {
      let style: any = {
        width: this.question.renderedImageWidth,
        height: this.question.renderedImageHeight,
        objectFit: this.question.imageFit
      };
      control = (
        <div
          className={cssClasses.itemNoImage}
          style={style}
        >
          {
            cssClasses.itemNoImageSvgIcon ?
              <svg className={cssClasses.itemNoImageSvgIcon}>
                <use xlinkHref={cssClasses.itemNoImageSvgIconId}></use>
              </svg>:
              null
          }
        </div>
      );
    }

    const renderedItem = (
      <div className={itemClass}>
        <label className={cssClasses.label}>
          <input
            className={cssClasses.itemControl}
            id={this.question.getItemId(item)}
            type={this.question.inputType}
            name={this.question.questionName}
            checked={isChecked}
            value={item.value}
            disabled={!this.question.getItemEnabled(item)}
            onChange={this.handleOnChange}
            aria-required={this.question.ariaRequired}
            aria-label={this.question.ariaLabel}
            aria-invalid={this.question.ariaInvalid}
            aria-describedby={this.question.ariaDescribedBy}
          />
          <div className={this.question.cssClasses.itemDecorator}>
            <div className={this.question.cssClasses.imageContainer}>
              {!!this.question.cssClasses.checkedItemDecorator ?
                <span className={this.question.cssClasses.checkedItemDecorator }>
                  {!!this.question.cssClasses.checkedItemSvgIconId ? <SvgIcon size={"auto"} className={this.question.cssClasses.checkedItemSvgIcon} iconName={this.question.cssClasses.checkedItemSvgIconId}></SvgIcon> : null}
                </span> : null}
              {control}
            </div>
            {text}
          </div>
        </label>
      </div>
    );
    return renderedItem;
  }
}

ReactQuestionFactory.Instance.registerQuestion("imagepicker", (props) => {
  return React.createElement(SurveyQuestionImagePicker, props);
});
