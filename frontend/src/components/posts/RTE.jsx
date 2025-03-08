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
          "code",
          "fullscreen",
          "insertdatetime",
          "table",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | bold italic underline | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image | removeformat | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; direction: ltr; }",

        paste_data_images: false,
      }}
    />
  );
}

export default RTE;
