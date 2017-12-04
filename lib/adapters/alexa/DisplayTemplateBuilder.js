'use strict';

class DisplayTemplate {
  constructor(type) {
    this.type = type;
    this.listItems = [];
    this.backButton = 'VISIBLE';
  }

  setTitle(title) {
    this.title = title;
    return this;
  }

  addItem(token, image, text1, text2, text3) {
    const item = {
      token,
      image: image ? toImage(image) : undefined,
      textContent: toTextContext(text1, text2, text3),
    };
    this.listItems.push(item);
    return this;
  }

  setToken(token) {
    this.token = token;
    return this;
  }

  setBackButton(state) {
    this.backButton = state;
    return this;
  }

  setTextContent(text1, text2, text3) {
    this.textContent = toTextContext(text1, text2, text3);
    return this;
  }

  setBackgroundImage(backgroundImage) {
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

function toImage(image, description) {
  const img = {
    sources: [
      {
        url: image,
      },
    ],
  };

  if (description) {
    img.contentDescription = description;
  }
  return img;
}

function toTextContext(text1, text2, text3) {
  const textContent = {};

  textContent.primaryText = toRichText(text1);

  if (text2) {
    textContent.secondaryText = toRichText(text2);
  }

  if (text3) {
    textContent.tertiaryText = toRichText(text3);
  }

  return textContent;
}

function toRichText(text) {
  return {
    text,
    type: 'RichText',
  };
}

module.exports = DisplayTemplate;
