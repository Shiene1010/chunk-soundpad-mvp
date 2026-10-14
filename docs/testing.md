# 테스트 런북

## 1. 문법: `node --check app.js`
## 2. 콘솔: 헤드리스 덤프 + `CONSOLE` grep (앱 에러 0; GPU/CVDisplayLink 노이즈 제외)
```sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
python3 -m http.server 81XX --directory . &
"$CHROME" --headless=new --disable-gpu --no-sandbox --enable-logging=stderr --v=0 \
  --virtual-time-budget=3000 --dump-dom http://localhost:81XX/index.html 2>err.log >dom.html
grep -i -E "CONSOLE.*(Uncaught|Error)" err.log
```
## 3. 상호작용·로드: CDP 실측 (가상시간 금지)
```sh
"$CHROME" --headless=new --disable-gpu --no-sandbox \
  --remote-debugging-port=92XX --user-data-dir=/tmp/cdp-x http://localhost:81XX/index.html &
# node WebSocket(CDP) → Runtime.evaluate 클릭·판독. 예시는 /tmp/cdp-*.mjs 패턴 참고.
```
- STT/TTS 스텁: 테스트 복사본(`/tmp`에만)에 `speechSynthesis` 무력화 주입 후 클릭 시나리오.
- 판정: pass 카운트·톤 수·클래스 토글·저장소 키를 DOM/LS로 직접 확인.
## 4. 게이트: `agents_check.py` DRIFT 0 → 커밋·푸시 → `:8080`/`Pages` 200.
