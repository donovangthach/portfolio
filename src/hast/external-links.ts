import { defineHastPlugin } from "satteri";

// Opens Markdown links to other sites in a new tab, with the same
// arrow and screen reader text as the header links.
export const externalLinks = defineHastPlugin({
  name: "external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const href = node.properties.href;
      if (typeof href !== "string" || !href.startsWith("http")) return;

      ctx.setProperty(node, "target", "_blank");
      ctx.setProperty(node, "rel", "noopener noreferrer");
      ctx.appendChild(node, {
        type: "element",
        tagName: "span",
        properties: { ariaHidden: "true", className: ["ml-0.5"] },
        children: [{ type: "text", value: "x" }],
      });
      ctx.appendChild(node, {
        type: "element",
        tagName: "span",
        properties: { className: ["sr-only"] },
        children: [{ type: "text", value: " (opens in a new tab)" }],
      });
    },
  },
});
