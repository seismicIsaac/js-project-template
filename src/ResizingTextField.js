

var defaultFontSize = 20;

class ResizingTextField extends HTMLElement {
  createdCallback() {
    this.style.width = `${this.dataset.maxWidth}px`;
    this.myfontSize = this.dataset.preferredFontSize;
  }

  attachedCallback() {
    console.log('attachedCallback blah');
    var myDiv = this.querySelector('div');
    myDiv.style.width = this.dataset.maxWidth;
    this.style.fontSize = this.dataset.preferredFontSize;
    this.resizeText();
  }

  resizeText() {
    var myDiv = this.querySelector('div');

    if (myDiv.scrollWidth > this.dataset.maxWidth) {
      this.myfontSize = this.myfontSize - 1;
      myDiv.style.fontSize = `${this.myfontSize}px`;
      window.requestAnimationFrame(this.resizeText.bind(this));
    }
  }
}

export default ResizingTextField;