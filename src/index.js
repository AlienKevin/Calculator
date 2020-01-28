const input = document.getElementById("input");
let output = document.getElementById("output");

var g1 = new Guppy("input");
g1.event("change", function () {
  latex()
  // text()
});

function text() {
  try {
    const text = g1.doc().get_content("text")
    console.log("TCL: text -> text", text)
    const expr = nerdamer(text)
    if (expr !== undefined) {
      const result = expr.evaluate().toString();
      if (result !== undefined) {
        output.innerHTML = nerdamer.convertToLaTeX(result).toString()
      }
    }
  }
  catch (ignore) { }
}

function latex() {
  try {
    const latex = g1.doc().get_content("latex")
      .replace(/\\dfrac/g, "\\frac")
      .replace(/\\cdot/g, "*")
    console.log("TCL: latex", latex)
    const expr = nerdamer.convertFromLaTeX(latex)
    console.log("TCL: expr", expr)
    output = document.getElementById("output")
    if (expr.symbol !== undefined) {
      if (output.tagName === "svg") {
        output.remove()
        output = document.createElement("span")
        output.id = "output";
        insertAfter(output, input)
      }
      const result = expr.evaluate().toString();
      if (result !== undefined) {
        const outputStr = "= " + nerdamer.convertToLaTeX(result).toString()
        katex.render(outputStr, output, { throwOnError: false })
      }
    } else {
      output.innerText = ""
    }
  } catch (err) {
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