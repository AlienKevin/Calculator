const constants = {
  g : 9.81,
  G : 6.67430e-11,
  k : 9.0e9
}

let input = document.getElementById("input0");
let output = document.getElementById("output0");
let editor = new Guppy("input0");
let slot = {
  index: 0,
  input: input,
  editor: editor,
  output: output,
}
let slots = [slot]

setupEditor()
Guppy.use_osk(new GuppyOSK({"goto_tab":"arithmetic","attach":"focus"}));

function setupEditor() {
  editor.configure("empty_content", "\\color{grey}{\\text{Type math here...}}")
  editor.event("change", function () {
    // latex()
    text()
  });
  editor.event("done", function() {
    if (isLastSlot(slot)
      || isEmptySlot(slot)) {
      addSlot(slot.index + 1)
    }
  })
}

function isLastSlot(slot) {
  return slot.index === slots.length - 1
}

function isEmptySlot(slot) {
  return slots[slot.index + 1].editor.doc().get_content("text") === ""
}

function addSlot(newIndex) {
  addSlotElement(newIndex)
}

function addSlotElement(newIndex) {
  slotElement = document.createElement("div")
  slotElement.id = "slot" + newIndex
  input = document.createElement("span")
  input.id = "input" + newIndex
  output = document.createElement("span")
  output.id = "output" + newIndex

  slotElement.appendChild(input)
  slotElement.appendChild(output)
  const oldSlot = document.getElementById("slot" + ( newIndex - 1 ))
  oldSlot.insertAdjacentElement("afterend", slotElement)

  slotElement.className = "slot"
  input.classList.add("input")
  output.className = "output"

  editor = new Guppy("input" + newIndex)
  slots[newIndex - 1].editor.deactivate()
  editor.activate()

  slot = {
    index: newIndex,
    input: input,
    editor: editor,
    output: output
  }
  slots.splice(newIndex, 0, slot)

  setupEditor()
}

function text() {
  const getExpr = function() {
    const text = editor.doc().get_content("text")
      .replace(/squareroot\(/g, "sqrt(")
      .replace(/absolutevalue\(/g, "abs(")
      .replace(/neg/g, "-")
      .replace(/text\(/g, "(")
    console.log("TCL: text -> text", text)
    const expr = nerdamer(text)
    if (nerdamer.tree(text).value === "=") {
      const definedVars = Object.keys(nerdamer.getVars())
      const freeVars = expr.variables()
        .filter((varName) =>
          !definedVars.includes(varName)
        )
      if (freeVars.length < 1) {
        return expr
      }
      const solution = nerdamer.solve(text, freeVars[0])
      return solution
    }
    return nerdamer(text)
  }
  compute(getExpr)
}

function latex() {
  const getExpr = function() {
    const latex = editor.doc().get_content("latex")
        .replace(/\\dfrac/g, "\\frac")
        .replace(/\\cdot/g, "*")
    console.log("TCL: latex", latex)
    return nerdamer.convertFromLaTeX(latex)
  }
  compute(getExpr);
}

function setConstants() {
  Object.entries(constants).forEach(([name, value]) => {
    nerdamer.setConstant(name, value)
  })
}

function resetVars() {
  // const vars = nerdamer.getVars("text")
  // nerdamer.clearVars()
  // Object.entries(vars)
  //   .filter(([name]) => name !== "#")
  //   .forEach(([name, value]) => {
  //   nerdamer.setVar(name, value)
  // })
  setConstants()
}

function compute(getExpr) {
  try {
    const expr = getExpr()
    if (expr.symbol !== undefined) {
      if (output.firstElementChild !== null) {
        output.firstElementChild.remove()
      }
      resetVars()
      const result = expr.evaluate()
      if (result !== undefined) {
        const outputStr = "= " + result.toTeX()
        katex.render(outputStr, output, { throwOnError: false })
      }
    } else {
      output.innerText = ""
    }
  } catch (err) {
    if (err instanceof TypeError) {
      output.innerText = ""
      return
    }
    output.innerText = ""
    const icon = document.createElement("i")
    icon.setAttribute("data-feather", "alert-octagon")
    output.appendChild(icon)
    feather.replace({
      width: "1.5em",
      height: "1.5em"
    })
    // tippy("#output" + slot.index, {
    //   content: "<span style=\"font-size: 1.3em\">" + err.toString() + "</span>"
    // })
  }
}

function insertAfter(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}