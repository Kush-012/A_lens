import React from 'react';

export default function JsonViewer({ data }) {
  if (data === undefined) return <span className="text-gray-500">undefined</span>;
  if (data === null) return <span className="text-gray-500">null</span>;

  let jsonStr = "";
  try {
    jsonStr = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  } catch (e) {
    jsonStr = String(data);
  }

  // A simple regex replacement for basic syntax highlighting in JSON
  const formatJson = (json) => {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = "text-yellow-300"; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-blue-300 font-semibold"; // key
        } else {
          cls = "text-green-400"; // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-purple-400 font-bold"; // boolean
      } else if (/null/.test(match)) {
        cls = "text-gray-400 italic"; // null
      }
      return `<span class="${cls}">${match}</span>`;
    });
  };

  return (
    <pre 
      className="text-[11px] font-mono whitespace-pre-wrap break-all leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formatJson(jsonStr) }}
    />
  );
}
