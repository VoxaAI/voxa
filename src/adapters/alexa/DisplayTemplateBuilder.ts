import { Template, Image, TemplateBackButtonVisibility, TemplateType, ListItem, TextContent, TextField } from 'alexa-sdk';

export class DisplayTemplate implements Template {
  public type: TemplateType;
  public listItems: ListItem[];
  public backButton: TemplateBackButtonVisibility;
  public title: string;
  public token: string
  public textContent: TextContent;
  public backgroundImage?: Image;

  constructor(type: TemplateType) {
    this.type = type;
    this.listItems = [];
    this.backButton = 'VISIBLE';
  }

  setTitle(title: string) {
    this.title = title;
    return this;
  }

  addItem(token: string, image: string, text1: string, text2?: string, text3?: string): DisplayTemplate {
    const item = {
      token,
      image: image ? toImage(image) : undefined,
      textContent: toTextContext(text1, text2, text3),
    };
    this.listItems.push(item);
    return this;
  }

  setToken(token: string): DisplayTemplate {
    this.token = token;
    return this;
  }

  setBackButton(state: TemplateBackButtonVisibility): DisplayTemplate {
    this.backButton = state;
    return this;
  }

  setTextContent(text1: string, text2?: string, text3?: string): DisplayTemplate {
    this.textContent = toTextContext(text1, text2, text3);
    return this;
  }

  setBackgroundImage(backgroundImage: string): DisplayTemplate {
    this.backgroundImage = toImage(backgroundImage);
    return this;
  }


  toJSON() {
    return {
      type: 'Display.RenderTemplate',
      template: {
        type: this.type,
        token: this.token,
        backButton: this.backButton,
        backgroundImage: this.backgroundImage,
        title: this.title,
        listItems: this.listItems.length > 0 ? this.listItems : undefined,
        textContent: this.textContent,
      },
    };
  }
}

function toImage(image: string, contentDescription: string = ''): Image {
  return {
    sources: [
      {
        url: image,
      },
    ],
    contentDescription,
  };
}

function toTextContext(text1: string, text2?: string, text3?: string): TextContent {
  const textContent: TextContent= {
    primaryText: toRichText(text1),
  };

  if (text2) {
    textContent.secondaryText = toRichText(text2);
  }

  if (text3) {
    textContent.tertiaryText = toRichText(text3);
  }

  return textContent;
}

function toRichText(text: string): TextField {
  return {
    text,
    type: 'RichText',
  };
}
