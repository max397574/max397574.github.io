import { visit } from "unist-util-visit";

export function remarkCallouts() {
  return tree => {
    visit(tree, node => {
      if (node.value && node.value.includes("tldr"))
        console.log("PARSED AS:", node.type);

      // Accept ALL directive formats (container :::, leaf ::, and inline :)
      if (
        node.type !== "containerDirective" &&
        node.type !== "leafDirective" &&
        node.type !== "textDirective"
      ) {
        return;
      }

      const name = node.name.toLowerCase();

      const styles = {
        tldr: {
          title: "TL;DR",
          container: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500",
          titleColor: "text-emerald-900 dark:text-emerald-200",
        },
        properties: {
          title: "PROPERTIES",
          container: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500",
          titleColor: "text-emerald-900 dark:text-emerald-200",
        },
        note: {
          title: "NOTE",
          container: "bg-blue-50 dark:bg-blue-950/40 border-blue-500",
          titleColor: "text-blue-900 dark:text-blue-200",
        },
        warning: {
          title: "WARNING",
          container: "bg-amber-50 dark:bg-amber-950/40 border-amber-500",
          titleColor: "text-amber-900 dark:text-amber-200",
        },
        tip: {
          title: "TIP",
          container: "bg-sky-50 dark:bg-sky-950/40 border-sky-500",
          titleColor: "text-sky-900 dark:text-sky-200",
        },
        example: {
          title: "Example",
          container: "bg-sky-50 dark:bg-sky-950/40 border-sky-500",
          titleColor: "text-sky-900 dark:text-sky-200",
        },
      };

      const config = styles[name];
      if (!config) return;

      // Force node to render as a styled HTML <div>
      const data = node.data || (node.data = {});
      data.hName = "div";
      data.hProperties = {
        class: `my-6 p-4 rounded-xl border-l-4 shadow-sm transition-all ${config.container} not-prose`,
      };

      // Create the title element
      const headerNode = {
        type: "paragraph",
        data: {
          hName: "div",
          hProperties: { class: `font-bold mb-1 ${config.titleColor}` },
        },
        children: [{ type: "text", value: config.title }],
      };

      // Prepend header to node children
      node.children = node.children || [];
      node.children.unshift(headerNode);
    });
  };
}
