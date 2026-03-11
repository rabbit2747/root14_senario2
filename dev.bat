@echo off
cd /d "C:\Users\GOTROOT\Desktop\Gotroot_Edu"
rem --host 0.0.0.0 제거: 외부 네트워크 노출 차단 (localhost만 바인딩)
"C:\Program Files\nodejs\node.exe" "C:\Users\GOTROOT\Desktop\Gotroot_Edu\node_modules\vite\bin\vite.js" --port 5173 --host 127.0.0.1
