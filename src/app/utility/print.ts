// utils/print.ts
type PrintOptions = {
  title?: string;
  css?: string;     // 추가 스타일(선택)
  bodyHtml: string; // <body> 안에 들어갈 마크업
};

const BASE_CSS = `
  @page { size: A4 portrait; margin: 12mm; }
  html, body { height: auto; }
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, pretendard, sans-serif; color:#111; }
  .print-root { max-width: 700px; margin: 0 auto; }
  .h1 { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
  .muted { color:#6b7280; font-size:12px; }
  .row { display:flex; justify-content:space-between; gap:12px; }
  .card { border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin:8px 0; }
  img { max-width:100%; height:auto; display:block; }
`;

export function openPrintSafe({ title, css, bodyHtml }: PrintOptions) {
  // 완전한 HTML 문서 생성 (onload에서 이미지 로딩 후 자동 인쇄)
  const fullHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title ?? "Print"}</title>
  <base href="${location.origin}/" />
  <style>${BASE_CSS}${css ?? ""}</style>
</head>
<body>
  <div class="print-root">${bodyHtml}</div>
  <script>
    (function() {
      function whenImagesReady() {
        var imgs = Array.prototype.slice.call(document.images || []);
        if (imgs.length === 0) return Promise.resolve();
        return Promise.all(imgs.map(function(img){
          if (img.complete) return Promise.resolve();
          return new Promise(function(res){
            img.onload = function(){ res(); };
            img.onerror = function(){ res(); };
          });
        }));
      }
      function triggerPrint() {
        try { window.focus(); } catch (e) {}
        try { window.print(); } catch (e) {}
      }
      if (document.readyState === 'complete') {
        whenImagesReady().then(triggerPrint);
      } else {
        window.addEventListener('load', function(){
          whenImagesReady().then(triggerPrint);
        });
      }
    })();
  <\/script>
</body>
</html>`;

  // 항상 Blob URL로 새 탭 열기 (상대 경로 리소스도 base로 해결)
  const blob = new Blob([fullHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (popup) {
    alert("팝업이 차단되었습니다. 이 사이트의 팝업을 허용해주세요.");
  }
}
