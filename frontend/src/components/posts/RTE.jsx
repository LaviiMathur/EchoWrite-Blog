import React from "react";
import { Editor } from "@tinymce/tinymce-react";

function RTE({ value = "", onChange }) {
  return (
    <Editor
      apiKey={import.meta.env.VITE_TINYMCE_KEY}
      value={value}
      onEditorChange={onChange}
      init={{
        height: 400,
        menubar: true,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "codesample",
          "fullscreen",
          "insertdatetime",
          "table",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo |  fontsizeinput  blocks | bold italic underline | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image | removeformat | help",
        fontsize_formats: "8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt",

        content_style: `
       
      `,
        paste_data_images: false,
      }}
    />
  );
}

export default RTE;
