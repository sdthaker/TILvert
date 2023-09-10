import { FileIO, TILvertHTMLDocument } from "./index";

export default async function processFile(
  path: string,
  title: string = "",
  stylesheet: string | null,
  outputPath: string,
  extension: string,
  meta?: Array<{ key: string; value: string | boolean | null | undefined }>,
  fileOnly: boolean = false
) {
  const htmlDoc = new TILvertHTMLDocument();

  const data = await FileIO.readFile(path);
  if (!data) {
    console.error("Error: Unable to read file.");
    process.exit(1);
  }
  const segments = data.split(/\r?\n\r?\n/);

  if (!title && segments[1].match(/^\r?\n/)) {
    title = segments[0].replace(/\r?\n/, "");
    segments.shift();
  } else if (!title) {
    title = path.split("/").pop()?.split(".")[0] ?? "Untitled";
  }
  htmlDoc.appendToHead(TILvertHTMLDocument.createTag("title", title));
  htmlDoc.appendToBody(TILvertHTMLDocument.createTag("h1", title));

  if (stylesheet) {
    htmlDoc.appendToHead(
      TILvertHTMLDocument.createTag("link", "", {
        rel: "stylesheet",
        href: stylesheet as string,
        type: "text/css",
      })
    );
  }

  meta?.forEach((tag) => {
    if (tag.value) {
      htmlDoc.appendToHead(
        TILvertHTMLDocument.createTag("meta", "", {
          name: tag.key,
          content: tag.value,
        })
      );
    }
  });

  segments.forEach((segment) => {
    htmlDoc.appendToBody(
      TILvertHTMLDocument.createTag("p", segment.replace(/\n|\r/, ""))
    );
  });

  if (fileOnly) {
    path = path.split("/").pop() as string;
  }

  path = path.replace(new RegExp(`.${extension}$`, "i"), ".html");

  const written = await FileIO.writeFile(
    FileIO.join(outputPath, path),
    htmlDoc.renderHTML()
  );

  if (!written) {
    console.error(
      `Error: Unable to write file. ${FileIO.join(outputPath, path)}`
    );
  }
}