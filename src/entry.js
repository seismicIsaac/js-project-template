import ResizingTextField from './ResizingTextField.js';


document.write('It works I promise');

var resizingTextField = document.registerElement("resizing-text-field", ResizingTextField);
setTimeout(() => { window.q = document.querySelector('resizing-text-field div'); }, 50);
setTimeout(() => { window.t = document.querySelector('resizing-text-field'); }, 50);
