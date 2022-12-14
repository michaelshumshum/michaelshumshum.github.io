function switchContext(newContext, oldContext) {
  oldContext.derender()
  newContext.render()
}

function makeid(length) {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

function nestElement(parent, child) {
  child.parent(parent)
}

class Context {
  constructor(backgroundColor, backgroundImage = null, active = false) {
    this.active = active
    this.backgroundColor = backgroundColor
    this.backgroundImage = backgroundImage
    this.elements = []
    this.id = makeid(16)
  }
  addElements(elements) {
    elements.forEach(element => {
      this.elements.push(element)
    })
  }
  removeElement(element) {
    try {
      this.elements.splice(this.elements.indexOf(element), 1)
    } catch {
      console.log(`Could not find element ${element.id} in context ${this.id}.`)
    }
  }
  render() {
    this.active = true
    if (this.backgroundImage == null) {
      background(this.backgroundColor)
    } else {
      this.bg = createDiv()
      this.bg.style('background-image', `url(${this.backgroundImage})`)
      this.bg.style('background-repeat', 'no-repeat')
      this.bg.style('background-size', 'cover')
      this.bg.style('z-index', '-1000')
      this.bg.style('width', '100vw')
      this.bg.style('height', '100vh')
    }
    this.elements.forEach(element => {
      try {
        element.render()
      } catch {
        console.log(`Element ${element} in context ${this.id} not valid. Rendering not executed. Assuming custom element`)
      }
    })
  }
  derender() {
    if (this.bg != null) {
      this.bg.remove()
    }
    this.active = false
    this.elements.forEach(element => {
      try {
        element.derender()
      } catch {
        console.log(`Element ${element} in context ${this.id} not valid. Derendering not executed. Assuming custom element`)
      }
    })
  }
}

class Grid {
  constructor(parentContext, rows, columns, css, posX, posY) {
    this.parentContext = parentContext
    this.rows = rows
    this.columns = columns
    this.css = css;
    this.posX = posX
    this.posY = posY
    this.elements = []
    this.id = makeid(16)

  }
  addElement(element, rowIndex, colIndex) {
    this.elements.push([
      element, rowIndex, colIndex
    ])
  }
  render() {
    this.div = createDiv()
    this.div.style('display', 'grid')
    this.div.style('grid-template-columns', `repeat(${this.columns}, 1fr)`)
    this.div.style('grid-template-rows', `repeat(${this.rows}, 1fr)`)
    for (const property in this.css) {
      this.div.style(property, this.css[property])
    }
    this.div.position(this.posX, this.posY)
    this.div.addClass('context-' + this.parentContext.id)
    this.div.id('grid-' + this.id)
    this.elements.forEach((data) => {
      console.log(data)
      data[0].render()
      data[0].div.style('grid-column-start', data[0])
      data[0].div.style('grid-column-end', data[0])
      data[0].div.style('grid-row-start', data[1])
      data[0].div.style('grid-row-end', data[1])
      nestElement(this.div, data[0].div)
    })
  }
  derender() {
    try {
      this.div.remove()
    } catch (e) {
      console.log(`Grid ${this.id} not rendered, derender not executed.`)
    }
  }
}

class Card {
  constructor(parentContext, frontImage, backImage, identifier, css, gameObject, posX = null, posY = null) {
    this.parentContext = parentContext
    this.css = css
    this.frontImage = frontImage
    this.backImage = backImage
    this.posX = posX
    this.posY = posY
    this.identifier = identifier //unique identifier to match cards together
    this.id = makeid(16)
    this.flipped = false
    this.blocked = false;
    this.gameObject = gameObject
  }
  callbackFn() {
    if (!this.blocked) {
      this.gameObject.cardFlip(this)
    }
  }
  block() {
    this.blocked = true;
  }
  unblock() {
    this.blocked = false;
  }
  render() {
    this.div = createDiv()
    this.div.style('cursor', 'pointer')
    this.div.style('user-select', 'none')
    this.div.style('background-image', `url(${this.backImage})`)
    this.div.style('background-size', 'cover')
    this.div.style('background-repeat', 'no-repeat')
    this.div.style('background-position', 'center')

    for (const property in this.css) {
      this.div.style(property, this.css[property])
    }
    if (this.posX == null) {
      this.div.position(this.posX, this.posY, 'relative')
    } else {
      this.div.position(this.posX, this.posY)
    }
    this.div.mouseClicked(() => {
      this.callbackFn()
    })
    this.callbackFn.bind(this)
    this.flip.bind(this)
    this.div.addClass('context-' + this.parentContext.id)
    this.div.id('card-' + this.id)
  }
  derender() {
    try {
      this.div.remove()
    } catch (e) {
      console.log(`Card ${this.id} not rendered, derender not executed.`)
    }
  }
  flip() {
    if (this.flipped) {
      this.div.style('background-image', `url(${this.backImage})`)
      this.flipped = false
    } else {
      this.div.style('background-image', `url(${this.frontImage})`)
      this.flipped = true
    }
  }
}

class Button {
  constructor(parentContext, textLabel, callbackFunc, callbackFunctionArgs, css, posX = null, posY = null, nestedElement = null, callbackFunctionClass = null) {
    this.parentContext = parentContext
    this.textLabel = textLabel
    if (callbackFunctionClass != null) {
      callbackFunc = callbackFunc.bind(callbackFunctionClass)
      this.callbackFunction = () => {
        callbackFunc(...callbackFunctionArgs)
      }
    } else {
      this.callbackFunction = () => {
        callbackFunc(...callbackFunctionArgs)
      }
    }
    this.callbackFunctionArgs = callbackFunctionArgs
    this.css = css
    this.id = makeid(16)
    this.posX = posX
    this.posY = posY
    this.nestedElement = nestedElement
  }
  render() {
    this.div = createDiv()
    if (this.nestedElement) {
      nestElement(this.div, this.nestedElement)
    }
    var label = createElement('label', this.textLabel)
    label.style('cursor', 'pointer')
    nestElement(this.div, label)
    this.div.style('cursor', 'pointer')
    this.div.style('user-select', 'none')
    this.div.style('display', 'flex')
    this.div.style('align-items', 'center')
    this.div.style('justify-content', 'center')
    this.div.style('flex-flow', 'column')
    for (const property in this.css) {
      this.div.style(property, this.css[property])
    }
    if (this.posX == null) {
      this.div.position(this.posX, this.posY, 'relative')
    } else {
      this.div.position(this.posX, this.posY)
    }
    this.div.mouseClicked(this.callbackFunction)
    this.div.addClass('context-' + this.parentContext.id)
    this.div.id('button-' + this.id)
  }
  derender() {
    try {
      this.div.remove()
    } catch (e) {
      console.log(`Button ${this.id} not rendered, derender not executed.`)
    }
  }
  move(x, y) {
    this.posX = x
    this.posY = y
    try {
      this.div.position(this.posX, this.poY)
    } catch (e) {
      console.log(`Button ${this.id} not rendered, move not executed.`)
    }
  }
}

class Target {
  constructor(context, game, css, posX, posY, nestedElement) {
    this.parentContext = context
    this.css = css
    this.id = makeid(16)
    this.posX = posX
    this.posY = posY
    this.nestedElement = nestedElement
    this.callbackFunction = () => {
      game.onHit()
      game.relocateTarget(this)
    }
  }
  render() {
    this.div = createDiv()
    if (this.nestedElement) {
      nestElement(this.div, this.nestedElement)
    }
    this.div.style('cursor', 'pointer')
    this.div.style('user-select', 'none')
    this.div.style('display', 'flex')
    this.div.style('align-items', 'center')
    this.div.style('justify-content', 'center')
    this.div.style('flex-flow', 'columiconfriconn')
    for (const property in this.css) {
      this.div.style(property, this.css[property])
    }
    if (this.posX == null) {
      this.div.position(this.posX, this.posY, 'relative')
    } else {
      this.div.position(this.posX, this.posY)
    }
    this.div.mouseClicked(this.callbackFunction)
    this.div.addClass('context-' + this.parentContext.id)
    this.div.addClass('ease-in')
    this.div.id('target-' + this.id)
  }
  derender() {
    try {
      this.div.remove()
    } catch (e) {
      console.log(`Target ${this.id} not rendered, derender not executed.`)
    }
  }
  move(x, y) {
    this.posX = x
    this.posY = y
    try {
      this.div.position(this.posX, this.posY)
    } catch (e) {
      console.log(`Target ${this.id} not rendered, move not executed.`)
    }
  }
}

class ButtonCollection {
  constructor(parentContext, css, posX, posY, buttons) {
    this.parentContext = parentContext
    this.css = css
    this.id = makeid(16)
    this.posX = posX
    this.posY = posY
    this.buttons = buttons
  }
  addButtons(buttons) {
    for (const button in buttons) {
      this.buttons.push(button)
    }
  }
  render() {
    this.div = createDiv()
    this.div.position(this.posX, this.posY)
    this.div.addClass('context-' + this.parentContext.id)
    this.div.id('buttonCollection-' + this.id)
    for (const property in this.css) {
      this.div.style(property, this.css[property])
    }
    for (const button in this.buttons) {
      this.buttons[button].render()
      nestElement(this.div, this.buttons[button].div)
    }
  }
  derender() {
    try {
      this.div.remove()
    } catch (e) {
      console.log(`ButtonCollection ${this.id} not rendered, derender not executed.`)
    }
  }
}

class Title {
  constructor(parentContext, textLabel, css, posX, posY) {
    this.parentContext = parentContext
    this.textLabel = textLabel
    this.css = css
    this.id = makeid(16)
    this.posX = posX
    this.posY = posY
  }
  render() {
    this.div = createDiv(this.textLabel)
    this.div.style('width', '100%')
    this.div.style('user-select', 'none')
    for (const property in this.css) {
      this.div.style(property, this.css[property])
    }
    this.div.position(this.posX, this.posY)
    this.div.addClass('context-' + this.parentContext.id)
    this.div.id('button-' + this.id)
  }
  derender() {
    try {
      this.div.remove()
    } catch (e) {
      console.log(`Title ${this.id} not rendered, derender not executed.`)
    }
  }
}
class TextBox {
  constructor(parentContext, text, css, posX, posY) {
    this.parentContext = parentContext
    this.text = text
    this.css = css
    this.id = makeid(16)
    this.posX = posX
    this.posY = posY
  }
  render() {
    this.div = createP(`${this.text}`)
    for (const property in this.css) {
      this.div.style(property, this.css[property])
    }
    this.div.position(this.posX, this.posY)
    this.div.addClass('context-' + this.parentContext.id)
    this.div.id('textbox-' + this.id)
  }
  derender() {
    try {
      this.div.remove()
    } catch (e) {
      console.log(`TextBox ${this.id} not rendered, derender not executed.`)
    }
  }
  updateText(text) {
    this.text = text;
    this.div.html(`${this.text}`)
  }
}

class ScoreCounter {
  constructor(parentContext, textLabel, css, posX, posY, initValue = 0) {
    this.parentContext = parentContext
    this.textLabel = textLabel
    this.css = css
    this.id = makeid(16)
    this.value = initValue
    this.posX = posX
    this.posY = posY
  }
  render() {
    this.div = createDiv(`${this.textLabel}: ${this.value}`)
    this.div.style('user-select', 'none')
    for (const property in this.css) {
      this.div.style(property, this.css[property])
    }
    this.div.position(this.posX, this.posY)
    this.div.addClass('context-' + this.parentContext.id)
    this.div.id('button-' + this.id)
  }
  derender() {
    try {
      this.div.remove()
    } catch (e) {
      console.log(`ScoreCounter ${this.id} not rendered, derender not executed.`)
    }
  }
  updateValue(value) {
    this.value = value;
    this.div.html(`${this.textLabel}: ${this.value}`)
  }
}

class DecorativeBox {
  constructor(parentContext, imageUrl, css, posX, posY) {
    this.parentContext = parentContext
    this.imageUrl = imageUrl
    this.css = css
    this.id = makeid(16)
    this.posX = posX
    this.posY = posY
  }
  render() {
    this.div = createDiv()
    this.div.style('background-image', `url(${this.imageUrl})`)
    this.div.style('background-repeat', 'no-repeat')
    this.div.style('background-size', 'cover')
    for (const property in this.css) {
      this.div.style(property, this.css[property])
    }
    this.div.position(this.posX, this.posY)
    this.div.addClass('context-' + this.parentContext.id)
    this.div.id('decbox-' + this.id)
  }
  derender() {
    try {
      this.div.remove()
    } catch (e) {
      console.log(`DecBox ${this.id} not rendered, derender not executed.`)
    }
  }
}