const input = document.getElementById("input");
let output = document.getElementById("output");

const constants = {
  g : 9.81,
  G : 6.67430e-11,
  k : 9.0e9
}

var g1 = new Guppy("input");
g1.configure("empty_content", "\\color{grey}{\\text{Type math here...}}")
g1.event("change", function () {
  // latex()
  text()
});

function text() {
  const getExpr = function() {
    const text = g1.doc().get_content("text")
      .replace(/squareroot\(/g, "sqrt(")
      .replace(/absolutevalue\(/g, "abs(")
      .replace(/neg/g, "-")
      .replace(/text\(/g, "(")
    console.log("TCL: text -> text", text)
    return nerdamer(text)
  }
  compute(getExpr)
}

function latex() {
  const getExpr = function() {
    const latex = g1.doc().get_content("latex")
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
  nerdamer.clearVars()
  setConstants()
}

function compute(getExpr) {
  try {
    const expr = getExpr()
    output = document.getElementById("output")
    if (expr.symbol !== undefined) {
      if (output.tagName === "svg") {
        output.remove()
        output = document.createElement("span")
        output.id = "output";
        insertAfter(output, input)
      }
      resetVars()
      const result = expr.evaluate().toString();
      if (result !== undefined) {
        const outputStr = "= " + nerdamer.convertToLaTeX(result).toString()
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
    output.setAttribute("data-feather", "alert-octagon")
    feather.replace({
      width: "1.5em",
      height: "1.5em"
    })
    tippy("#output", {
      content: "<span style=\"font-size: 1.3em\">" + err.toString() + "</span>"
    })
  }
}

function insertAfter(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}