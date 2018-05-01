
import { debounce } from './throttle-debounce';

class ViewPort {
  static sizeClasses = ['xs', 'sm', 'md', 'lg', 'xl'];
  static prevSize = '';
  static sizeClass = '';
  static observers = [];

  static init() {
    ViewPort.prevSize = ViewPort.readClass();
    ViewPort.sizeClass = ViewPort.readClass();
    window.addEventListener(
      'resize',
      debounce(ViewPort.setClass, 50, false),
    );
  }

  static elVisible(element) {
    return window.getComputedStyle(element)
      .getPropertyValue('display') === 'block';
    // return element.offsetWidth > 0 && element.offsetHeight > 0;
  }

  static getByClass(className) {
    return document.getElementsByClassName(className)[0];
  }

  static isSizeClassVisible(sizeClassName) {
    return ViewPort.elVisible(ViewPort.getByClass(`device-${sizeClassName}`));
  }

  static readClass() {
    return ViewPort.sizeClasses
      .filter(sizeClassName => ViewPort.isSizeClassVisible(sizeClassName))
      .reduce((acc, curr) => curr);
  }

  static setClass() {
    ViewPort.prevSize = ViewPort.sizeClass;
    ViewPort.sizeClass = ViewPort.readClass();
    if (ViewPort.prevSize !== ViewPort.breakpoint) {
      ViewPort.notifyObservers();
    }
  }

  static getClass() {
    return ViewPort.sizeClass;
  }

  static registerObserver(observer) {
    ViewPort.observers.push(observer);
  }

  static notifyObservers() {
    ViewPort.observers.forEach((observer) => {
      observer.updateViewPort();
    });
  }
}

export default ViewPort;
